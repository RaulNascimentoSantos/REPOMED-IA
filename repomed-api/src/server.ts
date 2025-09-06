import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import { config } from './config/index';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { metricsCollector } from './middleware/metrics';
import { join } from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from './db/index';
import { documents, templates, shares, auditLogs, users, patients } from './db/schema';
import { eq, desc } from 'drizzle-orm';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { registerTemplateRoutes } from './routes/templates';
// import { registerSignatureRoutes } from './routes/signatures';
// import { registerCid10Routes } from './routes/cid10';
// import { registerMedicationsRoutes } from './routes/medications';
import { crmValidationService } from './services/CrmValidation';

// ====== CONFIGURAÇÃO FASTIFY ======
const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true,
      },
    },
  },
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'reqId',
  genReqId: () => `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
});

// Error handler
server.setErrorHandler(errorHandler);

// ====== PLUGINS REGISTRATION ======
const registerPlugins = async () => {
  // Security (helmet temporariamente desabilitado por incompatibilidade de versão)
  // await server.register(helmet, {
  //   contentSecurityPolicy: {
  //     directives: {
  //       defaultSrc: ["'self'"],
  //       styleSrc: ["'self'", "'unsafe-inline'"],
  //       scriptSrc: ["'self'", "'unsafe-inline'"],
  //       imgSrc: ["'self'", "data:", "https:"],
  //     },
  //   },
  // });

  // CORS manual
  server.addHook('preHandler', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    reply.header('Access-Control-Allow-Credentials', 'true');
    
    if (request.method === 'OPTIONS') {
      reply.status(200).send();
    }
  });

  // JWT
  await server.register(jwt, {
    secret: config.security.jwtSecret,
    sign: {
      expiresIn: config.security.jwtExpiresIn,
    },
  });

  // Rate limiting (temporariamente desabilitado por incompatibilidade de versão)
  // await server.register(rateLimit, {
  //   max: REPOMED_CONFIG.security.rateLimitMax,
  //   timeWindow: REPOMED_CONFIG.security.rateLimitWindow,
  // });

  // Compression (temporariamente desabilitado por incompatibilidade de versão)
  // await server.register(compress, {
  //   global: true,
  //   threshold: 1024,
  //   encodings: ['gzip', 'deflate'],
  // });

  // File upload (temporariamente desabilitado por incompatibilidade de versão)
  // await server.register(multipart, {
  //   limits: {
  //     fileSize: 10 * 1024 * 1024, // 10MB
  //     files: 10,
  //   },
  // });

  // Metrics
  server.addHook('onRequest', async (request, reply) => {
    await requestLogger(request, reply);
  });
  server.addHook('onResponse', metricsCollector);

  // Static files seria registrado aqui se necessário

  // Swagger documentation
  await server.register(swagger, {
    swagger: {
      info: {
        title: 'RepoMed IA API',
        description: 'Sistema médico completo com assinatura digital',
        version: '1.0.0'
      },
      host: 'localhost:8090',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      }
    }
  });

  await server.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    }
  });
};

// ====== AUTHENTICATION MIDDLEWARE ======
server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' });
  }
});

// ====== AUTHORIZATION MIDDLEWARE ======
server.decorate('authorize', (roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    if (roles.length > 0 && !roles.includes((request.user as any).role)) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
  };
});

// ====== VALIDATION SCHEMAS ======
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  crm: z.string().min(4, 'CRM inválido'),
  uf: z.string().length(2, 'UF deve ter 2 caracteres'),
});

const patientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['M', 'F', 'Outro']).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
});

// ====== HELPER FUNCTIONS ======
function generateDocumentHash(data: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ====== ROUTES ======
const registerRoutes = async () => {
  // Root endpoint
  server.get('/', async () => {
    return { 
      name: 'RepoMed IA API',
      version: '4.0.0',
      status: 'Running',
      documentation: '/documentation',
      health: '/health',
      endpoints: {
        auth: {
          login: 'POST /api/auth/login',
          register: 'POST /api/auth/register',
          refresh: 'POST /api/auth/refresh',
          logout: 'POST /api/auth/logout'
        },
        resources: {
          patients: 'GET /api/patients',
          documents: 'GET /api/documents',
          templates: 'GET /api/templates'
        }
      }
    };
  });

  // Health check
  server.get('/health', async () => {
    return { 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    };
  });

  // ====== AUTH ROUTES ======
  server.post('/api/auth/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body);
      
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, body.email));
      if (existingUser.length > 0) {
        return reply.status(409).send({
          error: 'User already exists',
          message: 'Este email já está cadastrado no sistema.'
        });
      }

      // Validate CRM format first
      const formatValidation = crmValidationService.validateCRMFormat(body.crm, body.uf);
      if (!formatValidation.isValid) {
        return reply.status(400).send({
          error: 'Invalid CRM format',
          message: formatValidation.error
        });
      }

      // Validate CRM with CFM
      const crmValidation = await crmValidationService.validateCRMWithCache(body.crm, body.uf);
      if (!crmValidation.isValid) {
        return reply.status(400).send({
          error: 'Invalid CRM',
          message: crmValidation.error || 'CRM não encontrado ou inativo no CFM'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(body.password, 10);
      
      // Create user with CRM data
      const newUser = await db.insert(users).values({
        id: uuidv4(),
        name: body.name,
        email: body.email,
        password: hashedPassword,
        crm: body.crm,
        uf: body.uf,
        role: 'medico',
        isActive: true,
        crmValidatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      const user = newUser[0];

      // Generate access token
      const token = server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        crm: user.crm || undefined,
        organizationId: user.organizationId || undefined
      }, { expiresIn: '24h' });

      // Generate refresh token
      const refreshToken = server.jwt.sign({
        id: user.id,
        email: user.email,
        type: 'refresh'
      } as any, { expiresIn: '7d' });
      
      return {
        success: true,
        token,
        refreshToken,
        expiresIn: 86400, // 24h in seconds
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          crm: user.crm || undefined,
          uf: user.uf,
          crmValidated: true
        }
      };
    } catch (error: any) {
      if (error.issues) {
        return reply.status(400).send({
          error: 'Validation failed',
          message: error.issues.map((i: any) => i.message).join(', ')
        });
      }
      
      server.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Erro ao criar usuário'
      });
    }
  });

  server.post('/api/auth/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);
      
      // Find user
      const userResult = await db.select().from(users).where(eq(users.email, body.email));
      
      if (userResult.length === 0) {
        return reply.status(401).send({
          error: 'Invalid credentials',
          message: 'Email ou senha inválidos'
        });
      }

      const user = userResult[0];

      // Check if user is active
      if (!user.isActive) {
        return reply.status(401).send({
          error: 'Account disabled',
          message: 'Conta desativada. Entre em contato com o suporte.'
        });
      }
      
      // Check password
      const validPassword = await bcrypt.compare(body.password, user.password);
      if (!validPassword) {
        return reply.status(401).send({
          error: 'Invalid credentials',
          message: 'Email ou senha inválidos'
        });
      }

      // Update last login
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));
      
      // Generate access token
      const token = server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        crm: user.crm || undefined,
        organizationId: user.organizationId || undefined
      }, { expiresIn: '24h' });

      // Generate refresh token
      const refreshToken = server.jwt.sign({
        id: user.id,
        email: user.email,
        type: 'refresh'
      } as any, { expiresIn: '7d' });
      
      return {
        success: true,
        token,
        refreshToken,
        expiresIn: 86400, // 24h in seconds
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          crm: user.crm || undefined,
          uf: user.uf,
          crmValidated: !!user.crmValidatedAt,
          lastLogin: user.lastLoginAt
        }
      };
    } catch (error: any) {
      if (error.issues) {
        return reply.status(400).send({
          error: 'Validation failed',
          message: error.issues.map((i: any) => i.message).join(', ')
        });
      }
      
      server.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Erro no login'
      });
    }
  });

  // Refresh token route
  server.post('/api/auth/refresh', async (request, reply) => {
    try {
      const { refreshToken } = request.body as any;
      
      if (!refreshToken) {
        return reply.status(400).send({
          error: 'Missing refresh token',
          message: 'Refresh token é obrigatório'
        });
      }

      // Verify refresh token
      const decoded = server.jwt.verify(refreshToken) as any;
      
      if (decoded.type !== 'refresh') {
        return reply.status(401).send({
          error: 'Invalid token type',
          message: 'Token inválido'
        });
      }

      // Get user
      const userResult = await db.select().from(users).where(eq(users.id, decoded.id));
      
      if (userResult.length === 0 || !userResult[0].isActive) {
        return reply.status(401).send({
          error: 'User not found or inactive',
          message: 'Usuário não encontrado ou inativo'
        });
      }

      const user = userResult[0];

      // Generate new access token
      const newToken = server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        crm: user.crm || undefined,
        organizationId: user.organizationId || undefined
      }, { expiresIn: '24h' });

      return {
        success: true,
        token: newToken,
        expiresIn: 86400
      };

    } catch (error) {
      return reply.status(401).send({
        error: 'Invalid refresh token',
        message: 'Refresh token inválido ou expirado'
      });
    }
  });

  // Logout route (optional - invalidates refresh token on client)
  server.post('/api/auth/logout', { preHandler: server.authenticate }, async (request, reply) => {
    // In a real app, you might want to blacklist the refresh token
    // For now, we'll just return success (client should remove tokens)
    return {
      success: true,
      message: 'Logout realizado com sucesso'
    };
  });

  // ====== PROTECTED ROUTES ======
  server.get('/api/me', { preHandler: server.authenticate }, async (request) => {
    return { 
      success: true,
      user: request.user 
    };
  });

  // ====== DOCUMENTS ROUTES ======
  server.get('/api/documents', { preHandler: server.authenticate }, async (request) => {
    const docs = await db.select().from(documents).limit(50);
    return { documents: docs };
  });

  server.post('/api/documents', { preHandler: server.authenticate }, async (request, reply) => {
    try {
      const body = request.body as any;
      const userInfo = request.user as any;
      
      // Get template if provided
      let template = null;
      if (body.templateId) {
        const templateResult = await db.select().from(templates).where(eq(templates.id, body.templateId));
        if (templateResult.length === 0) {
          return reply.status(404).send({ 
            error: 'Template not found',
            message: 'Template especificado não foi encontrado' 
          });
        }
        template = templateResult[0];
      }

      // Generate document content if template exists
      let content = body.content || '';
      let title = body.title || 'Documento Médico';
      
      if (template) {
        title = `${template.name} - ${body.patient?.name || 'Paciente'}`;
        
        // Replace template variables with actual values
        content = template.content;
        
        // Replace patient data
        if (body.patient) {
          content = content.replace(/{{patient\.name}}/g, body.patient.name || '');
          content = content.replace(/{{patient\.cpf}}/g, body.patient.cpf || '');
        }
        
        // Replace field data
        if (body.fields) {
          Object.entries(body.fields).forEach(([key, value]) => {
            content = content.replace(new RegExp(`{{fields\\.${key}}}`, 'g'), value || '');
          });
        }
        
        // Replace doctor data
        content = content.replace(/{{doctor\.name}}/g, userInfo.name || '');
        content = content.replace(/{{doctor\.crm}}/g, userInfo.crm || '');
        content = content.replace(/{{date}}/g, new Date().toLocaleDateString('pt-BR'));
      }
      
      const newDoc = await db.insert(documents).values({
        id: uuidv4(),
        title,
        content,
        hash: generateDocumentHash({ content, templateId: body.templateId, patient: body.patient, fields: body.fields }),
        createdAt: new Date(),
        isSigned: false
      }).returning();

      return reply.status(201).send({
        success: true,
        data: newDoc[0],
        message: 'Documento criado com sucesso!'
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ 
        error: 'Failed to create document',
        message: 'Erro ao criar documento' 
      });
    }
  });

  // ====== PATIENTS ROUTES ======
  // Get all patients
  server.get('/api/patients', {
    preHandler: [server.authenticate]
  }, async (request, reply) => {
    try {
      const userInfo = request.user as any;
      const allPatients = await db.select().from(patients).where(eq(patients.createdBy, userInfo.id)).orderBy(desc(patients.createdAt));
      
      return reply.send({
        success: true,
        data: allPatients,
        total: allPatients.length
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch patients' });
    }
  });

  // Get patient by ID
  server.get('/api/patients/:id', {
    preHandler: [server.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userInfo = request.user as any;
      
      const patient = await db.select().from(patients).where(eq(patients.id, id));
      
      if (patient.length === 0) {
        return reply.status(404).send({ error: 'Patient not found' });
      }

      // Check if patient belongs to current user
      if (patient[0].createdBy !== userInfo.id) {
        return reply.status(403).send({ error: 'Forbidden' });
      }
      
      return reply.send({
        success: true,
        data: patient[0]
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch patient' });
    }
  });

  // Create new patient
  server.post('/api/patients', {
    preHandler: [server.authenticate]
  }, async (request, reply) => {
    try {
      const body = patientSchema.parse(request.body);
      const userInfo = request.user as any;
      
      const newPatient = await db.insert(patients).values({
        id: uuidv4(),
        name: body.name,
        cpf: body.cpf,
        rg: body.rg,
        birthDate: body.birthDate || null,
        gender: body.gender,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        emergencyContactName: body.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone,
        medicalHistory: body.medicalHistory,
        allergies: body.allergies,
        medications: body.medications,
        organizationId: userInfo.organizationId,
        createdBy: userInfo.id,
      }).returning();

      return reply.status(201).send({
        success: true,
        data: newPatient[0],
        message: 'Paciente criado com sucesso!'
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to create patient' });
    }
  });

  // Update patient
  server.put('/api/patients/:id', {
    preHandler: [server.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = patientSchema.parse(request.body);
      const userInfo = request.user as any;
      
      // Check if patient exists and belongs to user
      const existingPatient = await db.select().from(patients).where(eq(patients.id, id));
      if (existingPatient.length === 0) {
        return reply.status(404).send({ error: 'Patient not found' });
      }
      
      if (existingPatient[0].createdBy !== userInfo.id) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const updatedPatient = await db.update(patients)
        .set({
          name: body.name,
          cpf: body.cpf,
          rg: body.rg,
          birthDate: body.birthDate || null,
          gender: body.gender,
          phone: body.phone,
          email: body.email,
          address: body.address,
          city: body.city,
          state: body.state,
          zipCode: body.zipCode,
          emergencyContactName: body.emergencyContactName,
          emergencyContactPhone: body.emergencyContactPhone,
          medicalHistory: body.medicalHistory,
          allergies: body.allergies,
          medications: body.medications,
          updatedAt: new Date(),
        })
        .where(eq(patients.id, id))
        .returning();

      return reply.send({
        success: true,
        data: updatedPatient[0],
        message: 'Paciente atualizado com sucesso!'
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to update patient' });
    }
  });

  // Delete patient
  server.delete('/api/patients/:id', {
    preHandler: [server.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userInfo = request.user as any;
      
      // Check if patient exists and belongs to user
      const existingPatient = await db.select().from(patients).where(eq(patients.id, id));
      if (existingPatient.length === 0) {
        return reply.status(404).send({ error: 'Patient not found' });
      }
      
      if (existingPatient[0].createdBy !== userInfo.id) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      await db.delete(patients).where(eq(patients.id, id));

      return reply.send({
        success: true,
        message: 'Paciente excluído com sucesso!'
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to delete patient' });
    }
  });

  // ====== TEMPLATES ROUTES ======
  await registerTemplateRoutes(server);
  
  // ====== METRICS ROUTES ======
  server.get('/api/metrics/dashboard', { preHandler: server.authenticate }, async (request, reply) => {
    try {
      const userInfo = request.user as any;
      
      // Get counts from database
      const totalDocs = await db.select().from(documents).where(eq(documents.createdBy, userInfo.id));
      const signedDocs = totalDocs.filter(doc => doc.isSigned);
      const pendingDocs = totalDocs.filter(doc => !doc.isSigned);
      const allPatients = await db.select().from(patients).where(eq(patients.createdBy, userInfo.id));
      
      return {
        success: true,
        totalDocuments: totalDocs.length,
        signedDocuments: signedDocs.length,
        pendingDocuments: pendingDocs.length,
        activePatients: allPatients.length,
        growthRate: 0 // Could be calculated based on date ranges
      };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Failed to get dashboard metrics' });
    }
  });

  server.get('/api/performance/report', { preHandler: server.authenticate }, async (request, reply) => {
    return {
      success: true,
      summary: {
        averageResponseTime: 120,
        errorRate: 0.01
      }
    };
  });

  server.get('/api/performance/cache/stats', { preHandler: server.authenticate }, async (request, reply) => {
    return {
      success: true,
      totalKeys: 0,
      memoryUsed: '0MB',
      connected: false
    };
  });
  
  // ====== SIGNATURE ROUTES ======
  // await registerSignatureRoutes(server);
  
  // ====== CID-10 ROUTES ======
  // await registerCid10Routes(server);
  
  // ====== MEDICATIONS ROUTES ======
  // await registerMedicationsRoutes(server);
};

// ====== STARTUP ======
const start = async () => {
  try {
    await registerPlugins();
    await registerRoutes();
    
    await server.listen({ port: config.server.port, host: config.server.host });
    
    server.log.info(`🚀 RepoMed IA API está rodando em http://localhost:${config.server.port}`);
    server.log.info(`📚 Documentação: http://localhost:${config.server.port}/documentation`);
    
  } catch (err) {
    server.log.error(err as Error);
    process.exit(1);
  }
};

// ====== ERROR HANDLING ======
process.on('unhandledRejection', (reason, promise) => {
  server.log.error({ reason, promise }, 'Unhandled Rejection');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  server.log.error({ error }, 'Uncaught Exception');
  process.exit(1);
});

// ====== GRACEFUL SHUTDOWN ======
const gracefulShutdown = async (signal: string) => {
  server.log.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    await server.close();
    server.log.info('Server closed successfully');
    process.exit(0);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server if this file is run directly
if (require.main === module) {
  start();
}

export default server;
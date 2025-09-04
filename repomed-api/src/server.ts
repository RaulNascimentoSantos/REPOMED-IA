import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import { join } from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from './db';
import { documents, templates, shares, auditLogs, users } from './db/schema';
import { eq, desc, and } from 'drizzle-orm';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { registerTemplateRoutes } from './routes/templates';
import { registerPatientRoutes } from './routes/patients.js';
import { registerPrescriptionRoutes } from './routes/prescriptions.js';
import { registerMetricsRoutes } from './routes/metrics.js';
import { registerUploadRoutes } from './routes/upload.js';
import { registerSignatureRoutes } from './routes/signatures.js';
import { registerPerformanceRoutes } from './routes/performance';
import { setupErrorHandling } from './middleware/error-handler';
import { setupZodValidation } from './middleware/zod-validator';
import { PDFService } from './services/pdf.service';
import { cacheService } from './services/cache.service';
import { encryptionService } from './services/EncryptionService';
import { tenantIsolation } from './middleware/tenant-isolation';

// ====== CONFIGURAÇÃO FASTIFY ======
const fastify = Fastify({
  logger: true,
  bodyLimit: 10485760 // 10MB
});

// ====== PLUGINS ======
const registerPlugins = async () => {
  await fastify.register(cors, {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3008', 'http://localhost:3021', 'http://localhost:3022', 'http://localhost:3023'],
    credentials: true
  });

  await fastify.register(multipart);

  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'RepoMed API',
        description: 'API for RepoMed IA',
        version: '1.0.0'
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      host: 'localhost:8080',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json']
    }
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
  });

  // Security Headers Middleware
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // ... (security headers as before)
  });

  await fastify.register(staticFiles, {
    root: join(__dirname, 'public'),
    prefix: '/public/'
  });
};

// ====== HELPER FUNCTIONS ======
function generateDocumentHash(data: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function generateQRCode(data: string): Promise<string> {
  return await QRCode.toDataURL(data);
}

// ====== AUTHENTICATION MIDDLEWARE ======
const JWT_SECRET = process.env.JWT_SECRET || 'repomed-dev-secret-key';

fastify.decorate('authenticate', async function(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = (request.headers.authorization as string)?.replace('Bearer ', '');
    if (!token) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Token de autenticação é obrigatório.',
        instance: request.url,
        traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    (request as any).user = decoded;
  } catch (err) {
    return reply.status(401).send({
      type: '/errors/invalid-token',
      title: 'Invalid Token',
      status: 401,
      detail: 'Token de autenticação inválido ou expirado.',
      instance: request.url,
      traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  }
});

fastify.decorate('authorize', (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      return reply.status(403).send({
        type: '/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: 'Você não tem permissão para acessar este recurso.',
        instance: request.url,
        traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
    }
  };
});

// ====== ROUTES ======
const registerRoutes = () => {

  // Root route
  fastify.get('/', async (request, reply) => {
    return { 
      name: 'RepoMed IA API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      documentation: '/documentation'
    };
  });

  // Health check
  fastify.get('/health', async (request, reply) => {
    try {
      await db.select().from(users).limit(1);
      return {
        ok: true,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          api: 'running',
          database: 'running',
          templates: 'loaded'
        }
      };
    } catch (error) {
      return {
        ok: false,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          api: 'running',
          database: 'error',
          templates: 'loaded'
        }
      };
    }
  });

  // ====== AUTENTICAÇÃO RFC 7807 ======
  const loginSchema = z.object({
    email: z.string().email('Email deve ter um formato válido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
  });

  fastify.post('/api/auth/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);
      
      const user = await db.select().from(users).where(eq(users.email, email)).then(res => res[0]);

      if (!user) {
        return reply.status(401).send({
          type: '/errors/invalid-credentials',
          title: 'Invalid Credentials',
          status: 401,
          detail: 'Email ou senha incorretos. Tente novamente.',
          instance: '/api/auth/login',
          traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return reply.status(401).send({
          type: '/errors/invalid-credentials',
          title: 'Invalid Credentials',
          status: 401,
          detail: 'Email ou senha incorretos. Tente novamente.',
          instance: '/api/auth/login',
          traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
      
      // Gerar token JWT
      const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          crm: user.crm, 
          role: user.role,
          organizationId: user.organizationId
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          crm: user.crm,
          role: user.role
        }
      };
    } catch (error: any) {
      if (error.issues) {
        return reply.status(400).send({
          type: '/errors/validation-failed',
          title: 'Validation Failed',
          status: 400,
          detail: error.issues.map((i: any) => i.message).join(', '),
          instance: '/api/auth/login',
          traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
      throw error;
    }
  });
  
  // Endpoint para validar token
  fastify.get('/api/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    return (request as any).user;
  });
  
  // Endpoint de registro (básico)
  const registerSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email deve ter um formato válido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    crm: z.string().optional()
  });
  
  fastify.post('/api/auth/register', async (request, reply) => {
    try {
      const { name, email, password, crm } = registerSchema.parse(request.body);
      
      const existingUser = await db.select().from(users).where(eq(users.email, email)).then(res => res[0]);

      if (existingUser) {
        return reply.status(409).send({
          type: '/errors/user-exists',
          title: 'User Already Exists',
          status: 409,
          detail: 'Este email já está cadastrado no sistema.',
          instance: '/api/auth/register',
          traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await db.insert(users).values({
        name,
        email,
        password: hashedPassword,
        crm: crm || null,
        role: 'medico'
      }).returning();

      const user = newUser[0];

      const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          crm: user.crm, 
          role: user.role,
          organizationId: user.organizationId
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          crm: user.crm,
          role: user.role
        }
      };
    } catch (error: any) {
      if (error.issues) {
        return reply.status(400).send({
          type: '/errors/validation-failed',
          title: 'Validation Failed',
          status: 400,
          detail: error.issues.map((i: any) => i.message).join(', '),
          instance: '/api/auth/register',
          traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
      throw error;
    }
  });

  // ====== USERS CRUD ======
  fastify.get('/api/users', { preHandler: [fastify.authenticate, (fastify as any).authorize(['admin'])] }, async (request, reply) => {
    const allUsers = await db.select().from(users);
    return allUsers;
  });

  fastify.get('/api/users/:id', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const user = (request as any).user;

    if (user.role !== 'admin' && user.id !== params.id) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const targetUser = await db.select().from(users).where(eq(users.id, params.id)).then(res => res[0]);

    if (!targetUser) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return targetUser;
  });

  const updateUserSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
    email: z.string().email('Email deve ter um formato válido').optional(),
    crm: z.string().optional(),
    role: z.string().optional()
  });

  fastify.put('/api/users/:id', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const user = (request as any).user;

    if (user.role !== 'admin' && user.id !== params.id) {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const validation = updateUserSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send(validation.error.format());
    }

    const updatedUser = await db.update(users).set(validation.data).where(eq(users.id, params.id)).returning();

    return updatedUser[0];
  });

  fastify.delete('/api/users/:id', { preHandler: [fastify.authenticate, (fastify as any).authorize(['admin'])] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    await db.delete(users).where(eq(users.id, params.id));
    return { message: 'User deleted successfully' };
  });

  // Register template routes
  registerTemplateRoutes(fastify);

  // Register patient routes
  registerPatientRoutes(fastify);

  // Register prescription routes
  registerPrescriptionRoutes(fastify);

  // Register metrics routes
  registerMetricsRoutes(fastify);

  // Register upload routes
  registerUploadRoutes(fastify);

  // Register signature routes
  registerSignatureRoutes(fastify);

  // Register performance routes
  registerPerformanceRoutes(fastify);

  const createTemplateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    fields: z.array(z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(['text','number','date','select']).default('text')
    })).default([])
  });
  fastify.post('/api/templates', { preHandler: [fastify.authenticate, tenantIsolation] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const validation = createTemplateSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send(validation.error.format());
    }
    const templateData = {
      id: uuidv4(),
      name: validation.data.name,
      description: validation.data.description,
      fields: JSON.stringify(validation.data.fields),
      organizationId: (request as any).organizationId
    };
    const result = await db.insert(templates).values(templateData).returning();
    return result[0];
  });

  // DOCUMENTS
  fastify.get('/api/documents', { preHandler: [fastify.authenticate, tenantIsolation], schema: { tags: ['documents'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const organizationId = (request as any).organizationId;
    // Cache da lista de documentos por 5 minutos
    const cacheKey = `documents:list:${organizationId}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      reply.header('X-Cache', 'HIT');
      return cached.map((doc: any) => ({
        ...doc,
        patientName: encryptionService.decrypt(doc.patientName),
        doctorName: encryptionService.decrypt(doc.doctorName),
        doctorCrm: encryptionService.decrypt(doc.doctorCrm),
        content: JSON.parse(encryptionService.decrypt(doc.content)),
        dataJson: JSON.parse(encryptionService.decrypt(doc.dataJson))
      }));
    }

    const result = await db.select().from(documents).where(eq(documents.organizationId, organizationId)).orderBy(desc(documents.createdAt));
    
    const decryptedResult = result.map((doc: any) => ({
      ...doc,
      patientName: encryptionService.decrypt(doc.patientName),
      doctorName: encryptionService.decrypt(doc.doctorName),
      doctorCrm: encryptionService.decrypt(doc.doctorCrm),
      content: JSON.parse(encryptionService.decrypt(doc.content)),
      dataJson: JSON.parse(encryptionService.decrypt(doc.dataJson))
    }));

    // Cache por 5 minutos
    await cacheService.set(cacheKey, decryptedResult, 'short');
    reply.header('X-Cache', 'MISS');
    
    return decryptedResult;
  });

  fastify.get('/api/documents/:id', { preHandler: [fastify.authenticate, tenantIsolation], schema: { tags: ['documents'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const organizationId = (request as any).organizationId;
    const result = await db.select().from(documents).where(and(eq(documents.id, params.id), eq(documents.organizationId, organizationId)));
    if (!result.length) {
      reply.code(404).send({ error: 'Document not found' });
      return;
    }
    const doc = result[0];
    return {
      ...doc,
      patientName: encryptionService.decrypt(doc.patientName),
      doctorName: encryptionService.decrypt(doc.doctorName),
      doctorCrm: encryptionService.decrypt(doc.doctorCrm),
      content: JSON.parse(encryptionService.decrypt(doc.content)),
      dataJson: JSON.parse(encryptionService.decrypt(doc.dataJson))
    };
  });

  const createDocumentSchema = z.object({
    templateId: z.string(),
    title: z.string().min(1),
    content: z.record(z.unknown()).optional(),
    patientName: z.string(),
    doctorName: z.string(),
    doctorCrm: z.string(),
    dataJson: z.record(z.unknown()).optional()
  });
  fastify.post('/api/documents', { preHandler: [fastify.authenticate, tenantIsolation], schema: { tags: ['documents'], body: zodToJsonSchema(createDocumentSchema) } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const validation = createDocumentSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send(validation.error.format());
    }
    const input = validation.data;
    const hash = generateDocumentHash(input);
    const qrCode = await generateQRCode(hash);
    const documentData = {
      id: uuidv4(),
      templateId: input.templateId,
      title: input.title,
      content: encryptionService.encrypt(JSON.stringify(input.content || {})),
      patientName: encryptionService.encrypt(input.patientName),
      doctorName: encryptionService.encrypt(input.doctorName),
      doctorCrm: encryptionService.encrypt(input.doctorCrm),
      dataJson: encryptionService.encrypt(JSON.stringify(input.dataJson || {})),
      hash,
      qrCode,
      isSigned: false,
      organizationId: (request as any).organizationId
    };
    const result = await db.insert(documents).values(documentData).returning();
    const document = result[0];
    await db.insert(auditLogs).values({ documentId: document.id, action: 'created', actorName: 'Sistema', metadata: { templateId: input.templateId } });
    
    // Invalidar cache de documentos
    await cacheService.delPattern('documents:list:*');
    
    return document;
  });

  const signDocumentSchema = z.object({
    documentId: z.string().uuid(),
    doctorName: z.string(),
  });
  fastify.post('/api/documents/sign', { preHandler: [fastify.authenticate, tenantIsolation], schema: { tags: ['documents'], body: zodToJsonSchema(signDocumentSchema) } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const validation = signDocumentSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send(validation.error.format());
    }
    const input = validation.data;
    const result = await db.update(documents).set({ isSigned: true, signedAt: new Date() }).where(eq(documents.id, input.documentId)).returning();
    const document = result[0];
    await db.insert(auditLogs).values({ documentId: document.id, action: 'signed', actorName: input.doctorName, metadata: { signatureType: 'mock' } });
    return document;
  });

  fastify.get('/api/documents/:id/pdf', { preHandler: [fastify.authenticate, tenantIsolation], schema: { tags: ['documents'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const organizationId = (request as any).organizationId;
    const doc = await db.select().from(documents).where(and(eq(documents.id, params.id), eq(documents.organizationId, organizationId))).then(res => res[0]);

    if (!doc) {
      reply.code(404).send({ error: 'Document not found' });
      return;
    }

    try {
      const pdfService = new PDFService();
      
      const decryptedDoc = {
        ...doc,
        patientName: encryptionService.decrypt(doc.patientName),
        doctorName: encryptionService.decrypt(doc.doctorName),
        doctorCrm: encryptionService.decrypt(doc.doctorCrm),
        content: JSON.parse(encryptionService.decrypt(doc.content)),
        dataJson: JSON.parse(encryptionService.decrypt(doc.dataJson))
      };

      // Converter documento do banco para formato esperado pelo PDF service
      const documentForPDF = {
        id: decryptedDoc.id,
        title: `Documento - ${decryptedDoc.patientName}`,
        content: JSON.stringify(decryptedDoc.dataJson, null, 2),
        hash: decryptedDoc.hash,
        createdAt: decryptedDoc.createdAt,
        isSigned: decryptedDoc.isSigned,
        signedAt: decryptedDoc.signedAt,
        signedBy: decryptedDoc.doctorName,
        signatureHash: decryptedDoc.hash,
        patient: {
          id: decryptedDoc.id, // Mock ID
          name: decryptedDoc.patientName,
          cpf: undefined
        },
        doctor: {
          id: decryptedDoc.id, // Mock ID
          name: decryptedDoc.doctorName,
          crm: decryptedDoc.doctorCrm
        }
      };

      const result = await pdfService.generateDeterministic(documentForPDF, {
        documentId: decryptedDoc.id,
        includeQRCode: true,
        includeWatermark: false
      });

      reply
        .code(200)
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="documento-${decryptedDoc.id}.pdf"`)
        .header('X-Document-Hash', result.hash)
        .send(result.buffer);
    } catch (error) {
      request.log.error('PDF generation failed:', error);
      reply.code(500).send({ 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const createShareSchema = z.object({
    expiresInDays: z.number().min(1).max(30).default(7),
    password: z.string().optional(),
  });
  fastify.post('/api/documents/:id/share', { preHandler: [fastify.authenticate, tenantIsolation], schema: { tags: ['documents'], body: zodToJsonSchema(createShareSchema) } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const validation = createShareSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send(validation.error.format());
    }
    const { expiresInDays, password } = validation.data;

    const doc = await db.select().from(documents).where(eq(documents.id, params.id)).then(res => res[0]);
    if (!doc) {
      return reply.code(404).send({ error: 'Document not found' });
    }

    const token = generateShareToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    let hashedPassword = password;
    if (password) {
      hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    }

    const result = await db.insert(shares).values({
      documentId: params.id,
      token,
      expiresAt,
      password: hashedPassword,
    }).returning();

    return { url: `http://localhost:3000/share/${token}` };
  });

  fastify.get('/share/:token', { schema: { tags: ['sharing'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { token: string };
    const share = await db.select().from(shares).where(eq(shares.token, params.token)).then(res => res[0]);

    if (!share || new Date() > share.expiresAt) {
      return reply.code(404).send({ error: 'Link inválido ou expirado' });
    }

    // For now, just return the document. In a real app, you'd have a view for this.
    const doc = await db.select().from(documents).where(eq(documents.id, share.documentId)).then(res => res[0]);
    return doc;
  });

  fastify.get('/api/audit/:document_id', { preHandler: [fastify.authenticate, tenantIsolation], schema: { tags: ['audit'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { document_id: string };
    const result = await db.select().from(auditLogs).where(eq(auditLogs.documentId, params.document_id)).orderBy(desc(auditLogs.createdAt));
    return result;
  });

};

// ====== SERVER START ======
const start = async () => {
  try {
    // 🔧 Configurar middlewares de validação e erro
    // setupZodValidation(fastify); // Temporariamente desabilitado
    setupErrorHandling(fastify);
    
    await registerPlugins();
    registerRoutes();
    await fastify.ready();
    fastify.swagger();
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8085;
    await fastify.listen({ 
      port: PORT, 
      host: '0.0.0.0' 
    });
    
    console.log(`🚀 RepoMed API running on http://localhost:${PORT}`);
    console.log(`📚 Documentation on http://localhost:${PORT}/documentation`);
    console.log(`🚨 Error handling: RFC 7807 Problem Details enabled`);
    console.log(`🔍 Validation: Zod schemas enabled`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// ====== CONFIGURAÇÃO FASTIFY ======
const fastify = Fastify({
  logger: true,
  bodyLimit: 10485760 // 10MB
});

// ====== PLUGINS ======
const registerPlugins = async () => {
  await fastify.register(cors, {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3008', 'http://localhost:3021', 'http://localhost:3022', 'http://localhost:3023'],
    credentials: true
  });

  await fastify.register(multipart);

  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'RepoMed API',
        description: 'API for RepoMed IA',
        version: '1.0.0'
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      host: 'localhost:8080',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json']
    }
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
  });

  // Security Headers Middleware
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // ... (security headers as before)
  });

  await fastify.register(staticFiles, {
    root: join(__dirname, 'public'),
    prefix: '/public/'
  });
};

// ====== HELPER FUNCTIONS ======
function generateDocumentHash(data: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function generateQRCode(data: string): Promise<string> {
  return await QRCode.toDataURL(data);
}

// ====== AUTHENTICATION MIDDLEWARE ======
const JWT_SECRET = process.env.JWT_SECRET || 'repomed-dev-secret-key';

fastify.decorate('authenticate', async function(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = (request.headers.authorization as string)?.replace('Bearer ', '');
    if (!token) {
      return reply.status(401).send({
        type: '/errors/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Token de autenticação é obrigatório.',
        instance: request.url,
        traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    (request as any).user = decoded;
  } catch (err) {
    return reply.status(401).send({
      type: '/errors/invalid-token',
      title: 'Invalid Token',
      status: 401,
      detail: 'Token de autenticação inválido ou expirado.',
      instance: request.url,
      traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  }
});

// ====== ROUTES ======
const registerRoutes = () => {

  // Root route
  fastify.get('/', async (request, reply) => {
    return { 
      name: 'RepoMed IA API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      documentation: '/documentation'
    };
  });

  // Health check
  fastify.get('/health', async (request, reply) => {
    return { 
      ok: true, 
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        api: 'running',
        database: 'mock',
        templates: 'loaded'
      }
    };
  });

  // ====== AUTENTICAÇÃO RFC 7807 ======
  const loginSchema = z.object({
    email: z.string().email('Email deve ter um formato válido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
  });

  fastify.post('/api/auth/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);
      
      // Validar credenciais (demo users)
      const demoUsers = {
        'admin@repomed.com': { password: '123456', name: 'Dr. Admin', crm: '12345-SP', role: 'admin' },
        'medico@repomed.com': { password: '123456', name: 'Dr. João Silva', crm: '54321-RJ', role: 'medico' },
        'test@test.com': { password: 'password', name: 'Dr. Teste', crm: '99999-MG', role: 'medico' }
      };
      
      const user = demoUsers[email as keyof typeof demoUsers];
      if (!user || user.password !== password) {
        return reply.status(401).send({
          type: '/errors/invalid-credentials',
          title: 'Invalid Credentials',
          status: 401,
          detail: 'Email ou senha incorretos. Tente novamente.',
          instance: '/api/auth/login',
          traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
      
      // Gerar token JWT
      const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
      const token = jwt.sign(
        { 
          id: email, 
          email, 
          name: user.name, 
          crm: user.crm, 
          role: user.role 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      return {
        token,
        user: {
          id: email,
          email,
          name: user.name,
          crm: user.crm,
          role: user.role
        }
      };
    } catch (error: any) {
      if (error.issues) {
        return reply.status(400).send({
          type: '/errors/validation-failed',
          title: 'Validation Failed',
          status: 400,
          detail: error.issues.map((i: any) => i.message).join(', '),
          instance: '/api/auth/login',
          traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
      throw error;
    }
  });
  
  // Endpoint para validar token
  fastify.get('/api/auth/me', { preHandler: fastify.authenticate }, async (request, reply) => {
    return request.user;
  });
  
  // Endpoint de registro (básico)
  const registerSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email deve ter um formato válido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    crm: z.string().optional()
  });
  
  fastify.post('/api/auth/register', async (request, reply) => {
    try {
      const { name, email, password, crm } = registerSchema.parse(request.body);
      
      // Validação simples - email não pode já existir
      const demoUsers = ['admin@repomed.com', 'medico@repomed.com', 'test@test.com'];
      if (demoUsers.includes(email)) {
        return reply.status(409).send({
          type: '/errors/user-exists',
          title: 'User Already Exists',
          status: 409,
          detail: 'Este email já está cadastrado no sistema.',
          instance: '/api/auth/register',
          traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
      
      // Criar usuário (mock - em produção salvaria no banco)
      const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
      const token = jwt.sign(
        { 
          id: email, 
          email, 
          name, 
          crm: crm || 'PENDING', 
          role: 'medico' 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      return {
        token,
        user: {
          id: email,
          email,
          name,
          crm: crm || 'PENDING',
          role: 'medico'
        }
      };
    } catch (error: any) {
      if (error.issues) {
        return reply.status(400).send({
          type: '/errors/validation-failed',
          title: 'Validation Failed',
          status: 400,
          detail: error.issues.map((i: any) => i.message).join(', '),
          instance: '/api/auth/register',
          traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
      throw error;
    }
  });

  // Register template routes
  registerTemplateRoutes(fastify);

  // Register patient routes
  registerPatientRoutes(fastify);

  // Register prescription routes
  registerPrescriptionRoutes(fastify);

  // Register metrics routes
  registerMetricsRoutes(fastify);

  // Register upload routes
  registerUploadRoutes(fastify);

  // Register signature routes
  registerSignatureRoutes(fastify);

  // Register performance routes
  registerPerformanceRoutes(fastify);

  const createTemplateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    fields: z.array(z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(['text','number','date','select']).default('text')
    })).default([])
  });
  fastify.post('/api/templates', { schema: { tags: ['templates'], body: zodToJsonSchema(createTemplateSchema) } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const validation = createTemplateSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send(validation.error.format());
    }
    const templateData = {
      id: uuidv4(),
      name: validation.data.name,
      description: validation.data.description,
      fields: JSON.stringify(validation.data.fields)
    };
    const result = await db.insert(templates).values(templateData).returning();
    return result[0];
  });

  // DOCUMENTS
  fastify.get('/api/documents', { schema: { tags: ['documents'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Cache da lista de documentos por 5 minutos
    const cacheKey = 'documents:list:all';
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      reply.header('X-Cache', 'HIT');
      return cached;
    }

    const result = await db.select().from(documents).orderBy(desc(documents.createdAt));
    
    // Cache por 5 minutos
    await cacheService.set(cacheKey, result, 'short');
    reply.header('X-Cache', 'MISS');
    
    return result;
  });

  fastify.get('/api/documents/:id', { schema: { tags: ['documents'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const result = await db.select().from(documents).where(eq(documents.id, params.id));
    if (!result.length) {
      reply.code(404).send({ error: 'Document not found' });
      return;
    }
    return result[0];
  });

  const createDocumentSchema = z.object({
    templateId: z.string(),
    title: z.string().min(1),
    content: z.record(z.unknown()).optional()
  });
  fastify.post('/api/documents', { schema: { tags: ['documents'], body: zodToJsonSchema(createDocumentSchema) } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const validation = createDocumentSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send(validation.error.format());
    }
    const input = validation.data;
    const hash = generateDocumentHash(input);
    const qrCode = await generateQRCode(hash);
    const documentData = {
      id: uuidv4(),
      templateId: input.templateId,
      title: input.title,
      content: JSON.stringify(input.content || {}),
      hash,
      qrCode,
      isSigned: false
    };
    const result = await db.insert(documents).values(documentData).returning();
    const document = result[0];
    await db.insert(auditLogs).values({ documentId: document.id, action: 'created', actorName: 'Sistema', metadata: { templateId: input.templateId } });
    
    // Invalidar cache de documentos
    await cacheService.delPattern('documents:list:*');
    
    return document;
  });

  const signDocumentSchema = z.object({
    documentId: z.string().uuid(),
    doctorName: z.string(),
  });
  fastify.post('/api/documents/sign', { schema: { tags: ['documents'], body: zodToJsonSchema(signDocumentSchema) } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const validation = signDocumentSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send(validation.error.format());
    }
    const input = validation.data;
    const result = await db.update(documents).set({ isSigned: true, signedAt: new Date() }).where(eq(documents.id, input.documentId)).returning();
    const document = result[0];
    await db.insert(auditLogs).values({ documentId: document.id, action: 'signed', actorName: input.doctorName, metadata: { signatureType: 'mock' } });
    return document;
  });

  fastify.get('/api/documents/:id/pdf', { schema: { tags: ['documents'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const doc = await db.select().from(documents).where(eq(documents.id, params.id)).then(res => res[0]);

    if (!doc) {
      reply.code(404).send({ error: 'Document not found' });
      return;
    }

    try {
      const pdfService = new PDFService();
      
      // Converter documento do banco para formato esperado pelo PDF service
      const documentForPDF = {
        id: doc.id,
        title: `Documento - ${doc.patientName}`,
        content: JSON.stringify(doc.dataJson, null, 2),
        hash: doc.hash,
        createdAt: doc.createdAt,
        isSigned: doc.isSigned,
        signedAt: doc.signedAt,
        signedBy: doc.doctorName,
        signatureHash: doc.hash,
        patient: {
          id: doc.id, // Mock ID
          name: doc.patientName,
          cpf: undefined
        },
        doctor: {
          id: doc.id, // Mock ID
          name: doc.doctorName,
          crm: doc.doctorCrm
        }
      };

      const result = await pdfService.generateDeterministic(documentForPDF, {
        documentId: doc.id,
        includeQRCode: true,
        includeWatermark: false
      });

      reply
        .code(200)
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="documento-${doc.id}.pdf"`)
        .header('X-Document-Hash', result.hash)
        .send(result.buffer);
    } catch (error) {
      request.log.error('PDF generation failed:', error);
      reply.code(500).send({ 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const createShareSchema = z.object({
    expiresInDays: z.number().min(1).max(30).default(7),
    password: z.string().optional(),
  });
  fastify.post('/api/documents/:id/share', { schema: { tags: ['documents'], body: zodToJsonSchema(createShareSchema) } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const validation = createShareSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send(validation.error.format());
    }
    const { expiresInDays, password } = validation.data;

    const doc = await db.select().from(documents).where(eq(documents.id, params.id)).then(res => res[0]);
    if (!doc) {
      return reply.code(404).send({ error: 'Document not found' });
    }

    const token = generateShareToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    let hashedPassword = password;
    if (password) {
      hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    }

    const result = await db.insert(shares).values({
      documentId: params.id,
      token,
      expiresAt,
      password: hashedPassword,
    }).returning();

    return { url: `http://localhost:3000/share/${token}` };
  });

  fastify.get('/share/:token', { schema: { tags: ['sharing'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { token: string };
    const share = await db.select().from(shares).where(eq(shares.token, params.token)).then(res => res[0]);

    if (!share || new Date() > share.expiresAt) {
      return reply.code(404).send({ error: 'Link inválido ou expirado' });
    }

    // For now, just return the document. In a real app, you'd have a view for this.
    const doc = await db.select().from(documents).where(eq(documents.id, share.documentId)).then(res => res[0]);
    return doc;
  });

  fastify.get('/api/audit/:document_id', { schema: { tags: ['audit'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { document_id: string };
    const result = await db.select().from(auditLogs).where(eq(auditLogs.documentId, params.document_id)).orderBy(desc(auditLogs.createdAt));
    return result;
  });

};

// ====== SERVER START ======
const start = async () => {
  try {
    // 🔧 Configurar middlewares de validação e erro
    // setupZodValidation(fastify); // Temporariamente desabilitado
    setupErrorHandling(fastify);
    
    await registerPlugins();
    registerRoutes();
    await fastify.ready();
    fastify.swagger();
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8085;
    await fastify.listen({ 
      port: PORT, 
      host: '0.0.0.0' 
    });
    
    console.log(`🚀 RepoMed API running on http://localhost:${PORT}`);
    console.log(`📚 Documentation on http://localhost:${PORT}/documentation`);
    console.log(`🚨 Error handling: RFC 7807 Problem Details enabled`);
    console.log(`🔍 Validation: Zod schemas enabled`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
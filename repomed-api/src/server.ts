import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import staticFiles from '@fastify/static';
import { join } from 'path';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from './db';
import { documents, templates, shares, auditLogs } from './db/schema';
import { eq, desc } from 'drizzle-orm';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { zodToJsonSchema } from 'zod-to-json-schema';

// ====== CONFIGURAÇÃO FASTIFY ======
const fastify = Fastify({
  logger: true,
  bodyLimit: 10485760 // 10MB
});

// ====== PLUGINS ======
const registerPlugins = async () => {
  await fastify.register(cors, {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
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

// Mock JWT secret (usar variável de ambiente em produção)
const JWT_SECRET = process.env.JWT_SECRET || 'repomed-dev-secret-key';

// ====== AUTHENTICATION MIDDLEWARE ======
fastify.decorate('authenticate', async function(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = (request.headers.authorization as string)?.replace('Bearer ', '');
    if (!token) {
      reply.code(401).send({ error: 'Token required' });
      return;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    (request as any).user = decoded;
  } catch (err) {
    reply.code(401).send({ error: 'Invalid token' });
  }
});

// ====== ROUTES ======
const registerRoutes = () => {

  // TEMPLATES
  fastify.get('/api/templates', { schema: { tags: ['templates'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await db.select().from(templates).where(eq(templates.isActive, true));
    return result;
  });

  fastify.get('/api/templates/:id', { schema: { tags: ['templates'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const result = await db.select().from(templates).where(eq(templates.id, params.id));
    if (!result.length) {
      reply.code(404).send({ error: 'Template not found' });
      return;
    }
    return result[0];
  });

  const createTemplateSchema = z.object({
    name: z.string().min(3).max(255),
    specialty: z.string().min(2).max(100),
    description: z.string().optional(),
    contentJson: z.any(),
    fieldsSchema: z.any(),
  });
  fastify.post('/api/templates', { schema: { tags: ['templates'], body: zodToJsonSchema(createTemplateSchema) } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const validation = createTemplateSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send(validation.error.format());
    }
    const result = await db.insert(templates).values(validation.data).returning();
    return result[0];
  });

  // DOCUMENTS
  fastify.get('/api/documents', { schema: { tags: ['documents'] } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await db.select().from(documents).orderBy(desc(documents.createdAt));
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
    templateId: z.string().uuid(),
    patientName: z.string().min(2).max(255),
    doctorName: z.string().min(2).max(255),
    doctorCrm: z.string().min(5).max(20),
    dataJson: z.any(),
  });
  fastify.post('/api/documents', { schema: { tags: ['documents'], body: zodToJsonSchema(createDocumentSchema) } }, async (request: FastifyRequest, reply: FastifyReply) => {
    const validation = createDocumentSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send(validation.error.format());
    }
    const input = validation.data;
    const hash = await generateDocumentHash(input);
    const qrCode = await generateQRCode(hash);
    const result = await db.insert(documents).values({ ...input, hash, qrCode, isSigned: false }).returning();
    const document = result[0];
    await db.insert(auditLogs).values({ documentId: document.id, action: 'created', actorName: input.doctorName, metadata: { templateId: input.templateId } });
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

    const pdf = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    pdf.on('data', buffers.push.bind(buffers));
    pdf.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      reply.code(200).header('Content-Type', 'application/pdf').send(pdfData);
    });

    // Cabeçalho
    pdf.fontSize(20).text('RepoMed IA', { align: 'center' });
    pdf.fontSize(10).text('Documento Médico Verificado', { align: 'center' });
    pdf.moveDown(2);

    // Informações do Documento
    pdf.fontSize(12).text(`Paciente: ${doc.patientName}`);
    pdf.text(`Médico: ${doc.doctorName} (CRM: ${doc.doctorCrm})`);
    pdf.text(`Data: ${new Date(doc.createdAt).toLocaleString('pt-BR')}`);
    pdf.moveDown();

    // Conteúdo do Documento
    pdf.fontSize(14).text('Conteúdo do Documento', { underline: true });
    pdf.moveDown();
    pdf.fontSize(12).text(JSON.stringify(doc.dataJson, null, 2));
    pdf.moveDown(2);

    // Assinatura
    if (doc.isSigned) {
      pdf.text(`Assinado digitalmente por ${doc.doctorName} em ${new Date(doc.signedAt!).toLocaleString('pt-BR')}`);
    } else {
      pdf.text('Documento não assinado');
    }
    pdf.moveDown(2);

    // QR Code
    const verificationUrl = `http://localhost:3000/verify/${doc.hash}`;
    const qrCodeImage = await generateQRCode(verificationUrl);
    pdf.image(qrCodeImage, { fit: [100, 100], align: 'center' });
    pdf.text('Verifique a autenticidade deste documento lendo o QR Code', { align: 'center' });

    pdf.end();
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
    await registerPlugins();
    registerRoutes();
    await fastify.ready();
    fastify.swagger();
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
    await fastify.listen({ 
      port: PORT, 
      host: '0.0.0.0' 
    });
    
    console.log(`🚀 RepoMed API running on http://localhost:${PORT}`);
    console.log(`📚 Documentation on http://localhost:${PORT}/documentation`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { DigitalSignatureService } from '../services/digitalSignature';
import { db } from '../db';
import { documents, auditLogs } from '../db/schema';
import { eq } from 'drizzle-orm';

const SignDocumentSchema = z.object({
  documentId: z.string().uuid(),
  userId: z.string().uuid(),
  documentData: z.record(z.any())
});

const ValidateSignatureSchema = z.object({
  documentId: z.string().uuid(),
  signature: z.string(),
  certificate: z.string(),
  documentData: z.record(z.any())
});

export async function registerSignatureRoutes(fastify: FastifyInstance) {
  const signatureService = DigitalSignatureService.getInstance();

  // Sign a document
  fastify.post('/api/documents/:id/sign', {
    preHandler: fastify.authenticate
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id: documentId } = request.params as { id: string };
      const user = request.user as any;
      
      // Get document from database
      const document = await db.select().from(documents)
        .where(eq(documents.id, documentId))
        .limit(1);
        
      if (!document.length) {
        return reply.code(404).send({ error: 'Document not found' });
      }

      const doc = document[0];
      
      // Create document data for signing
      const documentData = {
        id: documentId,
        title: doc.title,
        content: doc.content,
        patientName: doc.patientName,
        doctorName: doc.doctorName,
        doctorCrm: doc.doctorCrm,
        createdAt: doc.createdAt,
        userId: user.id
      };

      // Sign the document
      const signatureResult = await signatureService.signDocument(documentData, user.id);
      
      // Update document in database
      await db.update(documents)
        .set({
          isSigned: true,
          signedAt: new Date(),
          hash: signatureResult.hash,
          qrCode: signatureResult.qrCode
        })
        .where(eq(documents.id, documentId));

      // Create audit log
      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        documentId,
        action: 'DOCUMENT_SIGNED',
        actorName: user.name,
        actorEmail: user.email,
        metadata: {
          signature: signatureResult.signature,
          hash: signatureResult.hash,
          timestamp: signatureResult.timestamp
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        createdAt: new Date()
      });

      return reply.send({
        success: true,
        signature: signatureResult,
        message: 'Document signed successfully'
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to sign document',
        details: error.message 
      });
    }
  });

  // Validate document signature
  fastify.post('/api/documents/validate-signature', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = ValidateSignatureSchema.parse(request.body);
      
      const validation = await signatureService.validateSignature(
        body.documentData,
        body.signature,
        body.certificate
      );

      // Create audit log for validation attempt
      await db.insert(auditLogs).values({
        id: crypto.randomUUID(),
        documentId: body.documentId,
        action: 'SIGNATURE_VALIDATED',
        actorName: validation.signerInfo?.commonName || 'Unknown',
        actorEmail: validation.signerInfo?.email || 'unknown@unknown.com',
        metadata: {
          isValid: validation.isValid,
          errors: validation.validationErrors,
          certificateValid: validation.certificateValid,
          timestampValid: validation.timestampValid,
          hashMatch: validation.hashMatch
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        createdAt: new Date()
      });

      return reply.send({
        success: true,
        validation
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(400).send({ 
        error: 'Validation failed',
        details: error.message 
      });
    }
  });

  // Get document verification info (for QR code scanning)
  fastify.get('/api/verify/:documentId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { documentId } = request.params as { documentId: string };
      
      const document = await db.select().from(documents)
        .where(eq(documents.id, documentId))
        .limit(1);
        
      if (!document.length) {
        return reply.code(404).send({ error: 'Document not found' });
      }

      const doc = document[0];
      
      if (!doc.isSigned) {
        return reply.code(400).send({ error: 'Document is not signed' });
      }

      // Get audit logs for this document
      const logs = await db.select().from(auditLogs)
        .where(eq(auditLogs.documentId, documentId))
        .orderBy(auditLogs.createdAt);

      return reply.send({
        success: true,
        document: {
          id: doc.id,
          title: doc.title,
          patientName: doc.patientName,
          doctorName: doc.doctorName,
          doctorCrm: doc.doctorCrm,
          signedAt: doc.signedAt,
          hash: doc.hash,
          qrCode: doc.qrCode,
          isSigned: doc.isSigned
        },
        auditTrail: logs,
        verificationUrl: `${process.env.API_URL || 'http://localhost:8081'}/api/verify/${documentId}`
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        error: 'Verification failed',
        details: error.message 
      });
    }
  });

  // Get certificate information
  fastify.get('/api/certificate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const certificatePem = signatureService.getCertificatePem();
      
      return reply.send({
        success: true,
        certificate: certificatePem,
        issuer: 'RepoMed IA Digital Certificate Authority',
        validFrom: new Date(),
        validTo: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000) // 5 years
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to get certificate',
        details: error.message 
      });
    }
  });

  // Timestamp service
  fastify.post('/api/timestamp', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { data } = request.body as { data: string };
      
      if (!data) {
        return reply.code(400).send({ error: 'Data is required for timestamping' });
      }

      const timestamp = await signatureService.generateTimestamp(data);
      
      return reply.send({
        success: true,
        timestamp: JSON.parse(timestamp),
        tsa: 'RepoMed IA Timestamp Authority'
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        error: 'Timestamp generation failed',
        details: error.message 
      });
    }
  });

  // Get document audit trail
  fastify.get('/api/documents/:id/audit', {
    preHandler: fastify.authenticate
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id: documentId } = request.params as { id: string };
      
      const logs = await db.select().from(auditLogs)
        .where(eq(auditLogs.documentId, documentId))
        .orderBy(auditLogs.createdAt);

      return reply.send({
        success: true,
        auditTrail: logs,
        totalEvents: logs.length
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ 
        error: 'Failed to get audit trail',
        details: error.message 
      });
    }
  });
}
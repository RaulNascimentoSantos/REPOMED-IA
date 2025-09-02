import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server'
import { documents, shares, auditLogs, templates } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { generateDocumentHash, generateQRCode, generateShareToken } from '@/lib/medical/document-utils'
import { generateDocumentPDF } from '@/lib/pdf/generator'
import { shareManager } from '@/lib/sharing/share-manager'

export const documentsRouter = createTRPCRouter({
  // Listar documentos do usuário (V1 simplificado)
  list: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(documents).orderBy(desc(documents.createdAt))
  }),

  // Buscar documento por ID
  getById: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.select().from(documents).where(eq(documents.id, input))
      return result[0] || null
    }),

  // Criar novo documento
  create: publicProcedure
    .input(z.object({
      templateId: z.string().uuid(),
      patientName: z.string().min(2).max(255),
      doctorName: z.string().min(2).max(255),
      doctorCrm: z.string().min(5).max(20),
      dataJson: z.any(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Gerar hash do documento
      const hash = await generateDocumentHash(input)
      
      // Gerar QR code
      const qrCode = await generateQRCode(hash)

      const result = await ctx.db.insert(documents).values({
        ...input,
        hash,
        qrCode,
        isSigned: false,
      }).returning()

      const document = result[0]

      // Log de auditoria
      await ctx.db.insert(auditLogs).values({
        documentId: document.id,
        action: 'created',
        actorName: input.doctorName,
        metadata: { templateId: input.templateId },
      })

      return document
    }),

  // Assinar documento (mock para V1)
  sign: publicProcedure
    .input(z.object({
      documentId: z.string().uuid(),
      doctorName: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.update(documents)
        .set({
          isSigned: true,
          signedAt: new Date(),
        })
        .where(eq(documents.id, input.documentId))
        .returning()

      const document = result[0]

      // Log de auditoria
      await ctx.db.insert(auditLogs).values({
        documentId: document.id,
        action: 'signed',
        actorName: input.doctorName,
        metadata: { signatureType: 'mock' },
      })

      return document
    }),

  // Compartilhar documento
  share: publicProcedure
    .input(z.object({
      documentId: z.string().uuid(),
      expiresInHours: z.number().min(1).max(168).default(24), // 1 hora a 7 dias
    }))
    .mutation(async ({ ctx, input }) => {
      const token = generateShareToken()
      const expiresAt = new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000)

      const result = await ctx.db.insert(shares).values({
        documentId: input.documentId,
        token,
        expiresAt,
      }).returning()

      // Log de auditoria
      await ctx.db.insert(auditLogs).values({
        documentId: input.documentId,
        action: 'shared',
        metadata: { 
          token, 
          expiresAt: expiresAt.toISOString(),
          expiresInHours: input.expiresInHours 
        },
      })

      return result[0]
    }),

  // Acessar documento compartilhado
  getByShareToken: publicProcedure
    .input(z.string().min(32))
    .query(async ({ ctx, input }) => {
      const shareResult = await ctx.db.select()
        .from(shares)
        .where(eq(shares.token, input))

      const share = shareResult[0]
      if (!share || share.expiresAt < new Date()) {
        return null
      }

      const documentResult = await ctx.db.select()
        .from(documents)
        .where(eq(documents.id, share.documentId))

      const document = documentResult[0]
      if (!document) {
        return null
      }

      // Incrementar contador de acesso
      await ctx.db.update(shares)
        .set({ accessCount: share.accessCount + 1 })
        .where(eq(shares.id, share.id))

      // Log de auditoria
      await ctx.db.insert(auditLogs).values({
        documentId: document.id,
        action: 'accessed',
        metadata: { 
          accessMethod: 'share_token',
          token: input,
        },
      })

      return document
    }),

  // Gerar PDF do documento
  generatePDF: publicProcedure
    .input(z.object({
      documentId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Buscar documento com template
      const documentQuery = await ctx.db.select({
        document: documents,
        template: templates
      })
      .from(documents)
      .leftJoin(templates, eq(documents.templateId, templates.id))
      .where(eq(documents.id, input.documentId))

      const documentData = documentQuery[0]
      if (!documentData || !documentData.document) {
        throw new Error('Documento não encontrado')
      }

      // Gerar PDF
      const pdfBuffer = await generateDocumentPDF({
        id: documentData.document.id,
        templateId: documentData.document.templateId,
        patientName: documentData.document.patientName,
        data: documentData.document.dataJson,
        hash: documentData.document.hash,
        template: documentData.template || {
          name: 'Documento Médico',
          contentJson: { content: 'Conteúdo do documento não encontrado.' }
        },
      })

      // Log de auditoria
      await ctx.db.insert(auditLogs).values({
        documentId: documentData.document.id,
        action: 'pdf_generated',
        actorName: documentData.document.doctorName,
        metadata: { size: pdfBuffer.length },
      })

      // Retornar PDF em base64
      return {
        pdf: Buffer.from(pdfBuffer).toString('base64'),
        filename: `documento_${documentData.document.patientName}_${new Date().toISOString().split('T')[0]}.pdf`
      }
    }),

  // Obter logs de auditoria de um documento
  getAuditLogs: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      return await ctx.db.select()
        .from(auditLogs)
        .where(eq(auditLogs.documentId, input))
        .orderBy(desc(auditLogs.createdAt))
    }),
})
import { z } from 'zod';

export const DocumentMetadataSchema = z.object({
  title: z.string().min(3, 'Título obrigatório'),
  type: z.enum([
    'prescription',
    'medical_report', 
    'exam_request',
    'medical_certificate',
    'consultation_notes'
  ], { errorMap: () => ({ message: 'Tipo de documento inválido' }) }),
  version: z.string().default('1.0'),
  createdAt: z.string().datetime('Data de criação inválida'),
  updatedAt: z.string().datetime('Data de atualização inválida').optional(),
});

export const DocumentContentSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  physicianId: z.string().uuid('ID do médico inválido'),
  content: z.string().min(10, 'Conteúdo do documento muito curto'),
  templates: z.array(z.string()).default([]),
  attachments: z.array(z.object({
    filename: z.string().min(1, 'Nome do arquivo obrigatório'),
    mimeType: z.string().min(1, 'Tipo MIME obrigatório'),
    size: z.number().positive('Tamanho do arquivo inválido'),
    hash: z.string().min(32, 'Hash do arquivo inválido')
  })).default([]),
});

export const DocumentSchema = z.object({
  id: z.string().uuid('ID do documento inválido').optional(),
  metadata: DocumentMetadataSchema,
  content: DocumentContentSchema,
  status: z.enum(['draft', 'pending_signature', 'signed', 'cancelled'], {
    errorMap: () => ({ message: 'Status do documento inválido' })
  }).default('draft'),
  requiresSignature: z.boolean().default(false),
});

export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;
export type DocumentContent = z.infer<typeof DocumentContentSchema>;
export type Document = z.infer<typeof DocumentSchema>;
import { z } from 'zod';

export const Document = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['draft','signed','cancelled']).default('draft'),
  templateId: z.string(),
  createdAt: z.string(),
});

export const DocumentListResponse = z.array(Document);

export const CreateDocumentRequest = z.object({
  templateId: z.string(),
  patientId: z.string().optional(),
  title: z.string().min(1),
  content: z.record(z.unknown()).optional()
});
export type CreateDocumentDTO = z.infer<typeof CreateDocumentRequest>;
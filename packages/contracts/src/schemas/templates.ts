import { z } from 'zod';

export const Template = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(['text','number','date','select']).default('text')
  })).default([])
});

export const TemplateListResponse = z.array(Template);

export const CreateTemplateRequest = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(['text','number','date','select']).default('text')
  })).default([])
});
export type CreateTemplateDTO = z.infer<typeof CreateTemplateRequest>;
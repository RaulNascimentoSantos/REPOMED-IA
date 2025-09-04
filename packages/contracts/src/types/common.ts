import { z } from 'zod'

// 🌐 Tipos comuns utilizados em todo o sistema

// 📅 Timestamps padrão
export const TimestampSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// 🆔 UUID Schema
export const UUIDSchema = z.string().uuid('ID deve ser um UUID válido')

// 📄 Paginação
export const PaginationRequestSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc')
})

export const PaginationResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
})

// 🔍 Filtros de busca
export const SearchRequestSchema = z.object({
  search: z.string().optional(),
  filters: z.record(z.unknown()).optional()
}).merge(PaginationRequestSchema)

// ✅ Resposta padrão de sucesso
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.unknown().optional(),
  pagination: PaginationResponseSchema.optional()
})

// 📋 Metadados
export const MetadataSchema = z.record(z.unknown()).nullable()

// 🏥 Dados médicos comuns
export const CPFSchema = z.string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF deve estar no formato 000.000.000-00 ou 00000000000')

export const CRMSchema = z.string()
  .regex(/^\d{4,6}-[A-Z]{2}$/, 'CRM deve estar no formato 123456-SP')

export const PhoneSchema = z.string()
  .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/, 'Telefone deve estar no formato (11) 99999-9999')

export const EmailSchema = z.string().email('Email deve ter formato válido')

// 🎭 Status comuns
export const BaseStatusSchema = z.enum(['active', 'inactive', 'archived'])

export const DocumentStatusSchema = z.enum(['draft', 'pending_signature', 'signed', 'cancelled'])

// 📍 Endereço
export const AddressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000')
})

// 🏥 Contato de emergência
export const EmergencyContactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: PhoneSchema,
  relationship: z.enum([
    'pai', 'mae', 'conjuge', 'irmao', 'filho', 'amigo', 'outro'
  ])
})

// 💊 Informações médicas básicas
export const MedicalInfoSchema = z.object({
  allergies: z.string().optional(),
  medications: z.string().optional(),
  conditions: z.string().optional(),
  notes: z.string().optional()
})

// 🔐 Dados de autenticação
export const LoginCredentialsSchema = z.object({
  email: EmailSchema,
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
})

// 📊 Filtros de data
export const DateRangeFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

// 🎯 Enums de gênero
export const GenderSchema = z.enum(['masculino', 'feminino', 'outro', 'nao_informar'])

// 🏷️ Tags e categorias
export const TagSchema = z.object({
  id: UUIDSchema,
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um hex válido'),
  category: z.string().optional()
})

// 📁 Arquivo/Upload
export const FileUploadSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.string().min(1),
  size: z.number().positive(),
  data: z.string().optional(), // Base64 string instead of Buffer for browser compatibility
  url: z.string().url().optional()
})

// 🔍 Auditoria
export const AuditLogSchema = z.object({
  id: UUIDSchema,
  entityType: z.string(),
  entityId: UUIDSchema,
  action: z.enum(['create', 'read', 'update', 'delete', 'sign', 'share']),
  actorId: UUIDSchema.optional(),
  actorName: z.string().optional(),
  actorType: z.enum(['user', 'system', 'api']).default('user'),
  metadata: MetadataSchema.optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.string().datetime()
})

// Tipos TypeScript inferidos
export type Timestamp = z.infer<typeof TimestampSchema>
export type UUID = z.infer<typeof UUIDSchema>
export type PaginationRequest = z.infer<typeof PaginationRequestSchema>
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>
export type SearchRequest = z.infer<typeof SearchRequestSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>
export type Metadata = z.infer<typeof MetadataSchema>
export type CPF = z.infer<typeof CPFSchema>
export type CRM = z.infer<typeof CRMSchema>
export type Phone = z.infer<typeof PhoneSchema>
export type Email = z.infer<typeof EmailSchema>
export type BaseStatus = z.infer<typeof BaseStatusSchema>
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>
export type Address = z.infer<typeof AddressSchema>
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>
export type MedicalInfo = z.infer<typeof MedicalInfoSchema>
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>
export type DateRangeFilter = z.infer<typeof DateRangeFilterSchema>
export type Gender = z.infer<typeof GenderSchema>
export type Tag = z.infer<typeof TagSchema>
export type FileUpload = z.infer<typeof FileUploadSchema>
export type AuditLog = z.infer<typeof AuditLogSchema>
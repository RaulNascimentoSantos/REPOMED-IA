import { z } from 'zod'

// 🚨 Tipos de erro padronizados (RFC 7807 - Problem Details)

// 📋 Problem Details base
export const ProblemDetailsSchema = z.object({
  type: z.string().url('Tipo deve ser uma URI válida'),
  title: z.string().min(1, 'Título é obrigatório'),
  status: z.number().int().min(100).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
  traceId: z.string().min(1, 'TraceId é obrigatório para rastreamento')
})

// 🔍 Erro de validação detalhado
export const ValidationErrorSchema = z.object({
  field: z.string().min(1),
  message: z.string().min(1),
  code: z.string().min(1),
  value: z.unknown().optional()
})

export const ValidationProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/validation-failed'),
  title: z.literal('Validation Failed'),
  status: z.literal(422),
  errors: z.array(ValidationErrorSchema)
})

// 🔐 Erro de autenticação
export const AuthenticationProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/authentication-failed'),
  title: z.literal('Authentication Failed'),
  status: z.literal(401)
})

// 🚫 Erro de autorização
export const AuthorizationProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/authorization-failed'),
  title: z.literal('Authorization Failed'),
  status: z.literal(403)
})

// 🔍 Recurso não encontrado
export const NotFoundProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/resource-not-found'),
  title: z.literal('Resource Not Found'),
  status: z.literal(404),
  resource: z.string().optional(),
  resourceId: z.string().optional()
})

// ⚡ Conflito de recurso
export const ConflictProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/resource-conflict'),
  title: z.literal('Resource Conflict'),
  status: z.literal(409),
  conflictingField: z.string().optional(),
  conflictingValue: z.unknown().optional()
})

// 🚦 Rate limit excedido
export const RateLimitProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/rate-limit-exceeded'),
  title: z.literal('Rate Limit Exceeded'),
  status: z.literal(429),
  retryAfter: z.number().optional(),
  limit: z.number().optional(),
  window: z.number().optional()
})

// 💥 Erro interno do servidor
export const InternalErrorProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/internal-server-error'),
  title: z.literal('Internal Server Error'),
  status: z.literal(500)
})

// 🔌 Erro de serviço indisponível
export const ServiceUnavailableProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/service-unavailable'),
  title: z.literal('Service Unavailable'),
  status: z.literal(503),
  retryAfter: z.number().optional()
})

// 🤖 Erro de integração com IA
export const AIServiceProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/ai-service-error'),
  title: z.literal('AI Service Error'),
  status: z.literal(502),
  provider: z.string().optional(),
  providerError: z.string().optional()
})

// 📄 Erro de geração de PDF
export const PDFGenerationProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/pdf-generation-failed'),
  title: z.literal('PDF Generation Failed'),
  status: z.literal(500),
  documentId: z.string().optional()
})

// ✍️ Erro de assinatura digital
export const SignatureProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/signature-failed'),
  title: z.literal('Digital Signature Failed'),
  status: z.literal(500),
  signatureProvider: z.string().optional()
})

// 🗂️ Erro de template
export const TemplateProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/template-error'),
  title: z.literal('Template Error'),
  status: z.literal(400),
  templateId: z.string().optional(),
  templateVersion: z.string().optional()
})

// 🏥 Erro de dados médicos
export const MedicalDataProblemDetailsSchema = ProblemDetailsSchema.extend({
  type: z.literal('/errors/medical-data-invalid'),
  title: z.literal('Medical Data Invalid'),
  status: z.literal(422),
  validationType: z.enum(['cpf', 'crm', 'cid', 'medication'])
})

// 📊 União de todos os tipos de erro
export const ErrorResponseSchema = z.discriminatedUnion('type', [
  ValidationProblemDetailsSchema,
  AuthenticationProblemDetailsSchema,
  AuthorizationProblemDetailsSchema,
  NotFoundProblemDetailsSchema,
  ConflictProblemDetailsSchema,
  RateLimitProblemDetailsSchema,
  InternalErrorProblemDetailsSchema,
  ServiceUnavailableProblemDetailsSchema,
  AIServiceProblemDetailsSchema,
  PDFGenerationProblemDetailsSchema,
  SignatureProblemDetailsSchema,
  TemplateProblemDetailsSchema,
  MedicalDataProblemDetailsSchema,
  ProblemDetailsSchema // fallback genérico
])

// 🎯 Códigos de erro específicos do domínio médico
export const MedicalErrorCodes = {
  // CPF
  INVALID_CPF_FORMAT: 'INVALID_CPF_FORMAT',
  CPF_ALREADY_EXISTS: 'CPF_ALREADY_EXISTS',
  
  // CRM
  INVALID_CRM_FORMAT: 'INVALID_CRM_FORMAT',
  CRM_NOT_VERIFIED: 'CRM_NOT_VERIFIED',
  CRM_EXPIRED: 'CRM_EXPIRED',
  
  // Documentos
  DOCUMENT_ALREADY_SIGNED: 'DOCUMENT_ALREADY_SIGNED',
  DOCUMENT_EXPIRED: 'DOCUMENT_EXPIRED',
  INVALID_DOCUMENT_STATE: 'INVALID_DOCUMENT_STATE',
  
  // Templates
  TEMPLATE_NOT_COMPATIBLE: 'TEMPLATE_NOT_COMPATIBLE',
  TEMPLATE_VERSION_MISMATCH: 'TEMPLATE_VERSION_MISMATCH',
  
  // Assinatura
  SIGNATURE_PROVIDER_UNAVAILABLE: 'SIGNATURE_PROVIDER_UNAVAILABLE',
  INVALID_CERTIFICATE: 'INVALID_CERTIFICATE',
  
  // PDF
  PDF_GENERATION_TIMEOUT: 'PDF_GENERATION_TIMEOUT',
  PDF_CORRUPTED: 'PDF_CORRUPTED'
} as const

// 🛠️ Utilitários para criação de erros
export const ErrorTypes = {
  VALIDATION_FAILED: '/errors/validation-failed',
  AUTHENTICATION_FAILED: '/errors/authentication-failed',
  AUTHORIZATION_FAILED: '/errors/authorization-failed',
  RESOURCE_NOT_FOUND: '/errors/resource-not-found',
  RESOURCE_CONFLICT: '/errors/resource-conflict',
  RATE_LIMIT_EXCEEDED: '/errors/rate-limit-exceeded',
  INTERNAL_SERVER_ERROR: '/errors/internal-server-error',
  SERVICE_UNAVAILABLE: '/errors/service-unavailable',
  AI_SERVICE_ERROR: '/errors/ai-service-error',
  PDF_GENERATION_FAILED: '/errors/pdf-generation-failed',
  SIGNATURE_FAILED: '/errors/signature-failed',
  TEMPLATE_ERROR: '/errors/template-error',
  MEDICAL_DATA_INVALID: '/errors/medical-data-invalid'
} as const

// Tipos TypeScript inferidos
export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>
export type ValidationError = z.infer<typeof ValidationErrorSchema>
export type ValidationProblemDetails = z.infer<typeof ValidationProblemDetailsSchema>
export type AuthenticationProblemDetails = z.infer<typeof AuthenticationProblemDetailsSchema>
export type AuthorizationProblemDetails = z.infer<typeof AuthorizationProblemDetailsSchema>
export type NotFoundProblemDetails = z.infer<typeof NotFoundProblemDetailsSchema>
export type ConflictProblemDetails = z.infer<typeof ConflictProblemDetailsSchema>
export type RateLimitProblemDetails = z.infer<typeof RateLimitProblemDetailsSchema>
export type InternalErrorProblemDetails = z.infer<typeof InternalErrorProblemDetailsSchema>
export type ServiceUnavailableProblemDetails = z.infer<typeof ServiceUnavailableProblemDetailsSchema>
export type AIServiceProblemDetails = z.infer<typeof AIServiceProblemDetailsSchema>
export type PDFGenerationProblemDetails = z.infer<typeof PDFGenerationProblemDetailsSchema>
export type SignatureProblemDetails = z.infer<typeof SignatureProblemDetailsSchema>
export type TemplateProblemDetails = z.infer<typeof TemplateProblemDetailsSchema>
export type MedicalDataProblemDetails = z.infer<typeof MedicalDataProblemDetailsSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

export type MedicalErrorCode = keyof typeof MedicalErrorCodes
export type ErrorType = typeof ErrorTypes[keyof typeof ErrorTypes]
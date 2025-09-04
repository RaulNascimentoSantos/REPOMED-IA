import { FastifyRequest, FastifyReply, FastifyError } from 'fastify'
import { ZodError } from 'zod'
// Temporary interfaces until contracts are resolved
interface ProblemDetails {
  type: string
  title: string
  status: number
  detail: string
  instance: string
  traceId: string
}

interface ValidationProblemDetails extends ProblemDetails {
  errors: Array<{
    field: string
    message: string
    code: string
    value?: unknown
  }>
}

const ErrorTypes = {
  VALIDATION_FAILED: '/errors/validation-failed',
  AUTHENTICATION_FAILED: '/errors/authentication-failed',
  AUTHORIZATION_FAILED: '/errors/authorization-failed',
  RESOURCE_NOT_FOUND: '/errors/resource-not-found',
  RESOURCE_CONFLICT: '/errors/resource-conflict',
  RATE_LIMIT_EXCEEDED: '/errors/rate-limit-exceeded',
  SERVICE_UNAVAILABLE: '/errors/service-unavailable',
  MEDICAL_DATA_INVALID: '/errors/medical-data-invalid',
  PDF_GENERATION_FAILED: '/errors/pdf-generation-failed',
  INTERNAL_SERVER_ERROR: '/errors/internal-server-error'
}

const MedicalErrorCodes = {
  INVALID_CPF_FORMAT: 'INVALID_CPF_FORMAT',
  INVALID_CRM_FORMAT: 'INVALID_CRM_FORMAT',
  DOCUMENT_ALREADY_SIGNED: 'DOCUMENT_ALREADY_SIGNED',
  PDF_GENERATION_TIMEOUT: 'PDF_GENERATION_TIMEOUT'
}

// 🚨 Middleware de tratamento de erros padronizado RFC 7807

interface CustomError extends Error {
  statusCode?: number
  code?: string
  validation?: ZodError
  traceId?: string
}

/**
 * Gera um ID único para rastreamento de erros
 */
function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Extrai informações úteis da request para contexto
 */
function getRequestContext(request: FastifyRequest) {
  return {
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
    ip: request.ip,
    userId: (request as any).user?.id
  }
}

/**
 * Cria Problem Details para erro de validação Zod
 */
function createValidationProblemDetails(
  zodError: ZodError, 
  request: FastifyRequest,
  traceId: string
): ValidationProblemDetails {
  const errors = zodError.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
    value: (issue as any).received
  }))

  return {
    type: ErrorTypes.VALIDATION_FAILED,
    title: 'Validation Failed',
    status: 422,
    detail: `Validation failed for ${errors.length} field(s)`,
    instance: request.url,
    traceId,
    errors
  }
}

/**
 * Cria Problem Details genérico
 */
function createProblemDetails(
  error: CustomError,
  request: FastifyRequest,
  traceId: string
): ProblemDetails {
  const status = error.statusCode || 500
  
  // Mapear códigos específicos para tipos RFC 7807
  switch (error.code || error.name) {
    case 'UNAUTHORIZED':
    case 'FST_JWT_NO_AUTHORIZATION_IN_HEADER':
      return {
        type: ErrorTypes.AUTHENTICATION_FAILED,
        title: 'Authentication Failed',
        status: 401,
        detail: 'Valid authentication credentials are required',
        instance: request.url,
        traceId
      }
    
    case 'FORBIDDEN':
    case 'INSUFFICIENT_PERMISSIONS':
      return {
        type: ErrorTypes.AUTHORIZATION_FAILED,
        title: 'Authorization Failed', 
        status: 403,
        detail: 'Insufficient permissions to access this resource',
        instance: request.url,
        traceId
      }
    
    case 'NOT_FOUND':
    case 'RESOURCE_NOT_FOUND':
      return {
        type: ErrorTypes.RESOURCE_NOT_FOUND,
        title: 'Resource Not Found',
        status: 404,
        detail: error.message || 'The requested resource was not found',
        instance: request.url,
        traceId
      }
    
    case 'CONFLICT':
    case 'DUPLICATE_RESOURCE':
      return {
        type: ErrorTypes.RESOURCE_CONFLICT,
        title: 'Resource Conflict',
        status: 409,
        detail: error.message || 'Resource conflict occurred',
        instance: request.url,
        traceId
      }
    
    case 'FST_TOO_MANY_REQUESTS':
      return {
        type: ErrorTypes.RATE_LIMIT_EXCEEDED,
        title: 'Rate Limit Exceeded',
        status: 429,
        detail: 'Too many requests, please slow down',
        instance: request.url,
        traceId
      }
    
    case 'SERVICE_UNAVAILABLE':
      return {
        type: ErrorTypes.SERVICE_UNAVAILABLE,
        title: 'Service Unavailable',
        status: 503,
        detail: error.message || 'Service temporarily unavailable',
        instance: request.url,
        traceId
      }
    
    // Erros específicos do domínio médico
    case MedicalErrorCodes.INVALID_CPF_FORMAT:
    case MedicalErrorCodes.INVALID_CRM_FORMAT:
      return {
        type: ErrorTypes.MEDICAL_DATA_INVALID,
        title: 'Medical Data Invalid',
        status: 422,
        detail: error.message || 'Invalid medical data format',
        instance: request.url,
        traceId
      }
    
    case MedicalErrorCodes.DOCUMENT_ALREADY_SIGNED:
      return {
        type: ErrorTypes.RESOURCE_CONFLICT,
        title: 'Resource Conflict',
        status: 409,
        detail: 'Document is already signed and cannot be modified',
        instance: request.url,
        traceId
      }
    
    case MedicalErrorCodes.PDF_GENERATION_TIMEOUT:
      return {
        type: ErrorTypes.PDF_GENERATION_FAILED,
        title: 'PDF Generation Failed',
        status: 500,
        detail: 'PDF generation timed out',
        instance: request.url,
        traceId
      }
    
    default:
      // Erro interno genérico
      return {
        type: ErrorTypes.INTERNAL_SERVER_ERROR,
        title: 'Internal Server Error',
        status: status >= 500 ? status : 500,
        detail: process.env.NODE_ENV === 'development' ? error.message : 'An internal server error occurred',
        instance: request.url,
        traceId
      }
  }
}

/**
 * Determina se deve expor detalhes do erro baseado no ambiente
 */
function shouldExposeErrorDetails(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
}

/**
 * Log estruturado do erro
 */
function logError(
  error: CustomError, 
  problemDetails: ProblemDetails,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const logLevel = problemDetails.status >= 500 ? 'error' : 'warn'
  const context = getRequestContext(request)
  
  request.log[logLevel]({
    error: {
      name: error.name,
      message: error.message,
      stack: shouldExposeErrorDetails() ? error.stack : undefined,
      code: error.code
    },
    problemDetails,
    request: context,
    traceId: problemDetails.traceId,
    timestamp: new Date().toISOString()
  }, `${problemDetails.title} - ${problemDetails.traceId}`)
}

/**
 * Handler principal de erros
 */
export async function errorHandler(
  error: FastifyError | CustomError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const traceId = (error as any).traceId || generateTraceId()
  
  // Adicionar traceId aos headers de resposta para tracking
  reply.header('X-Trace-ID', traceId)
  reply.header('Content-Type', 'application/problem+json')
  
  let problemDetails: ProblemDetails
  
  // Tratar erros de validação Zod
  if (error instanceof ZodError) {
    problemDetails = createValidationProblemDetails(error, request, traceId)
  } else {
    problemDetails = createProblemDetails(error as CustomError, request, traceId)
  }
  
  // Log do erro
  logError(error as CustomError, problemDetails, request, reply)
  
  // Remover informações sensíveis em produção
  if (!shouldExposeErrorDetails() && problemDetails.status >= 500) {
    problemDetails.detail = 'An internal server error occurred'
  }
  
  // Enviar resposta
  reply.code(problemDetails.status).send(problemDetails)
}

/**
 * Middleware para capturar erros não tratados
 */
export function setupErrorHandling(fastify: any) {
  // Handler de erro global
  fastify.setErrorHandler(errorHandler)
  
  // Hook para adicionar traceId a todas as requests
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    ;(request as any).traceId = generateTraceId()
  })
  
  // Hook para adicionar traceId aos logs de todas as responses
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    request.log.info({
      traceId: (request as any).traceId,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime()
    }, `${request.method} ${request.url} - ${reply.statusCode}`)
  })
  
  // Handler para 404s
  fastify.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    const traceId = (request as any).traceId || generateTraceId()
    
    const problemDetails: ProblemDetails = {
      type: ErrorTypes.RESOURCE_NOT_FOUND,
      title: 'Resource Not Found',
      status: 404,
      detail: `The requested resource '${request.url}' was not found`,
      instance: request.url,
      traceId
    }
    
    reply
      .code(404)
      .header('X-Trace-ID', traceId)
      .header('Content-Type', 'application/problem+json')
      .send(problemDetails)
  })
}

/**
 * Utilitários para criar erros personalizados
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly traceId: string
  
  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    traceId?: string
  ) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.traceId = traceId || generateTraceId()
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, traceId?: string) {
    super(message, 422, 'VALIDATION_ERROR', traceId)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string, traceId?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`
    super(message, 404, 'NOT_FOUND', traceId)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, traceId?: string) {
    super(message, 409, 'CONFLICT', traceId)
    this.name = 'ConflictError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', traceId?: string) {
    super(message, 401, 'UNAUTHORIZED', traceId)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access', traceId?: string) {
    super(message, 403, 'FORBIDDEN', traceId)
    this.name = 'ForbiddenError'
  }
}

// Erros específicos do domínio médico
export class MedicalDataError extends AppError {
  constructor(message: string, code: string, traceId?: string) {
    super(message, 422, code, traceId)
    this.name = 'MedicalDataError'
  }
}

export class DocumentError extends AppError {
  constructor(message: string, code: string, traceId?: string) {
    super(message, 400, code, traceId)
    this.name = 'DocumentError'
  }
}

export class SignatureError extends AppError {
  constructor(message: string, code: string, traceId?: string) {
    super(message, 500, code, traceId)
    this.name = 'SignatureError'
  }
}
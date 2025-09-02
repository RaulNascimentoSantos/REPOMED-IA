// CORREÇÃO CRÍTICA 3: LOGS SEM PHI + REDACTION
// Data: 31/08/2025 - Prioridade: P0

import pino from 'pino'
import crypto from 'crypto'

const generateTraceId = () => crypto.randomBytes(8).toString('hex')

// Lista de campos que SEMPRE devem ser removidos
const PHI_FIELDS = [
  'password',
  'cpf',
  'rg',
  'patient',
  'patientName',
  'patient_name',
  'medications',
  'diagnosis',
  'allergies',
  'chronicConditions',
  'birthDate',
  'phone',
  'email',
  'address',
  'authorization',
  'x-api-key',
  'cookie',
  'set-cookie',
  'signature',
  'certificate'
]

// Redaction profunda
function deepRedact(obj, fields) {
  if (!obj) return obj
  
  const redacted = { ...obj }
  
  for (const key in redacted) {
    // Checar se a chave deve ser redactada
    if (fields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED-PHI]'
      continue
    }
    
    // Recursão para objetos aninhados
    if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = deepRedact(redacted[key], fields)
    }
  }
  
  return redacted
}

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: PHI_FIELDS.flatMap(field => [
      field,
      `*.${field}`,
      `*.*.${field}`,
      `req.${field}`,
      `req.body.${field}`,
      `req.query.${field}`,
      `req.headers.${field}`,
      `res.${field}`,
      `error.${field}`
    ]),
    censor: '[REDACTED-PHI]',
    remove: false // Manter estrutura para debug
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url?.replace(/\/[0-9a-f-]{36}/g, '/:id'), // Anonimizar UUIDs
      path: req.routerPath,
      parameters: deepRedact(req.params, PHI_FIELDS),
      query: deepRedact(req.query, PHI_FIELDS),
      headers: {
        'x-request-id': req.id,
        'x-tenant-id': req.headers['x-tenant-id'],
        'user-agent': req.headers['user-agent']?.substring(0, 100), // Truncar
        'content-type': req.headers['content-type']
      }
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      responseTime: res.responseTime
    }),
    err: (err) => ({
      type: err.constructor.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      code: err.code,
      statusCode: err.statusCode
    })
  },
  formatters: {
    level: (label) => ({ level: label }),
    log: (obj) => ({
      ...obj,
      traceId: obj.traceId || generateTraceId(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      system: 'repomed-api'
    })
  },
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname'
    }
  } : undefined
})

// Middleware para adicionar traceId
export function loggerMiddleware(req, reply, done) {
  const traceId = req.headers['x-trace-id'] || generateTraceId()
  req.traceId = traceId
  reply.header('x-trace-id', traceId)
  
  // Log apenas metadados, nunca PHI
  req.log = logger.child({ 
    traceId,
    tenantId: req.tenantId,
    userId: req.user?.id,
    userRole: req.user?.role,
    requestId: req.id
  })
  
  done()
}

// Funcões utilitárias para logging seguro
export function logMedicalEvent(logger, event, metadata = {}) {
  // Sempre redactar metadados antes de logar
  const safeMetadata = deepRedact(metadata, PHI_FIELDS)
  
  logger.info({
    event: 'medical_event',
    eventType: event,
    metadata: safeMetadata,
    timestamp: new Date().toISOString()
  })
}

export function logSecurityEvent(logger, event, metadata = {}) {
  // Logs de segurança também precisam de redaction
  const safeMetadata = deepRedact(metadata, PHI_FIELDS)
  
  logger.warn({
    event: 'security_event',
    eventType: event,
    metadata: safeMetadata,
    timestamp: new Date().toISOString()
  })
}

export function logAuditEvent(logger, action, resource, metadata = {}) {
  // Auditoria com redaction automática
  const safeMetadata = deepRedact(metadata, PHI_FIELDS)
  
  logger.info({
    event: 'audit',
    action,
    resource,
    metadata: safeMetadata,
    timestamp: new Date().toISOString()
  })
}
import { z } from 'zod'
import { 
  UUIDSchema, 
  TimestampSchema, 
  MetadataSchema,
  SuccessResponseSchema 
} from '../types/common.js'

// ✍️ Schemas de Assinatura Digital

// 🔐 Tipos de assinatura suportados
export const SignatureTypeSchema = z.enum([
  'certificate',  // Certificado digital ICP-Brasil
  'biometric',   // Assinatura biométrica
  'pin',         // PIN/Senha
  'mock',        // Mock para desenvolvimento
  'hardware',    // Token/SmartCard
  'cloud'        // Assinatura em nuvem
])

// 📜 Certificado digital
export const DigitalCertificateSchema = z.object({
  serialNumber: z.string(),
  issuer: z.string(),
  subject: z.string(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  fingerprint: z.string(),
  publicKey: z.string().optional(),
  certificateChain: z.array(z.string()).optional(),
  isRevoked: z.boolean().default(false),
  revokedAt: z.string().datetime().optional(),
  revokedReason: z.string().optional()
})

// ✍️ Dados biométricos
export const BiometricDataSchema = z.object({
  type: z.enum(['fingerprint', 'face', 'voice', 'iris', 'hand']),
  hash: z.string(), // Hash dos dados biométricos
  confidence: z.number().min(0).max(1), // Nível de confiança (0-1)
  template: z.string().optional(), // Template biométrico criptografado
  device: z.object({
    id: z.string(),
    name: z.string(),
    manufacturer: z.string().optional()
  }).optional()
})

// 🏛️ Configuração de provedor de assinatura
export const SignatureProviderConfigSchema = z.object({
  provider: z.enum(['iti', 'valid', 'serpro', 'safeid', 'docusign', 'adobe', 'custom']),
  endpoint: z.string().url().optional(),
  credentials: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    apiKey: z.string().optional()
  }).optional(),
  options: z.record(z.unknown()).optional()
})

// 🆕 Solicitação de assinatura
export const CreateSignatureRequestSchema = z.object({
  documentId: UUIDSchema,
  signatureType: SignatureTypeSchema,
  
  // Dados específicos por tipo
  certificateData: z.object({
    certificate: z.string(), // Certificado em base64
    pin: z.string().optional(),
    privateKey: z.string().optional()
  }).optional(),
  
  biometricData: BiometricDataSchema.optional(),
  
  pinData: z.object({
    pin: z.string(),
    userId: UUIDSchema.optional()
  }).optional(),
  
  // Configurações da assinatura
  signatureConfig: z.object({
    reason: z.string().optional(), // Motivo da assinatura
    location: z.string().optional(), // Local da assinatura
    contactInfo: z.string().optional(),
    appearance: z.object({
      visible: z.boolean().default(true),
      page: z.number().default(-1), // -1 = última página
      position: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number()
      }).optional(),
      text: z.string().optional(),
      image: z.string().optional() // base64
    }).optional(),
    timestampServer: z.string().url().optional(),
    ocspResponder: z.string().url().optional()
  }).optional(),
  
  // Metadados
  metadata: MetadataSchema.optional(),
  
  // Configurações do provedor
  provider: SignatureProviderConfigSchema.optional()
})

export const CreateSignatureResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    signatureId: UUIDSchema,
    status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
    signedAt: z.string().datetime().optional(),
    documentHash: z.string().optional(),
    signatureHash: z.string().optional()
  })
})

// ✍️ Assinatura completa
export const SignatureSchema = z.object({
  id: UUIDSchema,
  documentId: UUIDSchema,
  signerId: UUIDSchema,
  signerName: z.string(),
  signerEmail: z.string().email(),
  
  // Tipo e status
  type: SignatureTypeSchema,
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'expired', 'revoked']),
  
  // Dados da assinatura
  signedAt: z.string().datetime().optional(),
  signatureValue: z.string().optional(), // Assinatura em base64
  signatureHash: z.string().optional(),
  documentHash: z.string(),
  
  // Certificado (se aplicável)
  certificate: DigitalCertificateSchema.optional(),
  
  // Dados biométricos (se aplicável)
  biometric: BiometricDataSchema.optional(),
  
  // Configurações utilizadas
  config: z.object({
    reason: z.string().optional(),
    location: z.string().optional(),
    contactInfo: z.string().optional(),
    timestampServer: z.string().optional()
  }).optional(),
  
  // Timestamp qualificado
  timestamp: z.object({
    server: z.string(),
    timestamp: z.string().datetime(),
    hash: z.string(),
    signature: z.string()
  }).optional(),
  
  // Validação OCSP
  ocspResponse: z.object({
    status: z.enum(['good', 'revoked', 'unknown']),
    thisUpdate: z.string().datetime(),
    nextUpdate: z.string().datetime().optional(),
    responderUrl: z.string().url()
  }).optional(),
  
  // Verificação
  verification: z.object({
    isValid: z.boolean(),
    verifiedAt: z.string().datetime(),
    errors: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional()
  }).optional(),
  
  // Provedor utilizado
  provider: z.object({
    name: z.string(),
    version: z.string().optional(),
    transactionId: z.string().optional()
  }).optional(),
  
  // Informações de auditoria
  auditTrail: z.array(z.object({
    action: z.string(),
    timestamp: z.string().datetime(),
    actor: z.string(),
    details: z.record(z.unknown()).optional()
  })).optional(),
  
  // Metadados adicionais
  metadata: MetadataSchema.optional(),
  
  // Informações técnicas
  technical: z.object({
    algorithm: z.string().optional(),
    keySize: z.number().optional(),
    padding: z.string().optional(),
    digest: z.string().optional()
  }).optional()
}).merge(TimestampSchema)

export const SignatureResponseSchema = SuccessResponseSchema.extend({
  data: SignatureSchema
})

// 📋 Listar assinaturas
export const ListSignaturesRequestSchema = z.object({
  documentId: UUIDSchema.optional(),
  signerId: UUIDSchema.optional(),
  type: SignatureTypeSchema.optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'expired', 'revoked']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

export const ListSignaturesResponseSchema = SuccessResponseSchema.extend({
  data: z.array(SignatureSchema)
})

// 🔍 Verificar assinatura
export const VerifySignatureRequestSchema = z.object({
  signatureId: UUIDSchema.optional(),
  documentHash: z.string().optional(),
  signatureData: z.string().optional(), // Dados da assinatura para verificar
  includeOCSP: z.boolean().default(true),
  includeTimestamp: z.boolean().default(true)
}).refine(data => 
  data.signatureId || (data.documentHash && data.signatureData), 
  { message: "Deve fornecer signatureId OU (documentHash + signatureData)" }
)

export const VerifySignatureResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    isValid: z.boolean(),
    verifiedAt: z.string().datetime(),
    signature: SignatureSchema.optional(),
    
    // Detalhes da verificação
    verification: z.object({
      certificateValid: z.boolean().optional(),
      certificateExpired: z.boolean().optional(),
      certificateRevoked: z.boolean().optional(),
      timestampValid: z.boolean().optional(),
      documentIntact: z.boolean(),
      algorithmSupported: z.boolean()
    }),
    
    // Erros e avisos
    errors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      severity: z.enum(['error', 'warning', 'info'])
    })),
    
    // Informações do certificado
    certificateInfo: DigitalCertificateSchema.optional(),
    
    // Cadeia de confiança
    trustChain: z.array(z.object({
      subject: z.string(),
      issuer: z.string(),
      valid: z.boolean()
    })).optional()
  })
})

// 🔄 Status da assinatura
export const SignatureStatusRequestSchema = z.object({
  signatureId: UUIDSchema
})

export const SignatureStatusResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: UUIDSchema,
    status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'expired', 'revoked']),
    progress: z.number().min(0).max(100).optional(),
    message: z.string().optional(),
    estimatedCompletion: z.string().datetime().optional(),
    lastUpdate: z.string().datetime()
  })
})

// ❌ Cancelar assinatura
export const CancelSignatureRequestSchema = z.object({
  signatureId: UUIDSchema,
  reason: z.string().min(1, 'Motivo é obrigatório')
})

export const CancelSignatureResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: UUIDSchema,
    status: z.literal('revoked'),
    revokedAt: z.string().datetime(),
    revokedReason: z.string()
  })
})

// 📊 Estatísticas de assinatura
export const SignatureStatsRequestSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  groupBy: z.enum(['type', 'status', 'provider', 'signer']).optional()
})

export const SignatureStatsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    total: z.number(),
    byType: z.record(z.string(), z.number()),
    byStatus: z.record(z.string(), z.number()),
    byProvider: z.record(z.string(), z.number()),
    successRate: z.number(),
    averageTime: z.number(), // em segundos
    failureReasons: z.record(z.string(), z.number())
  })
})

// 🔗 Batch de assinaturas (múltiplos documentos)
export const BatchSignatureRequestSchema = z.object({
  documentIds: z.array(UUIDSchema).min(1).max(50),
  signatureType: SignatureTypeSchema,
  certificateData: z.object({
    certificate: z.string(),
    pin: z.string().optional()
  }).optional(),
  biometricData: BiometricDataSchema.optional(),
  pinData: z.object({
    pin: z.string()
  }).optional(),
  signatureConfig: z.object({
    reason: z.string().optional(),
    location: z.string().optional()
  }).optional()
})

export const BatchSignatureResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    batchId: UUIDSchema,
    total: z.number(),
    signatures: z.array(z.object({
      documentId: UUIDSchema,
      signatureId: UUIDSchema,
      status: z.enum(['pending', 'completed', 'failed'])
    }))
  })
})

// Tipos TypeScript inferidos
export type SignatureType = z.infer<typeof SignatureTypeSchema>
export type DigitalCertificate = z.infer<typeof DigitalCertificateSchema>
export type BiometricData = z.infer<typeof BiometricDataSchema>
export type SignatureProviderConfig = z.infer<typeof SignatureProviderConfigSchema>
export type CreateSignatureRequest = z.infer<typeof CreateSignatureRequestSchema>
export type CreateSignatureResponse = z.infer<typeof CreateSignatureResponseSchema>
export type Signature = z.infer<typeof SignatureSchema>
export type SignatureResponse = z.infer<typeof SignatureResponseSchema>
export type ListSignaturesRequest = z.infer<typeof ListSignaturesRequestSchema>
export type ListSignaturesResponse = z.infer<typeof ListSignaturesResponseSchema>
export type VerifySignatureRequest = z.infer<typeof VerifySignatureRequestSchema>
export type VerifySignatureResponse = z.infer<typeof VerifySignatureResponseSchema>
export type SignatureStatusRequest = z.infer<typeof SignatureStatusRequestSchema>
export type SignatureStatusResponse = z.infer<typeof SignatureStatusResponseSchema>
export type CancelSignatureRequest = z.infer<typeof CancelSignatureRequestSchema>
export type CancelSignatureResponse = z.infer<typeof CancelSignatureResponseSchema>
export type SignatureStatsRequest = z.infer<typeof SignatureStatsRequestSchema>
export type SignatureStatsResponse = z.infer<typeof SignatureStatsResponseSchema>
export type BatchSignatureRequest = z.infer<typeof BatchSignatureRequestSchema>
export type BatchSignatureResponse = z.infer<typeof BatchSignatureResponseSchema>
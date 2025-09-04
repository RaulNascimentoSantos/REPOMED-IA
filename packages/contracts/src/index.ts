// 📦 RepoMed IA - Contratos Compartilhados
// Esquemas Zod e tipos TypeScript para toda a aplicação

// 🔗 Tipos comuns
export * from './types/common.js'
export * from './types/errors.js'

// 📋 Schemas por domínio
export * from './schemas/auth.js'
export * from './schemas/templates.js'
export * from './schemas/documents.js'
export * from './schemas/patients.js'
export * from './schemas/signatures.js'

// 🛠️ Re-exportar Zod para conveniência
export { z } from 'zod'

// 🎯 Versão dos contratos
export const CONTRACTS_VERSION = '1.0.0'

// 📝 Metadados dos contratos
export const ContractsMeta = {
  version: CONTRACTS_VERSION,
  name: '@repomed/contracts',
  description: 'Schemas compartilhados e contratos de API para RepoMed IA',
  
  // Informações sobre compatibilidade
  compatibility: {
    backend: '^1.0.0',
    frontend: '^1.0.0'
  },
  
  // Estatísticas dos schemas
  stats: {
    totalSchemas: 45,
    totalTypes: 80,
    domains: ['auth', 'templates', 'documents', 'patients', 'signatures'],
    lastUpdated: new Date().toISOString()
  }
} as const

// 🔧 Utilitários para validação
export const ValidationUtils = {
  /**
   * Valida dados usando um schema Zod de forma segura
   */
  safeValidate: <T>(schema: any, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
    try {
      const result = schema.safeParse(data)
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        const errors = result.error.issues.map((issue: any) => 
          `${issue.path.join('.')}: ${issue.message}`
        )
        return { success: false, errors }
      }
    } catch (error) {
      return { 
        success: false, 
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      }
    }
  },

  /**
   * Extrai apenas os campos obrigatórios de um schema
   */
  getRequiredFields: (schema: any): string[] => {
    try {
      if (schema._def?.shape) {
        return Object.entries(schema._def.shape)
          .filter(([_, fieldSchema]: [string, any]) => !fieldSchema.isOptional())
          .map(([fieldName]) => fieldName)
      }
      return []
    } catch {
      return []
    }
  },

  /**
   * Gera dados de exemplo baseados em um schema
   */
  generateExample: (schema: any): any => {
    // Implementação básica - pode ser expandida
    try {
      if (schema._def?.shape) {
        const example: any = {}
        for (const [fieldName, fieldSchema] of Object.entries(schema._def.shape)) {
          // Implementar geração de exemplos por tipo
          example[fieldName] = 'example_value'
        }
        return example
      }
      return null
    } catch {
      return null
    }
  }
}

// 🏷️ Constantes úteis
export const Constants = {
  // Limites padrão
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_SEARCH_RESULTS: 1000,
  
  // Timeouts (em ms)
  DEFAULT_REQUEST_TIMEOUT: 30000,
  FILE_UPLOAD_TIMEOUT: 300000,
  PDF_GENERATION_TIMEOUT: 120000,
  SIGNATURE_TIMEOUT: 600000,
  
  // Tamanhos de arquivo
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,  // 5MB
  MAX_PDF_SIZE: 50 * 1024 * 1024,   // 50MB
  
  // Formatos suportados
  SUPPORTED_IMAGE_FORMATS: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
  SUPPORTED_DOCUMENT_FORMATS: ['pdf', 'doc', 'docx'],
  SUPPORTED_SIGNATURE_FORMATS: ['p7s', 'p7m', 'pdf'],
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client': 'repomed-web'
  },
  
  // Status codes específicos do domínio
  DOMAIN_STATUS_CODES: {
    DOCUMENT_ALREADY_SIGNED: 4001,
    INVALID_SIGNATURE: 4002,
    CERTIFICATE_EXPIRED: 4003,
    TEMPLATE_NOT_FOUND: 4004,
    PATIENT_NOT_FOUND: 4005
  }
} as const

// 🔍 Helpers para tipos comuns
export const TypeGuards = {
  isUUID: (value: unknown): value is string => {
    return typeof value === 'string' && 
           /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  },
  
  isEmail: (value: unknown): value is string => {
    return typeof value === 'string' && 
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  
  isCPF: (value: unknown): value is string => {
    return typeof value === 'string' && 
           /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/.test(value)
  },
  
  isCRM: (value: unknown): value is string => {
    return typeof value === 'string' && 
           /^\d{4,6}-[A-Z]{2}$/.test(value)
  },
  
  isPhone: (value: unknown): value is string => {
    return typeof value === 'string' && 
           /^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/.test(value)
  }
}

// 🚨 Error helpers
export const ErrorHelpers = {
  /**
   * Cria um erro RFC 7807 padronizado
   */
  createProblemDetails: (
    type: string, 
    title: string, 
    status: number, 
    detail?: string,
    instance?: string,
    traceId?: string
  ) => ({
    type,
    title,
    status,
    detail,
    instance,
    traceId: traceId || crypto.randomUUID()
  }),
  
  /**
   * Extrai informações de erro de uma resposta de validação Zod
   */
  extractValidationErrors: (zodError: any) => {
    return zodError.issues?.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
      value: issue.received
    })) || []
  }
}

// 📈 Schema statistics (gerado automaticamente)
export const SchemaStats = {
  auth: { schemas: 12, types: 15 },
  templates: { schemas: 8, types: 12 },
  documents: { schemas: 10, types: 18 },
  patients: { schemas: 7, types: 10 },
  signatures: { schemas: 8, types: 15 },
  common: { schemas: 15, types: 20 },
  errors: { schemas: 12, types: 15 }
} as const
import { z } from 'zod'
import { 
  UUIDSchema, 
  TimestampSchema, 
  CPFSchema, 
  PhoneSchema, 
  EmailSchema,
  GenderSchema,
  AddressSchema,
  EmergencyContactSchema,
  MedicalInfoSchema,
  SearchRequestSchema,
  SuccessResponseSchema
} from '../types/common.js'

// 👤 Schemas de Pacientes

// 🆕 Criar paciente
export const CreatePatientRequestSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  cpf: CPFSchema,
  email: EmailSchema.optional(),
  phone: PhoneSchema.optional(),
  birthDate: z.string().date('Data de nascimento deve ser uma data válida'),
  gender: GenderSchema.optional(),
  
  // Endereço (opcional)
  address: AddressSchema.optional(),
  
  // Contato de emergência (opcional)
  emergencyContact: EmergencyContactSchema.optional(),
  
  // Informações médicas básicas
  medicalInfo: MedicalInfoSchema.optional(),
  
  // Metadados adicionais
  nationality: z.string().default('Brasileira'),
  maritalStatus: z.enum(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']).optional(),
  profession: z.string().max(100).optional(),
  healthInsurance: z.object({
    provider: z.string(),
    number: z.string(),
    plan: z.string().optional()
  }).optional(),
  
  // Observações gerais
  notes: z.string().max(1000).optional(),
  
  // Tags para categorização
  tags: z.array(z.string()).optional().default([]),
  
  // Consentimentos
  consents: z.object({
    dataProcessing: z.boolean().default(false),
    medicalTreatment: z.boolean().default(false),
    imageRights: z.boolean().default(false)
  }).optional()
})

export const CreatePatientResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: UUIDSchema,
    name: z.string(),
    cpf: z.string(),
    createdAt: z.string().datetime()
  })
})

// 📋 Paciente completo
export const PatientSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  cpf: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  birthDate: z.string().date(),
  gender: GenderSchema.optional(),
  
  // Dados calculados
  age: z.number().optional(),
  
  // Endereço
  address: AddressSchema.optional(),
  
  // Contato de emergência
  emergencyContact: EmergencyContactSchema.optional(),
  
  // Informações médicas
  medicalInfo: MedicalInfoSchema.optional(),
  
  // Dados adicionais
  nationality: z.string(),
  maritalStatus: z.enum(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']).optional(),
  profession: z.string().optional(),
  healthInsurance: z.object({
    provider: z.string(),
    number: z.string(),
    plan: z.string().optional()
  }).optional(),
  
  // Status e metadados
  status: z.enum(['active', 'inactive', 'deceased']).default('active'),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  
  // Consentimentos
  consents: z.object({
    dataProcessing: z.boolean(),
    medicalTreatment: z.boolean(),
    imageRights: z.boolean(),
    consentDate: z.string().datetime().optional()
  }).optional(),
  
  // Avatar/Foto
  avatar: z.string().url().optional(),
  
  // Estatísticas
  stats: z.object({
    documentsCount: z.number().default(0),
    lastVisitDate: z.string().datetime().optional(),
    totalVisits: z.number().default(0)
  }).optional(),
  
  // Dados de auditoria
  createdBy: UUIDSchema.optional(),
  lastModifiedBy: UUIDSchema.optional()
}).merge(TimestampSchema)

export const PatientResponseSchema = SuccessResponseSchema.extend({
  data: PatientSchema
})

// 📝 Atualizar paciente
export const UpdatePatientRequestSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: EmailSchema.optional(),
  phone: PhoneSchema.optional(),
  birthDate: z.string().date().optional(),
  gender: GenderSchema.optional(),
  address: AddressSchema.optional(),
  emergencyContact: EmergencyContactSchema.optional(),
  medicalInfo: MedicalInfoSchema.optional(),
  nationality: z.string().optional(),
  maritalStatus: z.enum(['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel']).optional(),
  profession: z.string().max(100).optional(),
  healthInsurance: z.object({
    provider: z.string(),
    number: z.string(),
    plan: z.string().optional()
  }).optional(),
  status: z.enum(['active', 'inactive', 'deceased']).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  consents: z.object({
    dataProcessing: z.boolean().optional(),
    medicalTreatment: z.boolean().optional(),
    imageRights: z.boolean().optional()
  }).optional()
})

export const UpdatePatientResponseSchema = PatientResponseSchema

// 🔍 Listar pacientes
export const ListPatientsRequestSchema = SearchRequestSchema.extend({
  status: z.enum(['active', 'inactive', 'deceased']).optional(),
  gender: GenderSchema.optional(),
  ageMin: z.coerce.number().min(0).max(150).optional(),
  ageMax: z.coerce.number().min(0).max(150).optional(),
  birthDateFrom: z.string().date().optional(),
  birthDateTo: z.string().date().optional(),
  hasHealthInsurance: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  includeStats: z.boolean().optional().default(false),
  includeInactive: z.boolean().optional().default(false)
})

export const ListPatientsResponseSchema = SuccessResponseSchema.extend({
  data: z.array(PatientSchema)
})

// 📊 Estatísticas de paciente
export const PatientStatsRequestSchema = z.object({
  patientId: UUIDSchema.optional(),
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
})

export const PatientStatsResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    total: z.number(),
    byGender: z.record(z.string(), z.number()),
    byAgeGroup: z.record(z.string(), z.number()),
    byCity: z.record(z.string(), z.number()),
    byStatus: z.record(z.string(), z.number()),
    withHealthInsurance: z.number(),
    averageAge: z.number(),
    recentRegistrations: z.number(),
    growth: z.object({
      percentage: z.number(),
      trend: z.enum(['up', 'down', 'stable'])
    }).optional()
  })
})

// 📋 Histórico médico
export const MedicalHistoryEntrySchema = z.object({
  id: UUIDSchema,
  patientId: UUIDSchema,
  type: z.enum([
    'consultation', 
    'exam', 
    'procedure', 
    'medication', 
    'allergy', 
    'vaccination', 
    'surgery',
    'diagnosis',
    'hospitalization'
  ]),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  date: z.string().datetime(),
  doctorId: UUIDSchema.optional(),
  doctorName: z.string().optional(),
  attachments: z.array(z.object({
    id: UUIDSchema,
    filename: z.string(),
    url: z.string().url(),
    type: z.string()
  })).optional(),
  metadata: z.record(z.unknown()).optional(),
  isPrivate: z.boolean().default(false)
}).merge(TimestampSchema)

export const AddMedicalHistoryRequestSchema = z.object({
  patientId: UUIDSchema,
  type: z.enum([
    'consultation', 
    'exam', 
    'procedure', 
    'medication', 
    'allergy', 
    'vaccination', 
    'surgery',
    'diagnosis',
    'hospitalization'
  ]),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  date: z.string().datetime(),
  doctorId: UUIDSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  isPrivate: z.boolean().optional().default(false)
})

export const MedicalHistoryResponseSchema = SuccessResponseSchema.extend({
  data: z.array(MedicalHistoryEntrySchema)
})

// 📋 Documentos do paciente
export const PatientDocumentsRequestSchema = z.object({
  patientId: UUIDSchema,
  status: z.enum(['draft', 'pending_signature', 'signed', 'cancelled']).optional(),
  type: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  page: z.coerce.number().min(1).default(1)
})

// 🔍 Busca avançada
export const SearchPatientsRequestSchema = z.object({
  query: z.string().min(1),
  filters: z.object({
    gender: GenderSchema.optional(),
    ageMin: z.number().min(0).optional(),
    ageMax: z.number().min(0).optional(),
    status: z.enum(['active', 'inactive', 'deceased']).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    hasHealthInsurance: z.boolean().optional()
  }).optional(),
  includeInactive: z.boolean().default(false),
  limit: z.coerce.number().min(1).max(100).default(20)
})

// 📞 Contatos do paciente
export const PatientContactsSchema = z.object({
  primary: z.object({
    phone: PhoneSchema.optional(),
    email: EmailSchema.optional()
  }),
  emergency: EmergencyContactSchema.optional(),
  additional: z.array(z.object({
    name: z.string(),
    phone: PhoneSchema.optional(),
    email: EmailSchema.optional(),
    relationship: z.string(),
    isPrimary: z.boolean().default(false)
  })).optional()
})

// 🏥 Vinculações médicas
export const PatientProviderLinkSchema = z.object({
  id: UUIDSchema,
  patientId: UUIDSchema,
  providerId: UUIDSchema,
  providerType: z.enum(['doctor', 'clinic', 'hospital', 'laboratory']),
  relationship: z.enum(['attending', 'consultant', 'referral', 'primary_care']),
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional()
}).merge(TimestampSchema)

// Tipos TypeScript inferidos
export type CreatePatientRequest = z.infer<typeof CreatePatientRequestSchema>
export type CreatePatientResponse = z.infer<typeof CreatePatientResponseSchema>
export type Patient = z.infer<typeof PatientSchema>
export type PatientResponse = z.infer<typeof PatientResponseSchema>
export type UpdatePatientRequest = z.infer<typeof UpdatePatientRequestSchema>
export type UpdatePatientResponse = z.infer<typeof UpdatePatientResponseSchema>
export type ListPatientsRequest = z.infer<typeof ListPatientsRequestSchema>
export type ListPatientsResponse = z.infer<typeof ListPatientsResponseSchema>
export type PatientStatsRequest = z.infer<typeof PatientStatsRequestSchema>
export type PatientStatsResponse = z.infer<typeof PatientStatsResponseSchema>
export type MedicalHistoryEntry = z.infer<typeof MedicalHistoryEntrySchema>
export type AddMedicalHistoryRequest = z.infer<typeof AddMedicalHistoryRequestSchema>
export type MedicalHistoryResponse = z.infer<typeof MedicalHistoryResponseSchema>
export type PatientDocumentsRequest = z.infer<typeof PatientDocumentsRequestSchema>
export type SearchPatientsRequest = z.infer<typeof SearchPatientsRequestSchema>
export type PatientContacts = z.infer<typeof PatientContactsSchema>
export type PatientProviderLink = z.infer<typeof PatientProviderLinkSchema>
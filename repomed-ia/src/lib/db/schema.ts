import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, serial } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Templates médicos (apenas 4 tabelas conforme V1)
export const templates = pgTable('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  specialty: varchar('specialty', { length: 100 }).notNull(),
  description: text('description'),
  contentJson: jsonb('content_json').notNull(),
  fieldsSchema: jsonb('fields_schema').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// Documentos gerados
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateId: uuid('template_id').references(() => templates.id).notNull(),
  patientName: varchar('patient_name', { length: 255 }).notNull(),
  doctorName: varchar('doctor_name', { length: 255 }).notNull(),
  doctorCrm: varchar('doctor_crm', { length: 20 }).notNull(),
  dataJson: jsonb('data_json').notNull(),
  pdfUrl: text('pdf_url'),
  hash: varchar('hash', { length: 64 }).notNull(),
  qrCode: text('qr_code'),
  isSigned: boolean('is_signed').default(false),
  signedAt: timestamp('signed_at'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// Compartilhamentos
export const shares = pgTable('shares', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id).notNull(),
  token: varchar('token', { length: 64 }).unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  accessCount: serial('access_count'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// Logs de auditoria
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id),
  action: varchar('action', { length: 50 }).notNull(),
  actorName: varchar('actor_name', { length: 255 }),
  actorEmail: varchar('actor_email', { length: 255 }),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})

// Types inferred from schema
export type Template = typeof templates.$inferSelect
export type NewTemplate = typeof templates.$inferInsert
export type Document = typeof documents.$inferSelect  
export type NewDocument = typeof documents.$inferInsert
export type Share = typeof shares.$inferSelect
export type NewShare = typeof shares.$inferInsert
export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  crm: varchar('crm', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('medico'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Templates médicos (apenas 4 tabelas conforme V1)
export const templates = pgTable('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  fields: jsonb('fields').default('[]'),
  isActive: boolean('is_active').default(true),
  organizationId: uuid('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Documentos gerados
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateId: varchar('template_id', { length: 255 }),
  title: varchar('title', { length: 255 }).notNull(),
  content: jsonb('content').default('{}'),
  patientName: varchar('patient_name', { length: 255 }),
  doctorName: varchar('doctor_name', { length: 255 }),
  doctorCrm: varchar('doctor_crm', { length: 20 }),
  dataJson: jsonb('data_json'),
  pdfUrl: text('pdf_url'),
  hash: varchar('hash', { length: 64 }),
  qrCode: text('qr_code'),
  isSigned: boolean('is_signed').default(false),
  signedAt: timestamp('signed_at'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Compartilhamentos
export const shares = pgTable('shares', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id).notNull(),
  token: varchar('token', { length: 64 }).unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  accessCount: serial('access_count'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

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
});

// Types inferred from schema
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type Document = typeof documents.$inferSelect;  
export type NewDocument = typeof documents.$inferInsert;
export type Share = typeof shares.$inferSelect;
export type NewShare = typeof shares.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

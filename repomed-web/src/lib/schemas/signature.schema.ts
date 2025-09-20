import { z } from 'zod';

export const SignatureMetadataSchema = z.object({
  algorithm: z.enum(['RSA-SHA256', 'ECDSA-SHA256']),
  keySize: z.number().min(2048, 'Tamanho de chave muito pequeno'),
  timestamp: z.string().datetime('Timestamp da assinatura inválido'),
  location: z.string().optional(),
  reason: z.string().optional(),
});

export const CertificateSchema = z.object({
  subjectName: z.string().min(3, 'Nome do titular obrigatório'),
  issuerName: z.string().min(3, 'Nome do emissor obrigatório'),
  serialNumber: z.string().min(1, 'Número de série obrigatório'),
  validFrom: z.string().datetime('Data de início de validade inválida'),
  validTo: z.string().datetime('Data de fim de validade inválida'),
  fingerprint: z.string().min(40, 'Fingerprint do certificado inválido'),
  keyUsage: z.array(z.string()).min(1, 'Uso da chave obrigatório'),
  icpBrasil: z.boolean().default(false),
});

export const SignatureValidationSchema = z.object({
  isValid: z.boolean(),
  signatureIntact: z.boolean(),
  certificateValid: z.boolean(),
  certificateChain: z.array(CertificateSchema),
  trustAnchor: z.string().optional(),
  revocationStatus: z.enum(['valid', 'revoked', 'unknown']),
  validationTime: z.string().datetime('Tempo de validação inválido'),
  errors: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});

export const DigitalSignatureSchema = z.object({
  id: z.string().uuid('ID da assinatura inválido').optional(),
  documentId: z.string().uuid('ID do documento inválido'),
  signerCertificate: CertificateSchema,
  signatureValue: z.string().min(1, 'Valor da assinatura obrigatório'),
  signedHash: z.string().min(64, 'Hash assinado inválido'),
  metadata: SignatureMetadataSchema,
  validation: SignatureValidationSchema.optional(),
  createdAt: z.string().datetime('Data de criação inválida'),
});

export const SignatureVerificationRequestSchema = z.object({
  hash: z.string().min(64, 'Hash de verificação inválido'),
  documentContent: z.string().optional(),
  includeMetadata: z.boolean().default(false),
});

export type SignatureMetadata = z.infer<typeof SignatureMetadataSchema>;
export type Certificate = z.infer<typeof CertificateSchema>;
export type SignatureValidation = z.infer<typeof SignatureValidationSchema>;
export type DigitalSignature = z.infer<typeof DigitalSignatureSchema>;
export type SignatureVerificationRequest = z.infer<typeof SignatureVerificationRequestSchema>;
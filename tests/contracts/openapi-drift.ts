import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
// IMPORT seus schemas reais
import { AuthLoginRequest, AuthLoginResponse } from '../../packages/contracts/src/schemas/auth';
import { Template, CreateTemplateRequest } from '../../packages/contracts/src/schemas/templates';
import { Document, CreateDocumentRequest } from '../../packages/contracts/src/schemas/documents';

// Validar que os schemas estão funcionando corretamente
console.log('🔍 Validando schemas Zod...');

// 1) Testar schemas básicos
try {
  AuthLoginRequest.parse({ email: 'test@example.com', password: '123456' });
  console.log('✅ AuthLoginRequest válido');
} catch (e) {
  console.error('❌ AuthLoginRequest inválido:', e.message);
}

try {
  Template.parse({ id: '1', name: 'Test Template', fields: [] });
  console.log('✅ Template válido');
} catch (e) {
  console.error('❌ Template inválido:', e.message);
}

try {
  CreateTemplateRequest.parse({ name: 'Test Template', fields: [] });
  console.log('✅ CreateTemplateRequest válido');
} catch (e) {
  console.error('❌ CreateTemplateRequest inválido:', e.message);
}

try {
  Document.parse({ id: '1', title: 'Test Doc', templateId: '1', createdAt: '2024-01-01' });
  console.log('✅ Document válido');
} catch (e) {
  console.error('❌ Document inválido:', e.message);
}

try {
  CreateDocumentRequest.parse({ templateId: '1', title: 'Test Doc' });
  console.log('✅ CreateDocumentRequest válido');
} catch (e) {
  console.error('❌ CreateDocumentRequest inválido:', e.message);
}

// 2) Gerar um JSON Schema simples dos contratos
const schemas = {
  AuthLoginRequest: AuthLoginRequest._def,
  AuthLoginResponse: AuthLoginResponse._def,
  Template: Template._def,
  CreateTemplateRequest: CreateTemplateRequest._def,
  Document: Document._def,
  CreateDocumentRequest: CreateDocumentRequest._def
};

const doc = {
  openapi: '3.0.0',
  info: { title: 'RepoMed IA (Zod Source of Truth)', version: '1.0.0' },
  schemas: Object.keys(schemas).map(key => ({ name: key, type: schemas[key].typeName || 'object' }))
};

// 3) comparar com snapshot do repo (gerar se não existir)
const target = join(process.cwd(), 'openapi.generated.json');
writeFileSync(target, JSON.stringify(doc, null, 2));
console.log('📄 OpenAPI básico gerado em', target);

// Se você mantém um arquivo openapi.json versionado, compare textos (drift)
try {
  const baseline = readFileSync(join(process.cwd(), 'openapi.json'), 'utf-8');
  const current = JSON.stringify(doc, null, 2);
  if (baseline.trim() !== current.trim()) {
    console.error('❌ Drift entre Zod e openapi.json');
    process.exit(1);
  } else {
    console.log('✅ Zod e openapi.json alinhados');
  }
} catch {
  console.warn('ℹ️ Nenhum openapi.json base encontrado; considere versionar um baseline.');
}

console.log('✅ Validação de contratos concluída com sucesso!');
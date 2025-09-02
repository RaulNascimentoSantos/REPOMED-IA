import { createHash, randomBytes } from 'crypto'

export async function generateDocumentHash(documentData: any): Promise<string> {
  const dataString = JSON.stringify(documentData, Object.keys(documentData).sort())
  return createHash('sha256').update(dataString).digest('hex')
}

export async function generateQRCode(hash: string): Promise<string> {
  // Para V1, vamos usar um QR code simples com o hash
  // Em produção, isso seria substituído por uma biblioteca de QR code real
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${hash}`
  return `qr:${verificationUrl}`
}

export function generateShareToken(): string {
  return randomBytes(32).toString('hex')
}

export function validateCID10(code: string): boolean {
  // Validação básica de formato CID-10
  // Em produção, isso seria validado contra a base oficial
  const cidPattern = /^[A-Z]\d{2}(\.\d{1,2})?$/
  return cidPattern.test(code.toUpperCase())
}

export function formatMedicalDocument(template: any, data: any): string {
  // Handle case where template might not have contentJson or content
  let content = ''
  
  if (template?.contentJson?.content) {
    content = template.contentJson.content
  } else if (template?.name) {
    // Fallback content if template structure is different
    content = `Documento: ${template.name}\n\nPaciente: {{patientName}}\nMédico: {{doctorName}}\nCRM: {{doctorCrm}}\n\nData: {{current_date}}\nHorário: {{current_time}}\n\nConteúdo do documento não disponível.`
  } else {
    content = 'Conteúdo do documento não disponível.'
  }

  // Replace placeholders with data
  if (data && typeof data === 'object') {
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g')
      content = content.replace(placeholder, String(value || ''))
    })
  }

  // Add current date if not provided
  content = content.replace(/{{current_date}}/g, new Date().toLocaleDateString('pt-BR'))
  
  // Add current time if not provided
  content = content.replace(/{{current_time}}/g, new Date().toLocaleTimeString('pt-BR'))

  return content
}

export function validateMedicalData(template: any, data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const fields = template.fieldsSchema.fields || []

  fields.forEach((field: any) => {
    if (field.required && (!data[field.id] || data[field.id].trim() === '')) {
      errors.push(`Campo obrigatório: ${field.label}`)
    }

    if (field.type === 'cid10' && data[field.id] && !validateCID10(data[field.id])) {
      errors.push(`CID-10 inválido: ${field.label}`)
    }

    if (field.type === 'crm' && data[field.id] && !validateCRM(data[field.id])) {
      errors.push(`CRM inválido: ${field.label}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function validateCRM(crm: string): boolean {
  // Validação básica de CRM: formato UF/NÚMERO
  const crmPattern = /^[A-Z]{2}\/?\d{4,6}$/
  return crmPattern.test(crm.replace(/\s+/g, ''))
}
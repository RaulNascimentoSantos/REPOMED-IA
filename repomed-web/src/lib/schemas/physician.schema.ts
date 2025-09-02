import { z } from 'zod';

  
// Formato comum de CRM no BR: 4-7 dígitos + UF, ex: 123456/MG
const crmRegex = /^(\d{4,7})\/(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/i;

  
export const PhysicianSchema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  crm: z.string().regex(crmRegex, 'CRM no formato 123456/UF').transform((s) => s.toUpperCase()),
  specialty: z.string().min(2, 'Especialidade obrigatória'),
});
export type Physician = z.infer<typeof PhysicianSchema>;
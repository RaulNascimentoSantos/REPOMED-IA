import { z } from 'zod';

  
const cpfRegex = /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/;
const dateBrRegex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[012])\/\d{4}$/;

  
export const PatientSchema = z.object({
  name: z.string().min(3, 'Informe o nome completo'),
  cpf: z.string().regex(cpfRegex, 'CPF inválido').transform((s) => s.replace(/\D/g, '')),
  birthDate: z.string().regex(dateBrRegex, 'Data no formato DD/MM/AAAA'),
  allergies: z.array(z.string().min(2)).default([]),
  medicalConditions: z.array(z.string().min(2)).default([]),
});
export type Patient = z.infer<typeof PatientSchema>;
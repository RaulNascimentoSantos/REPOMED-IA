import { z } from 'zod';

  
export const PrescriptionItemSchema = z.object({
  medication: z.string().min(2, 'Informe o medicamento'),
  dosage: z.string().min(1, 'Informe a posologia'),
  frequency: z.string().min(1, 'Informe a frequência'),
  duration: z.string().min(1, 'Informe a duração'),
  notes: z.string().optional(),
});

  
export const PrescriptionSchema = z.object({
  patientId: z.string().uuid('Paciente inválido'),
  physicianId: z.string().uuid('Médico inválido'),
  items: z.array(PrescriptionItemSchema).min(1, 'Inclua ao menos 1 item'),
  warningsAccepted: z.boolean().refine((v) => v, 'Confirme a revisão de interações'),
});
export type Prescription = z.infer<typeof PrescriptionSchema>;
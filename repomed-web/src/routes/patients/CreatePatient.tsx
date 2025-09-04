import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FormField } from '../../components/ui/FormField';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import { CPFSchema, PhoneSchema, EmailSchema, GenderSchema, AddressSchema, MedicalInfoSchema, EmergencyContactSchema } from '@repomed/contracts';

const CreatePatientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: CPFSchema,
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: GenderSchema,
  phone: PhoneSchema,
  email: EmailSchema.optional(),
  address: AddressSchema.optional(),
  medicalInfo: MedicalInfoSchema.optional(),
  emergencyContact: EmergencyContactSchema.optional(),
});

type FormData = z.infer<typeof CreatePatientSchema>;

export default function CreatePatient() {
  const nav = useNavigate();
  const { toasts, push: showToast, remove: removeToast } = useToast();
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({
    resolver: zodResolver(CreatePatientSchema),
    defaultValues: {
      name: '',
      cpf: '',
      birthDate: '',
      gender: 'nao_informar',
      phone: '',
      email: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      },
      medicalInfo: {
        allergies: '',
        medications: '',
        conditions: '',
        notes: ''
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: 'outro'
      }
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Remove campos vazios do endereço se não foram preenchidos
      const cleanData = { ...data };
      if (cleanData.address && !cleanData.address.street) {
        delete cleanData.address;
      }
      if (cleanData.medicalInfo && !cleanData.medicalInfo.allergies && !cleanData.medicalInfo.medications) {
        delete cleanData.medicalInfo;
      }
      if (cleanData.emergencyContact && !cleanData.emergencyContact.name) {
        delete cleanData.emergencyContact;
      }
      if (!cleanData.email) {
        delete cleanData.email;
      }

      await api.post('/api/patients', cleanData);
      showToast('success', 'Paciente cadastrado com sucesso!');
      nav('/patients');
    } catch (error: any) {
      showToast('error', error?.problem?.detail || error?.message || 'Erro ao cadastrar paciente');
    }
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2');
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => nav('/patients')}>← Voltar</Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cadastrar Paciente</h1>
          <p className="text-slate-600 mt-1">Preencha os dados do novo paciente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
        {/* Dados Básicos */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Dados Básicos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nome completo" htmlFor="name" error={errors.name}>
              <Input id="name" {...register('name')} placeholder="João da Silva" />
            </FormField>

            <FormField label="CPF" htmlFor="cpf" error={errors.cpf}>
              <Input 
                id="cpf" 
                {...register('cpf')} 
                placeholder="000.000.000-00"
                onChange={(e) => e.target.value = formatCPF(e.target.value)}
                maxLength={14}
              />
            </FormField>

            <FormField label="Data de Nascimento" htmlFor="birthDate" error={errors.birthDate}>
              <Input id="birthDate" type="date" {...register('birthDate')} />
            </FormField>

            <FormField label="Gênero" htmlFor="gender" error={errors.gender}>
              <Select id="gender" {...register('gender')}>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
                <option value="nao_informar">Prefiro não informar</option>
              </Select>
            </FormField>

            <FormField label="Telefone" htmlFor="phone" error={errors.phone}>
              <Input 
                id="phone" 
                {...register('phone')} 
                placeholder="(11) 99999-9999"
                onChange={(e) => e.target.value = formatPhone(e.target.value)}
                maxLength={15}
              />
            </FormField>

            <FormField label="Email (opcional)" htmlFor="email" error={errors.email}>
              <Input id="email" type="email" {...register('email')} placeholder="joao@email.com" />
            </FormField>
          </div>
        </div>

        {/* Campos Avançados */}
        <div className="space-y-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▼' : '▶'} Campos Avançados (Endereço, Informações Médicas)
          </Button>

          {showAdvanced && (
            <div className="space-y-6">
              {/* Endereço */}
              <div className="bg-white rounded-lg border p-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Endereço</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormField label="Rua" htmlFor="address.street" error={errors.address?.street}>
                      <Input id="address.street" {...register('address.street')} placeholder="Rua das Flores" />
                    </FormField>
                  </div>

                  <FormField label="Número" htmlFor="address.number" error={errors.address?.number}>
                    <Input id="address.number" {...register('address.number')} placeholder="123" />
                  </FormField>

                  <FormField label="Complemento" htmlFor="address.complement" error={errors.address?.complement}>
                    <Input id="address.complement" {...register('address.complement')} placeholder="Apt 45" />
                  </FormField>

                  <FormField label="Bairro" htmlFor="address.neighborhood" error={errors.address?.neighborhood}>
                    <Input id="address.neighborhood" {...register('address.neighborhood')} placeholder="Centro" />
                  </FormField>

                  <FormField label="CEP" htmlFor="address.zipCode" error={errors.address?.zipCode}>
                    <Input 
                      id="address.zipCode" 
                      {...register('address.zipCode')} 
                      placeholder="00000-000"
                      onChange={(e) => e.target.value = formatCEP(e.target.value)}
                      maxLength={9}
                    />
                  </FormField>

                  <FormField label="Cidade" htmlFor="address.city" error={errors.address?.city}>
                    <Input id="address.city" {...register('address.city')} placeholder="São Paulo" />
                  </FormField>

                  <FormField label="Estado" htmlFor="address.state" error={errors.address?.state}>
                    <Select id="address.state" {...register('address.state')}>
                      <option value="">Selecione</option>
                      <option value="AC">AC</option>
                      <option value="AL">AL</option>
                      <option value="AP">AP</option>
                      <option value="AM">AM</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="DF">DF</option>
                      <option value="ES">ES</option>
                      <option value="GO">GO</option>
                      <option value="MA">MA</option>
                      <option value="MT">MT</option>
                      <option value="MS">MS</option>
                      <option value="MG">MG</option>
                      <option value="PA">PA</option>
                      <option value="PB">PB</option>
                      <option value="PR">PR</option>
                      <option value="PE">PE</option>
                      <option value="PI">PI</option>
                      <option value="RJ">RJ</option>
                      <option value="RN">RN</option>
                      <option value="RS">RS</option>
                      <option value="RO">RO</option>
                      <option value="RR">RR</option>
                      <option value="SC">SC</option>
                      <option value="SP">SP</option>
                      <option value="SE">SE</option>
                      <option value="TO">TO</option>
                    </Select>
                  </FormField>
                </div>
              </div>

              {/* Informações Médicas */}
              <div className="bg-white rounded-lg border p-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Informações Médicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Alergias" htmlFor="medicalInfo.allergies" error={errors.medicalInfo?.allergies}>
                    <Input id="medicalInfo.allergies" {...register('medicalInfo.allergies')} placeholder="Alergia a medicamentos..." />
                  </FormField>

                  <FormField label="Medicamentos em uso" htmlFor="medicalInfo.medications" error={errors.medicalInfo?.medications}>
                    <Input id="medicalInfo.medications" {...register('medicalInfo.medications')} placeholder="Medicamentos atuais..." />
                  </FormField>

                  <div className="md:col-span-2">
                    <FormField label="Condições médicas" htmlFor="medicalInfo.conditions" error={errors.medicalInfo?.conditions}>
                      <Input id="medicalInfo.conditions" {...register('medicalInfo.conditions')} placeholder="Diabetes, hipertensão..." />
                    </FormField>
                  </div>

                  <div className="md:col-span-2">
                    <FormField label="Observações" htmlFor="medicalInfo.notes" error={errors.medicalInfo?.notes}>
                      <Input id="medicalInfo.notes" {...register('medicalInfo.notes')} placeholder="Observações importantes..." />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* Contato de Emergência */}
              <div className="bg-white rounded-lg border p-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Contato de Emergência</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Nome" htmlFor="emergencyContact.name" error={errors.emergencyContact?.name}>
                    <Input id="emergencyContact.name" {...register('emergencyContact.name')} placeholder="Maria da Silva" />
                  </FormField>

                  <FormField label="Telefone" htmlFor="emergencyContact.phone" error={errors.emergencyContact?.phone}>
                    <Input 
                      id="emergencyContact.phone" 
                      {...register('emergencyContact.phone')} 
                      placeholder="(11) 99999-9999"
                      onChange={(e) => e.target.value = formatPhone(e.target.value)}
                      maxLength={15}
                    />
                  </FormField>

                  <FormField label="Relacionamento" htmlFor="emergencyContact.relationship" error={errors.emergencyContact?.relationship}>
                    <Select id="emergencyContact.relationship" {...register('emergencyContact.relationship')}>
                      <option value="pai">Pai</option>
                      <option value="mae">Mãe</option>
                      <option value="conjuge">Cônjuge</option>
                      <option value="irmao">Irmão/Irmã</option>
                      <option value="filho">Filho/Filha</option>
                      <option value="amigo">Amigo</option>
                      <option value="outro">Outro</option>
                    </Select>
                  </FormField>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Paciente'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => nav('/patients')}>
            Cancelar
          </Button>
        </div>
      </form>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
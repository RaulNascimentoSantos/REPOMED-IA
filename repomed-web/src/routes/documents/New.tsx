import * as React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateDocumentRequest } from '@repomed/contracts';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FormField } from '../../components/ui/FormField';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

const Schema = CreateDocumentRequest ?? z.object({ 
  templateId: z.string(), 
  title: z.string().min(1), 
  content: z.record(z.unknown()).optional() 
});
type FormData = z.infer<typeof Schema>;

export default function DocumentNew(){
  const [params] = useSearchParams(); 
  const nav = useNavigate();
  const { toasts, push: showToast, remove: removeToast } = useToast();
  
  const defaultTemplateId = params.get('templateId') || '';
  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<FormData>({ 
    resolver: zodResolver(Schema), 
    defaultValues: { templateId: defaultTemplateId, title: '' } 
  });

  const onSubmit = async (data: FormData) => { 
    try {
      const doc: any = await api.post('/api/documents', data);
      showToast('success', 'Documento criado com sucesso!'); 
      nav(`/documents/${doc.id}`);
    } catch (error: any) {
      showToast('error', error?.problem?.detail || error?.message || 'Erro ao criar documento');
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => nav('/documents')}>← Voltar</Button>
        <h1 className="text-xl font-semibold">Novo Documento</h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Template ID" htmlFor="templateId" error={errors.templateId as any}>
          <Input 
            id="templateId" 
            {...register('templateId')} 
            placeholder="ID do template (opcional)"
          />
        </FormField>
        
        <FormField label="Título" htmlFor="title" error={errors.title}>
          <Input 
            id="title" 
            {...register('title')} 
            placeholder="Título do documento"
          />
        </FormField>
        
        <FormField label="Nome do Paciente" htmlFor="patientName">
          <Input 
            id="patientName" 
            placeholder="Nome do paciente (opcional)"
          />
        </FormField>
        
        <FormField label="Nome do Médico" htmlFor="doctorName">
          <Input 
            id="doctorName" 
            placeholder="Nome do médico (opcional)"
          />
        </FormField>
        
        <FormField label="CRM do Médico" htmlFor="doctorCrm">
          <Input 
            id="doctorCrm" 
            placeholder="CRM do médico (opcional)"
          />
        </FormField>
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando…' : 'Criar'}
        </Button>
      </form>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
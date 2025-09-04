import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateTemplateRequest } from '@repomed/contracts';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FormField } from '../../components/ui/FormField';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

const Schema = CreateTemplateRequest ?? z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(z.object({ 
    key: z.string(), 
    label: z.string(), 
    type: z.enum(['text','number','date','select']).default('text') 
  }))
});
type FormData = z.infer<typeof Schema>;

export default function CreateTemplate(){
  const nav = useNavigate();
  const { toasts, push: showToast, remove: removeToast } = useToast();
  const { control, register, handleSubmit, formState:{errors, isSubmitting} } = useForm<FormData>({ 
    resolver: zodResolver(Schema), 
    defaultValues: { name:'', description:'', fields: [] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'fields' });

  const onSubmit = async (data: FormData) => { 
    try {
      await api.post('/api/templates', data);
      showToast('success', 'Template criado com sucesso!');
      nav('/templates');
    } catch (error: any) {
      showToast('error', error?.problem?.detail || error?.message || 'Erro ao criar template');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={()=>nav('/templates')}>← Voltar</Button>
        <h1 className="text-xl font-semibold">Criar Template</h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <FormField label="Nome" htmlFor="name" error={errors.name}>
          <Input id="name" {...register('name')} />
        </FormField>
        
        <FormField label="Descrição" htmlFor="description" error={errors.description as any}>
          <Input id="description" {...register('description')} />
        </FormField>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Campos</h2>
            <Button type="button" onClick={()=>append({ key:'', label:'', type:'text' })}>
              Adicionar campo
            </Button>
          </div>
          
          {fields.map((f, idx) => (
            <div key={f.id} className="grid grid-cols-3 gap-2 rounded-2xl border p-3">
              <FormField label="Key" htmlFor={`fields.${idx}.key`} error={errors.fields?.[idx]?.key as any}>
                <Input {...register(`fields.${idx}.key`)} />
              </FormField>
              
              <FormField label="Label" htmlFor={`fields.${idx}.label`} error={errors.fields?.[idx]?.label as any}>
                <Input {...register(`fields.${idx}.label`)} />
              </FormField>
              
              <FormField label="Tipo" htmlFor={`fields.${idx}.type`} error={errors.fields?.[idx]?.type as any}>
                <Select {...register(`fields.${idx}.type`)}>
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="date">Data</option>
                  <option value="select">Select</option>
                </Select>
              </FormField>
              
              <div className="col-span-3">
                <Button type="button" variant="secondary" onClick={()=>remove(idx)}>
                  Remover
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar'}
        </Button>
      </form>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
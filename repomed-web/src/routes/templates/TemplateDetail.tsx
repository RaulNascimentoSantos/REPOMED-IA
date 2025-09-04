import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';

export default function TemplateDetail(){
  const { id } = useParams(); 
  const nav = useNavigate();
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['template', id], 
    queryFn: () => api.get(`/api/templates/${id}`), 
    enabled: !!id 
  });
  
  if (isLoading) return <LoadingState/>; 
  if (error) return <ErrorState error={error}/>; 
  if (!data) return null;
  
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={()=>nav('/templates')}>← Voltar</Button>
        <h1 className="text-xl font-semibold">{data.name}</h1>
      </div>
      
      <div className="bg-white rounded-2xl border p-4">
        <h2 className="font-medium mb-2">Detalhes do Template</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Nome:</strong> {data.name}</p>
          <p><strong>Descrição:</strong> {data.description || 'Sem descrição'}</p>
          <p><strong>Especialidade:</strong> {data.specialty || 'Não especificada'}</p>
          {data.fields && data.fields.length > 0 && (
            <div>
              <strong>Campos:</strong>
              <ul className="ml-4 list-disc">
                {data.fields.map((field: any, idx: number) => (
                  <li key={idx}>{field.label} ({field.type})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-x-2">
        <Button onClick={()=>nav(`/documents/new?templateId=${id}`)}>
          Usar este template
        </Button>
        <Button variant="secondary" onClick={() => {/* TODO: Edit template */}}>
          Editar
        </Button>
      </div>
      
      <details className="bg-slate-50 rounded-2xl p-4">
        <summary className="cursor-pointer font-medium">Ver dados brutos</summary>
        <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  );
}
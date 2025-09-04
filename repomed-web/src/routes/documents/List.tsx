import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { DocumentListResponse } from '@repomed/contracts';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { useNavigate } from 'react-router-dom';

export default function DocumentsList(){
  const nav = useNavigate(); 
  const qc = useQueryClient();
  
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['documents'], 
    queryFn: () => api.get<DocumentListResponse>('/api/documents') 
  });
  
  const sign = useMutation({ 
    mutationFn: (id:string) => api.post(`/api/documents/${id}/sign`, {}), 
    onSuccess: () => qc.invalidateQueries({ queryKey:['documents'] }) 
  });

  if (isLoading) return <LoadingState/>;
  if (error) return <ErrorState error={error}/>;
  
  const rows = data || [];
  if (!rows.length) {
    return (
      <EmptyState 
        message="Nenhum documento" 
        cta={<Button onClick={()=>nav('/documents/new')}>Novo documento</Button>}
      />
    );
  }

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8085';
  
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Documentos</h1>
        <Button onClick={()=>nav('/documents/new')}>Novo documento</Button>
      </div>
      
      <DataTable data={rows} columns={[
        { key:'title' as const, header:'Título', render: (d) => d.title || `Documento para ${d.patientName}` },
        { key:'status' as const, header:'Status', render: (d) => d.status === 'signed' ? '✅ Assinado' : '⏳ Rascunho' },
        { key:'createdAt' as const, header:'Criado em', render: (d) => new Date(d.createdAt).toLocaleDateString() },
        { key:'id' as const, header:'Ações', render:(d)=> (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={()=>nav(`/documents/${d.id}`)}>Ver</Button>
            {d.status !== 'signed' && (
              <Button 
                variant="secondary" 
                onClick={() => sign.mutate(d.id)}
                disabled={sign.isPending}
              >
                {sign.isPending ? 'Assinando...' : 'Assinar'}
              </Button>
            )}
            <Button variant="ghost" onClick={()=>window.open(`${API}/api/documents/${d.id}/pdf`, '_blank')}>
              PDF
            </Button>
          </div>
        )}
      ]} />
    </div>
  );
}
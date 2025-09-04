import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/states/LoadingState';
import { ErrorState } from '../../components/states/ErrorState';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export default function DocumentDetail(){
  const { id } = useParams(); 
  const nav = useNavigate();
  const qc = useQueryClient();
  const { toasts, push: showToast, remove: removeToast } = useToast();
  
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['document', id], 
    queryFn: () => api.get(`/api/documents/${id}`), 
    enabled: !!id 
  });

  const signMutation = useMutation({
    mutationFn: () => api.post(`/api/documents/${id}/sign`, { doctorName: 'Dr. Sistema' }),
    onSuccess: () => {
      showToast('success', 'Documento assinado com sucesso!');
      qc.invalidateQueries({ queryKey: ['document', id] });
      qc.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: any) => {
      showToast('error', error?.problem?.detail || error?.message || 'Erro ao assinar documento');
    }
  });
  
  if (isLoading) return <LoadingState/>; 
  if (error) return <ErrorState error={error}/>; 
  if (!data) return null;

  const API = import.meta.env.VITE_API_URL || 'http://localhost:8081';
  
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => nav('/documents')}>← Voltar</Button>
          <h1 className="text-xl font-semibold">{data.title || 'Documento sem título'}</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            onClick={() => window.open(`${API}/api/documents/${id}/pdf`, '_blank')}
          >
            Visualizar PDF
          </Button>
          {!data.isSigned && (
            <Button 
              onClick={() => signMutation.mutate()}
              disabled={signMutation.isPending}
            >
              {signMutation.isPending ? 'Assinando...' : 'Assinar Documento'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border p-4">
          <h2 className="font-medium mb-3">Informações do Documento</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Status:</strong> {data.isSigned ? '✅ Assinado' : '⏳ Pendente'}</p>
            <p><strong>Paciente:</strong> {data.patientName || 'Não informado'}</p>
            <p><strong>Médico:</strong> {data.doctorName || 'Não informado'}</p>
            <p><strong>CRM:</strong> {data.doctorCrm || 'Não informado'}</p>
            <p><strong>Criado em:</strong> {new Date(data.createdAt).toLocaleString()}</p>
            {data.signedAt && (
              <p><strong>Assinado em:</strong> {new Date(data.signedAt).toLocaleString()}</p>
            )}
            {data.hash && (
              <p><strong>Hash:</strong> <code className="bg-slate-100 px-1 rounded text-xs">{data.hash.slice(0, 16)}...</code></p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-4">
          <h2 className="font-medium mb-3">Dados do Documento</h2>
          <pre className="text-xs overflow-auto max-h-96 bg-slate-50 p-3 rounded">
            {JSON.stringify(data.dataJson || {}, null, 2)}
          </pre>
        </div>
      </div>

      <details className="bg-slate-50 rounded-2xl p-4">
        <summary className="cursor-pointer font-medium">Ver dados completos</summary>
        <pre className="mt-2 text-xs overflow-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>
      </details>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
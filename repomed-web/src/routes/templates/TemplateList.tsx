import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { TemplateListResponse } from '@repomed/contracts';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '../../components/ui/Dialog';

export default function TemplateList(){
  const nav = useNavigate();
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['templates'], 
    queryFn: () => api.get<TemplateListResponse>('/api/templates') 
  });
  const [open, setOpen] = React.useState(false); 
  const [current, setCurrent] = React.useState<any>(null);

  if (isLoading) return <LoadingState/>;
  if (error) return <ErrorState error={error}/>;
  
  const rows = data || [];
  if (!rows.length) {
    return (
      <EmptyState 
        message="Nenhum template" 
        cta={<Button onClick={()=>nav('/templates/create')}>Criar template</Button>}
      />
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Templates</h1>
        <Button onClick={()=>nav('/templates/create')}>Novo template</Button>
      </div>
      <DataTable data={rows} columns={[
        { key:'name', header:'Nome' },
        { key:'description', header:'Descrição' },
        { key:'id', header:'Ações', render:(t)=> (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={()=>{ setCurrent(t); setOpen(true); }}>Visualizar</Button>
            <Button onClick={()=>nav(`/documents/new?templateId=${t.id}`)}>Usar este template</Button>
          </div>
        )}
      ]} />
      <Dialog open={open} onClose={()=>setOpen(false)} title={current?.name || 'Preview'}>
        <pre className="max-h-[60vh] overflow-auto text-xs">{JSON.stringify(current, null, 2)}</pre>
      </Dialog>
    </div>
  );
}
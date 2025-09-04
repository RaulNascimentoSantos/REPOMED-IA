import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function Exames() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Exames"
        description="Gerencie solicitações e resultados de exames"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Exames' }
        ]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button onClick={() => navigate('/exames/solicitar')}>
          Solicitar Exame
        </Button>
        <Button variant="outline" onClick={() => navigate('/exames/resultados')}>
          Ver Resultados
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Solicitações Pendentes</h3>
          <div className="text-center py-8 text-gray-500">
            Nenhuma solicitação pendente.
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resultados Recentes</h3>
          <div className="text-center py-8 text-gray-500">
            Nenhum resultado disponível.
          </div>
        </Card>
      </div>
    </div>
  );
}
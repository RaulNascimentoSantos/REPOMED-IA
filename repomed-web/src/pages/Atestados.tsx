import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function Atestados() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Atestados Médicos"
        description="Crie e gerencie atestados médicos"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Atestados' }
        ]}
      />
      
      <div className="mb-6">
        <Button onClick={() => navigate('/atestados/new')}>
          Novo Atestado
        </Button>
      </div>
      
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Atestados Recentes</h3>
          <div className="text-center py-8 text-gray-500">
            Nenhum atestado encontrado.
            <br />
            <Button 
              variant="link" 
              onClick={() => navigate('/atestados/new')}
              className="mt-2"
            >
              Criar primeiro atestado
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
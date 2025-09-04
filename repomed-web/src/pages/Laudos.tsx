import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function Laudos() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Laudos Médicos"
        description="Crie e gerencie laudos médicos"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Laudos' }
        ]}
      />
      
      <div className="mb-6">
        <Button onClick={() => navigate('/laudos/new')}>
          Novo Laudo
        </Button>
      </div>
      
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Laudos Recentes</h3>
          <div className="text-center py-8 text-gray-500">
            Nenhum laudo encontrado.
            <br />
            <Button 
              variant="link" 
              onClick={() => navigate('/laudos/new')}
              className="mt-2"
            >
              Criar primeiro laudo
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
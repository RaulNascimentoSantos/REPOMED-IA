import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function Prescriptions() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Prescrições"
        description="Gerencie suas prescrições médicas"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Prescrições' }
        ]}
      />
      
      <div className="mb-6">
        <Button onClick={() => navigate('/prescriptions/new')}>
          Nova Prescrição
        </Button>
      </div>
      
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Prescrições Recentes</h3>
          <div className="text-center py-8 text-gray-500">
            Nenhuma prescrição encontrada. 
            <br />
            <Button 
              variant="link" 
              onClick={() => navigate('/prescriptions/new')}
              className="mt-2"
            >
              Criar primeira prescrição
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
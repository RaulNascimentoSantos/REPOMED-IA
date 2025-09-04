import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function Reports() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Relatórios"
        description="Gere e visualize relatórios médicos"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Relatórios' }
        ]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Relatório de Pacientes</h3>
          <p className="text-gray-600 mb-4">Lista detalhada de pacientes</p>
          <Button className="w-full">
            Gerar Relatório
          </Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Relatório de Prescrições</h3>
          <p className="text-gray-600 mb-4">Prescrições por período</p>
          <Button className="w-full">
            Gerar Relatório
          </Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Relatório de Documentos</h3>
          <p className="text-gray-600 mb-4">Documentos emitidos</p>
          <Button className="w-full">
            Gerar Relatório
          </Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Relatório de CID-10</h3>
          <p className="text-gray-600 mb-4">Diagnósticos mais frequentes</p>
          <Button className="w-full">
            Gerar Relatório
          </Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Relatório de Medicamentos</h3>
          <p className="text-gray-600 mb-4">Medicamentos mais prescritos</p>
          <Button className="w-full">
            Gerar Relatório
          </Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Relatório Personalizado</h3>
          <p className="text-gray-600 mb-4">Crie seu próprio relatório</p>
          <Button className="w-full">
            Criar Relatório
          </Button>
        </Card>
      </div>
      
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Relatórios Salvos</h3>
          <div className="text-center py-8 text-gray-500">
            Nenhum relatório salvo encontrado.
          </div>
        </div>
      </Card>
    </div>
  );
}
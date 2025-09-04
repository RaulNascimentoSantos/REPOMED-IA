import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function ExamesResultados() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Resultados de Exames"
        description="Visualizar e gerenciar resultados de exames"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Exames', href: '/exames' },
          { label: 'Resultados' }
        ]}
      />
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Buscar por paciente..."
          className="border border-gray-300 rounded-md px-3 py-2"
        />
        <select className="border border-gray-300 rounded-md px-3 py-2">
          <option value="">Todos os tipos</option>
          <option value="sangue">Exames de Sangue</option>
          <option value="imagem">Exames de Imagem</option>
          <option value="urina">Exames de Urina</option>
        </select>
        <select className="border border-gray-300 rounded-md px-3 py-2">
          <option value="">Período</option>
          <option value="hoje">Hoje</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mês</option>
        </select>
      </div>
      
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resultados Disponíveis</h3>
          
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg mb-2">Nenhum resultado encontrado</p>
            <p className="text-sm mb-4">
              Os resultados dos exames solicitados aparecerão aqui quando estiverem disponíveis.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/exames/solicitar')}
            >
              Solicitar Novo Exame
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
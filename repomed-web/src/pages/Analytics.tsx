import React from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/PageHeader';

export default function Analytics() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Analytics"
        description="Análise de dados e métricas da prática médica"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Analytics' }
        ]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 text-center">
          <h3 className="text-2xl font-bold text-blue-600 mb-2">0</h3>
          <p className="text-gray-600">Pacientes Ativos</p>
        </Card>
        
        <Card className="p-6 text-center">
          <h3 className="text-2xl font-bold text-green-600 mb-2">0</h3>
          <p className="text-gray-600">Consultas Este Mês</p>
        </Card>
        
        <Card className="p-6 text-center">
          <h3 className="text-2xl font-bold text-purple-600 mb-2">0</h3>
          <p className="text-gray-600">Prescrições Emitidas</p>
        </Card>
        
        <Card className="p-6 text-center">
          <h3 className="text-2xl font-bold text-orange-600 mb-2">0</h3>
          <p className="text-gray-600">Documentos Assinados</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Atendimentos por Mês</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Gráfico de atendimentos será exibido aqui
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Diagnósticos Mais Frequentes</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Gráfico de diagnósticos será exibido aqui
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Medicamentos Mais Prescritos</h3>
          <div className="space-y-3">
            <div className="text-center py-8 text-gray-500">
              Dados insuficientes para gerar estatísticas
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Faixa Etária dos Pacientes</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Gráfico de faixa etária será exibido aqui
          </div>
        </Card>
      </div>
    </div>
  );
}
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Pacientes</h3>
          <p className="text-gray-600 mb-4">Gerencie seus pacientes</p>
          <Button onClick={() => navigate('/patients')} className="w-full">
            Ver Pacientes
          </Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Prescrições</h3>
          <p className="text-gray-600 mb-4">Crie e gerencie prescrições</p>
          <Button onClick={() => navigate('/prescriptions')} className="w-full">
            Ver Prescrições
          </Button>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Documentos</h3>
          <p className="text-gray-600 mb-4">Gerencie documentos médicos</p>
          <Button onClick={() => navigate('/documents')} className="w-full">
            Ver Documentos
          </Button>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Novo paciente cadastrado</span>
              <span className="text-sm text-gray-500">2h atrás</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Prescrição assinada</span>
              <span className="text-sm text-gray-500">5h atrás</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total de Pacientes</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span>Prescrições este mês</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span>Documentos criados</span>
              <span className="font-semibold">0</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
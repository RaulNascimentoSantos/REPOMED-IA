import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            RepoMed IA
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Sistema médico inteligente para prescrições e documentos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-3">Pacientes</h3>
            <p className="text-gray-600 mb-4">
              Gerencie seus pacientes de forma eficiente
            </p>
            <Button onClick={() => navigate('/patients')} variant="primary">
              Acessar
            </Button>
          </Card>

          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-3">Prescrições</h3>
            <p className="text-gray-600 mb-4">
              Crie prescrições com IA e assinatura digital
            </p>
            <Button onClick={() => navigate('/prescriptions')} variant="primary">
              Acessar
            </Button>
          </Card>

          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-3">Documentos</h3>
            <p className="text-gray-600 mb-4">
              Atestados, laudos e outros documentos médicos
            </p>
            <Button onClick={() => navigate('/documents')} variant="primary">
              Acessar
            </Button>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { api } from '@/lib/api';

interface Patient {
  id: string;
  name: string;
  cpf: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      
      try {
        const data = await api.get<Patient>(`/api/patients/${id}`);
        setPatient(data);
      } catch (error) {
        console.error('Erro ao carregar paciente:', error);
        navigate('/patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, navigate]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Carregando...</div>;
  }

  if (!patient) {
    return <div className="container mx-auto px-4 py-8 text-center">Paciente não encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={patient.name}
        description="Detalhes do paciente"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Pacientes', href: '/patients' },
          { label: patient.name }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Nome Completo
                </label>
                <p className="text-gray-900">{patient.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  CPF
                </label>
                <p className="text-gray-900">{patient.cpf}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Data de Nascimento
                </label>
                <p className="text-gray-900">
                  {new Date(patient.dateOfBirth).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{patient.email || 'Não informado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Telefone
                </label>
                <p className="text-gray-900">{patient.phone || 'Não informado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Cadastrado em
                </label>
                <p className="text-gray-900">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {patient.address && (
              <div className="mt-6">
                <h4 className="text-md font-medium mb-2">Endereço</h4>
                <p className="text-gray-900">{patient.address}</p>
                {patient.city && patient.state && (
                  <p className="text-gray-900">{patient.city}, {patient.state}</p>
                )}
                {patient.zipCode && (
                  <p className="text-gray-900">CEP: {patient.zipCode}</p>
                )}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ações</h3>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate(`/patients/${patient.id}/edit`)} 
                variant="primary"
                className="w-full"
              >
                Editar Paciente
              </Button>
              
              <Button 
                onClick={() => navigate(`/prescriptions/new?patient=${patient.id}`)} 
                variant="outline"
                className="w-full"
              >
                Nova Prescrição
              </Button>
              
              <Button 
                onClick={() => navigate(`/documents/new?patient=${patient.id}`)} 
                variant="outline"
                className="w-full"
              >
                Novo Documento
              </Button>
              
              <Button 
                onClick={() => navigate('/patients')} 
                variant="outline"
                className="w-full"
              >
                Voltar à Lista
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
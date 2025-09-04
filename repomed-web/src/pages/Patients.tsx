import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
}

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.get<Patient[]>('/api/patients');
        setPatients(data);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Pacientes"
        description="Gerencie seus pacientes"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Pacientes' }
        ]}
      />

      <div className="flex justify-between items-center mt-6 mb-4">
        <h2 className="text-xl font-semibold">Lista de Pacientes</h2>
        <Button onClick={() => navigate('/patients/new')} variant="primary">
          Novo Paciente
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {patients.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600">Nenhum paciente cadastrado.</p>
              <Button 
                onClick={() => navigate('/patients/new')} 
                variant="primary" 
                className="mt-4"
              >
                Cadastrar Primeiro Paciente
              </Button>
            </Card>
          ) : (
            patients.map((patient) => (
              <Card key={patient.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{patient.name}</h3>
                    <p className="text-gray-600">CPF: {patient.cpf}</p>
                    <p className="text-gray-600">
                      Nascimento: {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate(`/patients/${patient.id}`)} 
                      variant="outline"
                    >
                      Ver
                    </Button>
                    <Button 
                      onClick={() => navigate(`/patients/${patient.id}/edit`)} 
                      variant="primary"
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { api } from '@/lib/api';

interface HistoryEntry {
  id: string;
  type: 'prescription' | 'document' | 'exam';
  title: string;
  date: string;
  status: string;
  description?: string;
}

interface Patient {
  id: string;
  name: string;
}

export default function PatientHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [patientData, historyData] = await Promise.all([
          api.get<Patient>(`/api/patients/${id}`),
          api.get<HistoryEntry[]>(`/api/patients/${id}/history`)
        ]);
        
        setPatient(patientData);
        setHistory(historyData);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        navigate('/patients');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'prescription': return 'Prescrição';
      case 'document': return 'Documento';
      case 'exam': return 'Exame';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prescription': return 'bg-blue-100 text-blue-800';
      case 'document': return 'bg-green-100 text-green-800';
      case 'exam': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Carregando...</div>;
  }

  if (!patient) {
    return <div className="container mx-auto px-4 py-8 text-center">Paciente não encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={`Histórico - ${patient.name}`}
        description="Histórico médico do paciente"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Pacientes', href: '/patients' },
          { label: patient.name, href: `/patients/${id}` },
          { label: 'Histórico' }
        ]}
      />

      <div className="flex justify-between items-center mt-6 mb-4">
        <h2 className="text-xl font-semibold">Histórico Médico</h2>
        <Button onClick={() => navigate(`/patients/${id}`)} variant="outline">
          Voltar ao Paciente
        </Button>
      </div>

      {history.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">
            Nenhum histórico médico encontrado para este paciente.
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => navigate(`/prescriptions/new?patient=${id}`)} 
              variant="primary"
            >
              Nova Prescrição
            </Button>
            <Button 
              onClick={() => navigate(`/documents/new?patient=${id}`)} 
              variant="outline"
            >
              Novo Documento
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                      {getTypeLabel(entry.type)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {entry.title}
                  </h3>
                  
                  {entry.description && (
                    <p className="text-gray-600 text-sm mb-2">
                      {entry.description}
                    </p>
                  )}
                  
                  <span className="text-sm font-medium text-gray-700">
                    Status: {entry.status}
                  </span>
                </div>
                
                <Button 
                  onClick={() => {
                    if (entry.type === 'prescription') {
                      navigate(`/prescriptions/${entry.id}`);
                    } else if (entry.type === 'document') {
                      navigate(`/documents/${entry.id}`);
                    }
                  }} 
                  variant="outline"
                  size="sm"
                >
                  Ver Detalhes
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
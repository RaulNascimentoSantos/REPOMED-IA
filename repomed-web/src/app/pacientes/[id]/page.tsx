'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  FileText,
  Edit,
  Download,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Patient {
  id: string;
  nome: string;
  idade: string;
  telefone: string;
  email: string;
  endereco: string;
  condicoes: string[];
  statusBadge: string;
  statusColor: string;
  avatar: string;
  cpf?: string;
  rg?: string;
  convenio?: string;
  emergencia?: {
    nome: string;
    telefone: string;
    relacao: string;
  };
  historico?: {
    data: string;
    tipo: string;
    descricao: string;
    medico: string;
  }[];
}

const pacientesExemplo: Patient[] = [
  {
    id: 'PAC-001',
    nome: 'Maria Silva Santos',
    idade: '34 anos',
    telefone: '(11) 99999-9999',
    email: 'maria.silva@email.com',
    endereco: 'Rua das Flores, 123 - São Paulo/SP',
    condicoes: ['Hipertensão', 'Diabetes Tipo 2'],
    statusBadge: 'Ativo',
    statusColor: 'green',
    avatar: 'MS',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    convenio: 'Unimed',
    emergencia: {
      nome: 'João Silva Santos',
      telefone: '(11) 88888-8888',
      relacao: 'Esposo'
    },
    historico: [
      {
        data: '2025-09-20',
        tipo: 'Consulta',
        descricao: 'Consulta de rotina - Pressão arterial controlada',
        medico: 'Dr. João Silva'
      },
      {
        data: '2025-09-15',
        tipo: 'Exame',
        descricao: 'Hemograma completo - Resultados normais',
        medico: 'Dr. João Silva'
      },
      {
        data: '2025-09-10',
        tipo: 'Receita',
        descricao: 'Receita digital - Losartana 50mg',
        medico: 'Dr. João Silva'
      }
    ]
  },
  {
    id: 'PAC-002',
    nome: 'João Costa Lima',
    idade: '45 anos',
    telefone: '(11) 88888-8888',
    email: 'joao.costa@email.com',
    endereco: 'Av. Paulista, 456 - São Paulo/SP',
    condicoes: ['Cefaleia Crônica', 'Ansiedade'],
    statusBadge: 'Em Tratamento',
    statusColor: 'blue',
    avatar: 'JC',
    cpf: '234.567.890-11',
    rg: '23.456.789-0',
    convenio: 'Bradesco Saúde'
  }
];

export default function PatientViewPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        // Try to fetch from API first
        const response = await fetch(`http://localhost:8081/patients/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (response.ok) {
          const patientData = await response.json();
          setPatient(patientData);
        } else {
          // Fallback to example data
          const foundPatient = pacientesExemplo.find(p => p.id === patientId);
          setPatient(foundPatient || null);
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        // Fallback to example data
        const foundPatient = pacientesExemplo.find(p => p.id === patientId);
        setPatient(foundPatient || null);
      }
      setLoading(false);
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-var(--bg-primary) text-var(--text-primary) flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-var(--accent-primary)"></div>
          <span>Carregando paciente...</span>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-var(--bg-primary) text-var(--text-primary) flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-var(--error) mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Paciente não encontrado</h1>
          <p className="text-var(--text-secondary) mb-6">O paciente com ID {patientId} não foi encontrado.</p>
          <button
            onClick={() => router.push('/pacientes')}
            className="bg-var(--accent-primary) text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Voltar para Pacientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-var(--bg-primary) text-var(--text-primary) p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/pacientes')}
              className="flex items-center gap-2 px-4 py-2 bg-var(--bg-secondary) border border-var(--border-color) rounded-xl hover:bg-var(--hover-bg) transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                📋 Perfil do Paciente
              </h1>
              <p className="text-var(--text-secondary)">
                Informações completas e histórico médico
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-var(--accent-primary) text-white rounded-xl hover:opacity-90 transition-opacity">
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-var(--bg-secondary) border border-var(--border-color) rounded-xl hover:bg-var(--hover-bg) transition-colors">
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informações Básicas */}
        <div className="lg:col-span-1">
          <div className="bg-var(--bg-secondary) border border-var(--border-color) rounded-2xl p-6 mb-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-2xl">{patient.avatar}</span>
              </div>
              <h2 className="text-2xl font-bold text-var(--text-primary)">{patient.nome}</h2>
              <p className="text-var(--text-secondary)">{patient.idade}</p>
              <span className={`inline-block px-3 py-1 mt-2 text-xs font-medium rounded-full ${
                patient.statusColor === 'green' ? 'bg-green-100 text-green-700' :
                patient.statusColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                patient.statusColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                patient.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {patient.statusBadge}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-var(--accent-primary)" />
                <div>
                  <p className="text-sm text-var(--text-secondary)">Telefone</p>
                  <p className="text-var(--text-primary)">{patient.telefone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-var(--accent-primary)" />
                <div>
                  <p className="text-sm text-var(--text-secondary)">Email</p>
                  <p className="text-var(--text-primary)">{patient.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-var(--accent-primary)" />
                <div>
                  <p className="text-sm text-var(--text-secondary)">Endereço</p>
                  <p className="text-var(--text-primary)">{patient.endereco}</p>
                </div>
              </div>

              {patient.cpf && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-var(--accent-primary)" />
                  <div>
                    <p className="text-sm text-var(--text-secondary)">CPF</p>
                    <p className="text-var(--text-primary)">{patient.cpf}</p>
                  </div>
                </div>
              )}

              {patient.convenio && (
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-var(--accent-primary)" />
                  <div>
                    <p className="text-sm text-var(--text-secondary)">Convênio</p>
                    <p className="text-var(--text-primary)">{patient.convenio}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contato de Emergência */}
          {patient.emergencia && (
            <div className="bg-var(--bg-secondary) border border-var(--border-color) rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-var(--text-primary) mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Contato de Emergência
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-var(--text-secondary)">Nome</p>
                  <p className="text-var(--text-primary)">{patient.emergencia.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-var(--text-secondary)">Telefone</p>
                  <p className="text-var(--text-primary)">{patient.emergencia.telefone}</p>
                </div>
                <div>
                  <p className="text-sm text-var(--text-secondary)">Relação</p>
                  <p className="text-var(--text-primary)">{patient.emergencia.relacao}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Condições e Histórico */}
        <div className="lg:col-span-2 space-y-6">
          {/* Condições Médicas */}
          <div className="bg-var(--bg-secondary) border border-var(--border-color) rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-var(--text-primary) mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-var(--accent-primary)" />
              Condições Médicas
            </h3>
            <div className="flex flex-wrap gap-3">
              {patient.condicoes.map((condicao, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-var(--bg-tertiary) text-var(--text-primary) rounded-lg text-sm font-medium border border-var(--border-color)"
                >
                  {condicao}
                </span>
              ))}
            </div>
          </div>

          {/* Histórico Médico */}
          <div className="bg-var(--bg-secondary) border border-var(--border-color) rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-var(--text-primary) mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-var(--accent-primary)" />
              Histórico Médico
            </h3>

            {patient.historico && patient.historico.length > 0 ? (
              <div className="space-y-4">
                {patient.historico.map((item, index) => (
                  <div
                    key={index}
                    className="border border-var(--border-color) rounded-xl p-4 bg-var(--bg-tertiary)"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.tipo === 'Consulta' ? 'bg-blue-100 text-blue-700' :
                          item.tipo === 'Exame' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {item.tipo === 'Consulta' ? <Calendar className="w-5 h-5" /> :
                           item.tipo === 'Exame' ? <CheckCircle className="w-5 h-5" /> :
                           <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-var(--text-primary)">{item.tipo}</p>
                          <p className="text-sm text-var(--text-secondary)">{item.descricao}</p>
                          <p className="text-xs text-var(--text-muted) mt-1">
                            Por: {item.medico}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-var(--text-secondary)">
                        <Clock className="w-4 h-4" />
                        {new Date(item.data).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-var(--text-muted) mx-auto mb-3" />
                <p className="text-var(--text-secondary)">Nenhum histórico médico registrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
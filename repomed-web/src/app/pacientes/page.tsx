'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  Grid,
  List,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Activity,
  Heart
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
}

export default function PacientesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [pacientes, setPacientes] = useState<Patient[]>([]);

  // Dados de exemplo/fallback dos pacientes
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
      avatar: 'MS'
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
      avatar: 'JC'
    },
    {
      id: 'PAC-003',
      nome: 'Ana Paula Ferreira',
      idade: '28 anos',
      telefone: '(11) 77777-7777',
      email: 'ana.paula@email.com',
      endereco: 'Rua Augusta, 789 - São Paulo/SP',
      condicoes: ['Gravidez', 'Anemia'],
      statusBadge: 'Acompanhamento',
      statusColor: 'orange',
      avatar: 'AP'
    },
    {
      id: 'PAC-004',
      nome: 'Pedro Santos Oliveira',
      idade: '52 anos',
      telefone: '(11) 66666-6666',
      email: 'pedro.santos@email.com',
      endereco: 'Rua da Consolação, 321 - São Paulo/SP',
      condicoes: ['Fratura de Fêmur', 'Fisioterapia'],
      statusBadge: 'Recuperação',
      statusColor: 'yellow',
      avatar: 'PS'
    },
    {
      id: 'PAC-005',
      nome: 'Carla Mendes Silva',
      idade: '39 anos',
      telefone: '(11) 55555-5555',
      email: 'carla.mendes@email.com',
      endereco: 'Alameda Santos, 654 - São Paulo/SP',
      condicoes: ['Hipertireoidismo', 'Osteoporose'],
      statusBadge: 'Ativo',
      statusColor: 'green',
      avatar: 'CM'
    },
    {
      id: 'PAC-006',
      nome: 'Roberto Alves Costa',
      idade: '67 anos',
      telefone: '(11) 44444-4444',
      email: 'roberto.alves@email.com',
      endereco: 'Rua Oscar Freire, 987 - São Paulo/SP',
      condicoes: ['Diabetes', 'Hipertensão', 'Cardiopatia'],
      statusBadge: 'Alto Risco',
      statusColor: 'red',
      avatar: 'RA'
    }
  ];

  useEffect(() => {
    // Load patients from Fastify API
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:8081/patients', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (response.ok) {
          const patients = await response.json();
          if (patients && patients.length > 0) {
            setPacientes(patients);
          } else {
            // Use example data if API returns empty
            setPacientes(pacientesExemplo);
          }
        } else {
          console.error('Failed to fetch patients from API');
          // Fallback to example data if API is not available
          setPacientes(pacientesExemplo);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        // Fallback to example data if API is not available
        setPacientes(pacientesExemplo);
      }
    };

    fetchPatients();
  }, []);

  const handleNewPatient = () => {
    router.push('/pacientes/novo');
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/pacientes/${patientId}`);
  };

  const handleEditPatient = (patientId: string) => {
    router.push(`/pacientes/${patientId}/edit`);
  };

  const estatisticas = {
    total: pacientes.length,
    ativos: pacientes.filter(p => p.statusColor === 'green').length,
    altoRisco: pacientes.filter(p => p.statusColor === 'red').length,
    criticos: pacientes.filter(p => p.statusBadge.includes('Crítico')).length
  };

  const filteredPatients = pacientes.filter(patient =>
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condicoes.some(condition =>
      condition.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                🏥 Gestão de Pacientes
                <span className="text-lg bg-blue-600 text-white px-3 py-1 rounded-full">IA</span>
              </h1>
              <p className="text-slate-400 text-lg">
                Monitoramento inteligente • {estatisticas.total} pacientes ativos • {estatisticas.criticos} críticos
              </p>
            </div>
          </div>
          <button
            onClick={handleNewPatient}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Paciente</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{estatisticas.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Ativos</p>
              <p className="text-2xl font-bold text-white">{estatisticas.ativos}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Alto Risco</p>
              <p className="text-2xl font-bold text-white">{estatisticas.altoRisco}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Críticos</p>
              <p className="text-2xl font-bold text-white">{estatisticas.criticos}</p>
            </div>
            <Heart className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filtros e View Mode Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar pacientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Grid className="w-4 h-4" />
            Cards
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
        </div>
      </div>

      {/* Lista/Grid de Pacientes */}
      {viewMode === 'list' ? (
        // Visualização em Lista
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="bg-slate-700 px-6 py-3 border-b border-slate-600">
            <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-slate-300">
              <div className="col-span-3">Paciente</div>
              <div className="col-span-2">Contato</div>
              <div className="col-span-3">Condições</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Ações</div>
            </div>
          </div>

          <div className="divide-y divide-slate-700">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="px-6 py-4 hover:bg-slate-700/50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{patient.avatar}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{patient.nome}</p>
                      <p className="text-slate-400 text-sm">{patient.idade}</p>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <p className="text-slate-300 text-sm">{patient.telefone}</p>
                    <p className="text-slate-400 text-xs">{patient.email}</p>
                  </div>

                  <div className="col-span-3">
                    <div className="flex flex-wrap gap-1">
                      {patient.condicoes.map((condicao, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded-full"
                        >
                          {condicao}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span className={`px-3 py-1 ${patient.statusColor} text-white text-xs rounded-full`}>
                      {patient.statusBadge}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center space-x-2">
                    <button
                      onClick={() => handleViewPatient(patient.id)}
                      className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditPatient(patient.id)}
                      className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Visualização em Cards/Grid
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{patient.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{patient.nome}</h3>
                    <p className="text-slate-400">{patient.idade}</p>
                    <span className={`inline-block px-3 py-1 mt-2 ${patient.statusColor} text-white text-sm rounded-full`}>
                      {patient.statusBadge}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{patient.telefone}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{patient.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{patient.endereco}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Condições Médicas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {patient.condicoes.map((condicao, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-600"
                    >
                      {condicao}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewPatient(patient.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-105 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Perfil
                  </button>
                  <button
                    onClick={() => handleEditPatient(patient.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
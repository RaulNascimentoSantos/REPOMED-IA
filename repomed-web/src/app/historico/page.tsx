'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import {
  Clock,
  User,
  Calendar,
  FileText,
  Pill,
  Activity,
  Heart,
  Brain,
  Eye,
  Edit,
  Download,
  Printer,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Thermometer,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  LineChart,
  Plus,
  Archive
} from 'lucide-react';

export default function HistoricoPage() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [expandedRecord, setExpandedRecord] = useState<any>(null);
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const pacientes = [
    { id: 1, nome: 'Maria Silva Santos', avatar: 'MS', ultimaConsulta: '2024-01-15' },
    { id: 2, nome: 'João Carlos Oliveira', avatar: 'JC', ultimaConsulta: '2024-01-14' },
    { id: 3, nome: 'Ana Paula Costa', avatar: 'AP', ultimaConsulta: '2024-01-13' },
    { id: 4, nome: 'Carlos Eduardo Lima', avatar: 'CE', ultimaConsulta: '2024-01-12' }
  ];

  const historicoMedico = [
    {
      id: 1,
      data: '2024-01-15',
      tipo: 'Consulta',
      titulo: 'Consulta de Rotina - Diabetes',
      medico: 'Dr. João Silva',
      especialidade: 'Endocrinologia',
      descricao: 'Paciente apresenta controle adequado da glicemia. Mantido tratamento atual.',
      diagnosticos: ['Diabetes Mellitus Tipo 2', 'Hipertensão Arterial'],
      medicamentos: ['Metformina 850mg', 'Losartana 50mg'],
      sinaisVitais: {
        pressao: '130/80',
        temperatura: '36.5°C',
        frequenciaCardiaca: '72 bpm',
        peso: '78kg'
      },
      examesTornar: ['Hemograma', 'Glicemia de jejum'],
      status: 'Concluído',
      prioridade: 'Normal'
    },
    {
      id: 2,
      data: '2024-01-10',
      tipo: 'Exame',
      titulo: 'Hemograma Completo',
      medico: 'Dr. Ana Santos',
      especialidade: 'Laboratório',
      descricao: 'Hemograma dentro dos parâmetros normais. Não há sinais de anemia ou infecção.',
      resultados: {
        hemoglobina: '14.2 g/dL',
        hematocrilo: '42%',
        leucocitos: '7.200/mm³',
        plaquetas: '250.000/mm³'
      },
      status: 'Normal',
      prioridade: 'Normal'
    },
    {
      id: 3,
      data: '2024-01-05',
      tipo: 'Procedimento',
      titulo: 'Eletrocardiograma',
      medico: 'Dr. Carlos Cardio',
      especialidade: 'Cardiologia',
      descricao: 'ECG apresenta ritmo sinusal normal. Sem alterações significativas.',
      resultados: {
        ritmo: 'Sinusal Normal',
        frequencia: '68 bpm',
        intervalo: 'Normal',
        conclusao: 'ECG Normal'
      },
      status: 'Normal',
      prioridade: 'Normal'
    },
    {
      id: 4,
      data: '2023-12-20',
      tipo: 'Consulta',
      titulo: 'Primeira Consulta - Avaliação Inicial',
      medico: 'Dr. João Silva',
      especialidade: 'Clínica Geral',
      descricao: 'Paciente busca acompanhamento para diabetes recém diagnosticado.',
      diagnosticos: ['Diabetes Mellitus Tipo 2 - Recém Diagnosticado'],
      medicamentos: ['Metformina 500mg (inicial)'],
      sinaisVitais: {
        pressao: '140/90',
        temperatura: '36.8°C',
        frequenciaCardiaca: '78 bpm',
        peso: '80kg'
      },
      status: 'Concluído',
      prioridade: 'Alta'
    }
  ];

  const filteredHistorico = historicoMedico.filter(record => {
    const matchesSearch = record.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.descricao.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'todos') return matchesSearch;
    if (filterType === 'consultas') return matchesSearch && record.tipo === 'Consulta';
    if (filterType === 'exames') return matchesSearch && record.tipo === 'Exame';
    if (filterType === 'procedimentos') return matchesSearch && record.tipo === 'Procedimento';

    return matchesSearch;
  });

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'Consulta': return Stethoscope;
      case 'Exame': return Activity;
      case 'Procedimento': return Heart;
      default: return FileText;
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'Consulta': return 'text-blue-400';
      case 'Exame': return 'text-green-400';
      case 'Procedimento': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal': return 'text-green-400';
      case 'Alterado': return 'text-yellow-400';
      case 'Crítico': return 'text-red-400';
      case 'Concluído': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="p-6">
      <BackButton />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Histórico Médico</h1>
          <p className="text-slate-400">Histórico completo de consultas, exames e procedimentos</p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 hover:scale-105 text-white rounded-lg transition-all duration-300">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white rounded-lg transition-all duration-300">
            <Plus className="w-4 h-4" />
            <span>Novo Registro</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de Pacientes */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <h2 className="text-lg font-semibold text-white mb-4">Pacientes</h2>

          <div className="space-y-3">
            {pacientes.map((paciente) => (
              <button
                key={paciente.id}
                onClick={() => setSelectedPatient(paciente)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 text-left group hover:scale-105 ${
                  selectedPatient?.id === paciente.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-white font-semibold text-base">{paciente.avatar}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium group-hover:text-blue-200 transition-colors">{paciente.nome}</h3>
                  <p className="text-base opacity-75">Última: {new Date(paciente.ultimaConsulta).toLocaleDateString('pt-BR')}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Histórico */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filtros */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar no histórico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 transition-all"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="todos">Todos</option>
                <option value="consultas">Consultas</option>
                <option value="exames">Exames</option>
                <option value="procedimentos">Procedimentos</option>
              </select>
            </div>

            <button className="p-2 bg-slate-800 hover:bg-slate-700 hover:scale-110 rounded-lg transition-all duration-300">
              <Filter className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Timeline do Histórico */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-6">
              Histórico {selectedPatient ? `- ${selectedPatient.nome}` : '- Selecione um paciente'}
            </h2>

            {!selectedPatient ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Selecione um paciente para ver o histórico médico</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredHistorico.map((record, index) => {
                  const TypeIcon = getTypeIcon(record.tipo);
                  const isExpanded = expandedRecord === record.id;

                  return (
                    <div key={record.id} className="relative">
                      {/* Linha da Timeline */}
                      {index < filteredHistorico.length - 1 && (
                        <div className="absolute left-6 top-16 w-0.5 h-20 bg-slate-600"></div>
                      )}

                      <div className="flex space-x-4">
                        {/* Ícone da Timeline */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-slate-900 ${
                          record.tipo === 'Consulta' ? 'bg-blue-600' :
                          record.tipo === 'Exame' ? 'bg-green-600' :
                          'bg-purple-600'
                        } group-hover:scale-110 transition-transform`}>
                          <TypeIcon className="w-6 h-6 text-white" />
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 bg-slate-700 rounded-lg p-4 hover:bg-slate-600 hover:scale-105 transition-all duration-300 group">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-white font-semibold group-hover:text-blue-200 transition-colors">{record.titulo}</h3>
                                <span className={`px-2 py-1 rounded-full text-base font-medium ${
                                  record.tipo === 'Consulta' ? 'bg-blue-600/20 text-blue-400' :
                                  record.tipo === 'Exame' ? 'bg-green-600/20 text-green-400' :
                                  'bg-purple-600/20 text-purple-400'
                                }`}>
                                  {record.tipo}
                                </span>
                              </div>

                              <div className="flex items-center space-x-4 text-slate-400 text-base mb-2">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(record.data).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>{record.medico}</span>
                                </div>
                                <span className="text-slate-500">{record.especialidade}</span>
                              </div>

                              <p className="text-slate-300 text-base group-hover:text-slate-200 transition-colors">{record.descricao}</p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-base font-medium ${
                                getStatusColor(record.status) === 'text-green-400' ? 'bg-green-600/20 text-green-400' :
                                getStatusColor(record.status) === 'text-yellow-400' ? 'bg-yellow-600/20 text-yellow-400' :
                                getStatusColor(record.status) === 'text-red-400' ? 'bg-red-600/20 text-red-400' :
                                'bg-blue-600/20 text-blue-400'
                              }`}>
                                {record.status}
                              </span>

                              <button
                                onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                                className="p-2 bg-slate-600 hover:bg-slate-500 hover:scale-110 rounded-lg transition-all duration-300"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-white" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-white" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Detalhes Expandidos */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-slate-600 space-y-4">
                              {/* Diagnósticos */}
                              {record.diagnosticos && (
                                <div>
                                  <h4 className="text-white font-medium mb-2">Diagnósticos:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {record.diagnosticos.map((diag, index) => (
                                      <span key={index} className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-base">
                                        {diag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Medicamentos */}
                              {record.medicamentos && (
                                <div>
                                  <h4 className="text-white font-medium mb-2">Medicamentos:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {record.medicamentos.map((med, index) => (
                                      <span key={index} className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-base">
                                        {med}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Sinais Vitais */}
                              {record.sinaisVitais && (
                                <div>
                                  <h4 className="text-white font-medium mb-2">Sinais Vitais:</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-600 rounded-lg p-3">
                                      <p className="text-slate-400 text-base">Pressão</p>
                                      <p className="text-white font-medium">{record.sinaisVitais.pressao}</p>
                                    </div>
                                    <div className="bg-slate-600 rounded-lg p-3">
                                      <p className="text-slate-400 text-base">Temperatura</p>
                                      <p className="text-white font-medium">{record.sinaisVitais.temperatura}</p>
                                    </div>
                                    <div className="bg-slate-600 rounded-lg p-3">
                                      <p className="text-slate-400 text-base">Freq. Cardíaca</p>
                                      <p className="text-white font-medium">{record.sinaisVitais.frequenciaCardiaca}</p>
                                    </div>
                                    <div className="bg-slate-600 rounded-lg p-3">
                                      <p className="text-slate-400 text-base">Peso</p>
                                      <p className="text-white font-medium">{record.sinaisVitais.peso}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Resultados */}
                              {record.resultados && (
                                <div>
                                  <h4 className="text-white font-medium mb-2">Resultados:</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(record.resultados).map(([key, value]) => (
                                      <div key={key} className="bg-slate-600 rounded-lg p-3">
                                        <p className="text-slate-400 text-base capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                        <p className="text-white font-medium">{value}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Ações */}
                              <div className="flex items-center space-x-2 pt-2">
                                <button className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white rounded-lg transition-all duration-300">
                                  <Eye className="w-4 h-4" />
                                  <span>Ver Detalhes</span>
                                </button>
                                <button className="flex items-center space-x-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 hover:scale-105 text-white rounded-lg transition-all duration-300">
                                  <Edit className="w-4 h-4" />
                                  <span>Editar</span>
                                </button>
                                <button className="flex items-center space-x-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 hover:scale-105 text-white rounded-lg transition-all duration-300">
                                  <Printer className="w-4 h-4" />
                                  <span>Imprimir</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
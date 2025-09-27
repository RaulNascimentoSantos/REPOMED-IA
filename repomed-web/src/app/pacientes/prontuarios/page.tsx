'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Filter,
  FileText,
  User,
  Calendar,
  Clock,
  Heart,
  Activity,
  Pill,
  Stethoscope,
  Eye,
  Edit,
  Download,
  Share,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProntuarioItem {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  type: 'consulta' | 'exame' | 'cirurgia' | 'retorno';
  status: 'active' | 'archived' | 'pending';
  physician: string;
  department: string;
  diagnosis?: string;
  medications?: string[];
  observations?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function ProntuariosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const prontuarios: ProntuarioItem[] = [
    {
      id: 'PRON-001',
      patientName: 'Maria Silva Santos',
      patientId: 'PAC-001',
      date: '2024-09-16',
      type: 'consulta',
      status: 'active',
      physician: 'Dr. João Silva',
      department: 'Cardiologia',
      diagnosis: 'Hipertensão arterial controlada',
      medications: ['Losartana 50mg', 'Hidroclorotiazida 25mg'],
      observations: 'Paciente apresentando melhora dos sintomas. Continuar tratamento.',
      priority: 'medium'
    },
    {
      id: 'PRON-002',
      patientName: 'João Costa Lima',
      patientId: 'PAC-002',
      date: '2024-09-15',
      type: 'exame',
      status: 'pending',
      physician: 'Dra. Ana Paula',
      department: 'Neurologia',
      diagnosis: 'Cefaleia recorrente - investigação',
      observations: 'Solicitado RNM de crânio. Aguardando resultado.',
      priority: 'high'
    },
    {
      id: 'PRON-003',
      patientName: 'Pedro Santos Oliveira',
      patientId: 'PAC-003',
      date: '2024-09-14',
      type: 'retorno',
      status: 'active',
      physician: 'Dr. Carlos Andrade',
      department: 'Ortopedia',
      diagnosis: 'Fratura de fêmur - pós-operatório',
      medications: ['Dipirona 500mg', 'Cálcio + Vit D'],
      observations: 'Evolução satisfatória. Fisioterapia em andamento.',
      priority: 'low'
    },
    {
      id: 'PRON-004',
      patientName: 'Ana Lima Ferreira',
      patientId: 'PAC-004',
      date: '2024-09-13',
      type: 'cirurgia',
      status: 'archived',
      physician: 'Dr. Roberto Silva',
      department: 'Cirurgia Geral',
      diagnosis: 'Apendicite aguda - pós-operatório',
      medications: ['Antibiótico EV', 'Analgésico'],
      observations: 'Cirurgia realizada com sucesso. Alta médica programada.',
      priority: 'medium'
    }
  ];

  const filteredProntuarios = prontuarios.filter(prontuario => {
    const matchesSearch = prontuario.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prontuario.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prontuario.physician.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = selectedFilter === 'all' || prontuario.type === selectedFilter;
    const matchesPriority = selectedPriority === 'all' || prontuario.priority === selectedPriority;

    return matchesSearch && matchesFilter && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'archived': return <XCircle className="w-4 h-4" style={{ color: 'var(--text-aaa-secondary)' }} />;
      default: return <AlertCircle className="w-4 h-4" style={{ color: 'var(--text-aaa-secondary)' }} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consulta': return <Stethoscope className="w-4 h-4 text-blue-500" />;
      case 'exame': return <Activity className="w-4 h-4 text-purple-500" />;
      case 'cirurgia': return <Heart className="w-4 h-4 text-red-500" />;
      case 'retorno': return <Clock className="w-4 h-4 text-green-500" />;
      default: return <FileText className="w-4 h-4" style={{ color: 'var(--text-aaa-secondary)' }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-primary)'}}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="semantic-card rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/pacientes')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                Prontuários Médicos
              </h1>
              <p style={{color: 'var(--text-muted)'}}>
                Histórico médico completo dos pacientes
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" style={{color: 'var(--text-muted)'}} />
              <input
                type="text"
                placeholder="Buscar por paciente, diagnóstico ou médico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="form-select px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os tipos</option>
              <option value="consulta">Consultas</option>
              <option value="exame">Exames</option>
              <option value="cirurgia">Cirurgias</option>
              <option value="retorno">Retornos</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="form-select px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as prioridades</option>
              <option value="high">Alta prioridade</option>
              <option value="medium">Média prioridade</option>
              <option value="low">Baixa prioridade</option>
            </select>

            <Button
              className="btn-primary"
              onClick={() => router.push('/pacientes/prontuarios/novo')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Prontuário
            </Button>
          </div>
        </div>

        {/* Lista de Prontuários */}
        <div className="space-y-4">
          {filteredProntuarios.map((prontuario) => (
            <div
              key={prontuario.id}
              className="semantic-card rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(prontuario.type)}
                  <div>
                    <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>
                      {prontuario.patientName}
                    </h3>
                    <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                      ID: {prontuario.patientId} • {prontuario.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(prontuario.priority)}`}>
                    {prontuario.priority === 'high' ? 'Alta' :
                     prontuario.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                  {getStatusIcon(prontuario.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{color: 'var(--text-muted)'}} />
                  <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
                    {new Date(prontuario.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" style={{color: 'var(--text-muted)'}} />
                  <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
                    {prontuario.physician}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{color: 'var(--text-muted)'}} />
                  <span className="text-sm capitalize" style={{color: 'var(--text-secondary)'}}>
                    {prontuario.type}
                  </span>
                </div>
              </div>

              {prontuario.diagnosis && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-1" style={{color: 'var(--text-secondary)'}}>
                    Diagnóstico:
                  </h4>
                  <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                    {prontuario.diagnosis}
                  </p>
                </div>
              )}

              {prontuario.medications && prontuario.medications.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-2" style={{color: 'var(--text-secondary)'}}>
                    <Pill className="w-4 h-4" />
                    Medicações:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {prontuario.medications.map((med, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: 'var(--accent-primary)',
                          color: 'white',
                          opacity: 0.8
                        }}
                      >
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {prontuario.observations && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1" style={{color: 'var(--text-secondary)'}}>
                    Observações:
                  </h4>
                  <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                    {prontuario.observations}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4" style={{borderTop: '1px solid var(--border-color)'}}>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{color: 'var(--text-muted)'}}>
                    #{prontuario.id}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="btn-secondary">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="btn-secondary">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="btn-secondary">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="btn-secondary">
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="btn-secondary">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProntuarios.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nenhum prontuário encontrado
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Tente ajustar os filtros ou criar um novo prontuário médico.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push('/pacientes/prontuarios/novo')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Prontuário
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
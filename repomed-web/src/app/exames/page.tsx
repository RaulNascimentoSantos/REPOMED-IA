'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  Eye,
  Edit,
  Download,
  Printer,
  FileText,
  Heart,
  Brain,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileCheck
} from 'lucide-react';

export default function ExamesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterType, setFilterType] = useState('todos');

  const exames = [
    {
      id: 1,
      paciente: 'Maria Silva Santos',
      tipo: 'Hemograma Completo',
      categoria: 'Laboratório',
      data: '2024-01-15',
      status: 'Concluído',
      statusColor: 'bg-green-500',
      resultado: 'Normal',
      resultadoColor: 'text-green-400',
      medico: 'Dr. João Silva',
      laboratorio: 'Lab Central',
      observacoes: 'Todos os parâmetros dentro da normalidade',
      prioridade: 'Normal',
      prioridadeColor: 'bg-blue-500'
    },
    {
      id: 2,
      paciente: 'João Carlos Oliveira',
      tipo: 'Eletrocardiograma',
      categoria: 'Cardiologia',
      data: '2024-01-14',
      status: 'Pendente',
      statusColor: 'bg-yellow-500',
      resultado: 'Aguardando',
      resultadoColor: 'text-yellow-400',
      medico: 'Dr. Carlos Cardio',
      laboratorio: 'Clínica do Coração',
      observacoes: 'Exame agendado para avaliação cardíaca',
      prioridade: 'Alta',
      prioridadeColor: 'bg-red-500'
    },
    {
      id: 3,
      paciente: 'Ana Paula Costa',
      tipo: 'Ressonância Magnética',
      categoria: 'Neurologia',
      data: '2024-01-13',
      status: 'Em Andamento',
      statusColor: 'bg-blue-500',
      resultado: 'Processando',
      resultadoColor: 'text-blue-400',
      medico: 'Dr. Ana Neuro',
      laboratorio: 'Centro de Imagem',
      observacoes: 'Investigação de cefaleia persistente',
      prioridade: 'Alta',
      prioridadeColor: 'bg-red-500'
    },
    {
      id: 4,
      paciente: 'Carlos Eduardo Lima',
      tipo: 'Glicemia em Jejum',
      categoria: 'Laboratório',
      data: '2024-01-12',
      status: 'Concluído',
      statusColor: 'bg-green-500',
      resultado: 'Alterado',
      resultadoColor: 'text-red-400',
      medico: 'Dr. João Silva',
      laboratorio: 'Lab Central',
      observacoes: 'Glicemia: 280 mg/dL - Requer acompanhamento',
      prioridade: 'Crítica',
      prioridadeColor: 'bg-red-600'
    },
    {
      id: 5,
      paciente: 'Maria Silva Santos',
      tipo: 'Raio-X Tórax',
      categoria: 'Radiologia',
      data: '2024-01-11',
      status: 'Cancelado',
      statusColor: 'bg-red-500',
      resultado: 'Cancelado',
      resultadoColor: 'text-red-400',
      medico: 'Dr. Roberto Radio',
      laboratorio: 'Centro de Imagem',
      observacoes: 'Cancelado pelo paciente',
      prioridade: 'Normal',
      prioridadeColor: 'bg-blue-500'
    }
  ];

  const stats = {
    total: 5,
    concluidos: 2,
    pendentes: 1,
    emAndamento: 1,
    cancelados: 1
  };

  const filteredExames = exames.filter(exame => {
    const matchesSearch = exame.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exame.tipo.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === 'concluidos') matchesStatus = exame.status === 'Concluído';
    if (filterStatus === 'pendentes') matchesStatus = exame.status === 'Pendente';
    if (filterStatus === 'andamento') matchesStatus = exame.status === 'Em Andamento';
    if (filterStatus === 'cancelados') matchesStatus = exame.status === 'Cancelado';

    let matchesType = true;
    if (filterType === 'laboratorio') matchesType = exame.categoria === 'Laboratório';
    if (filterType === 'cardiologia') matchesType = exame.categoria === 'Cardiologia';
    if (filterType === 'neurologia') matchesType = exame.categoria === 'Neurologia';
    if (filterType === 'radiologia') matchesType = exame.categoria === 'Radiologia';

    return matchesSearch && matchesStatus && matchesType;
  });

  const getIconForCategory = (categoria) => {
    switch (categoria) {
      case 'Cardiologia': return Heart;
      case 'Neurologia': return Brain;
      case 'Laboratório': return Activity;
      case 'Radiologia': return Zap;
      default: return FileText;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Concluído': return CheckCircle;
      case 'Pendente': return Clock;
      case 'Em Andamento': return Activity;
      case 'Cancelado': return XCircle;
      default: return FileCheck;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Exames Médicos</h1>
              <p className="text-slate-400">Gerenciar exames e resultados</p>
            </div>
          </div>
          <div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span>Novo Exame</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Concluídos</p>
              <p className="text-2xl font-bold text-white">{stats.concluidos}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pendentes</p>
              <p className="text-2xl font-bold text-white">{stats.pendentes}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Em Andamento</p>
              <p className="text-2xl font-bold text-white">{stats.emAndamento}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Cancelados</p>
              <p className="text-2xl font-bold text-white">{stats.cancelados}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar exames..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="concluidos">Concluídos</option>
            <option value="pendentes">Pendentes</option>
            <option value="andamento">Em Andamento</option>
            <option value="cancelados">Cancelados</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todas as Categorias</option>
            <option value="laboratorio">Laboratório</option>
            <option value="cardiologia">Cardiologia</option>
            <option value="neurologia">Neurologia</option>
            <option value="radiologia">Radiologia</option>
          </select>
        </div>

        <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
          <Filter className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Lista de Exames */}
      <div className="space-y-4">
        {filteredExames.map((exame) => {
          const CategoryIcon = getIconForCategory(exame.categoria);
          const StatusIcon = getStatusIcon(exame.status);

          return (
            <div
              key={exame.id}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CategoryIcon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1">
                    {/* Header do exame */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-white font-semibold">{exame.tipo}</h3>
                        <span className={`px-2 py-1 ${exame.statusColor} text-white text-xs rounded-full`}>
                          {exame.status}
                        </span>
                        <span className={`px-2 py-1 ${exame.prioridadeColor} text-white text-xs rounded-full`}>
                          {exame.prioridade}
                        </span>
                      </div>
                      <div className="text-slate-400 text-sm">
                        {exame.categoria}
                      </div>
                    </div>

                    {/* Informações do paciente */}
                    <div className="flex items-center space-x-6 mb-4 text-slate-400 text-sm">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{exame.paciente}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Data: {new Date(exame.data).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{exame.medico}</span>
                      </div>
                    </div>

                    {/* Resultado e Laboratório */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-700 rounded-lg p-3">
                        <h4 className="text-white font-medium mb-1">Resultado:</h4>
                        <p className={`text-sm font-medium ${exame.resultadoColor}`}>
                          {exame.resultado}
                        </p>
                      </div>
                      <div className="bg-slate-700 rounded-lg p-3">
                        <h4 className="text-white font-medium mb-1">Laboratório:</h4>
                        <p className="text-slate-400 text-sm">{exame.laboratorio}</p>
                      </div>
                    </div>

                    {/* Observações */}
                    {exame.observacoes && (
                      <div className="mb-4">
                        <h4 className="text-white font-medium mb-1">Observações:</h4>
                        <p className="text-slate-400 text-sm">{exame.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors group">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors group">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors group">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors group">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between mt-8">
        <p className="text-slate-400 text-sm">
          Mostrando {filteredExames.length} de {exames.length} exames
        </p>

        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">
            Anterior
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">
            1
          </button>
          <button className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}
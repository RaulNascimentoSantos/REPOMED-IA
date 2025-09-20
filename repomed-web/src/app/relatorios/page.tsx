'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Users,
  FileText,
  Calendar,
  Download,
  Printer,
  Filter,
  Search,
  Plus,
  Eye,
  Share,
  RefreshCw,
  Clock,
  DollarSign,
  Heart,
  AlertTriangle
} from 'lucide-react';

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('geral');

  const dashboardMetrics = {
    pacientesTotal: 1247,
    consultasHoje: 24,
    documentosGerados: 3891,
    receitaMensal: 45680,
    crescimentoPacientes: 12,
    crescimentoConsultas: 19,
    crescimentoDocumentos: 23,
    crescimentoReceita: 15
  };

  const reportsCategories = [
    {
      id: 'financeiro',
      title: 'Relatórios Financeiros',
      icon: DollarSign,
      color: 'bg-green-600',
      reports: [
        { name: 'Receita Mensal', lastGenerated: '2024-01-15', status: 'Atualizado' },
        { name: 'Análise de Custos', lastGenerated: '2024-01-14', status: 'Pendente' },
        { name: 'Faturamento por Especialidade', lastGenerated: '2024-01-13', status: 'Atualizado' }
      ]
    },
    {
      id: 'clinico',
      title: 'Relatórios Clínicos',
      icon: Heart,
      color: 'bg-red-600',
      reports: [
        { name: 'Indicadores de Saúde', lastGenerated: '2024-01-15', status: 'Atualizado' },
        { name: 'Tratamentos Realizados', lastGenerated: '2024-01-12', status: 'Atualizado' },
        { name: 'Evolução de Pacientes', lastGenerated: '2024-01-10', status: 'Desatualizado' }
      ]
    },
    {
      id: 'operacional',
      title: 'Relatórios Operacionais',
      icon: Activity,
      color: 'bg-blue-600',
      reports: [
        { name: 'Produtividade Médica', lastGenerated: '2024-01-15', status: 'Atualizado' },
        { name: 'Ocupação de Salas', lastGenerated: '2024-01-14', status: 'Atualizado' },
        { name: 'Tempo Médio de Consulta', lastGenerated: '2024-01-11', status: 'Pendente' }
      ]
    },
    {
      id: 'qualidade',
      title: 'Relatórios de Qualidade',
      icon: AlertTriangle,
      color: 'bg-purple-600',
      reports: [
        { name: 'Satisfação do Paciente', lastGenerated: '2024-01-14', status: 'Atualizado' },
        { name: 'Indicadores de Qualidade', lastGenerated: '2024-01-12', status: 'Atualizado' },
        { name: 'Eventos Adversos', lastGenerated: '2024-01-08', status: 'Desatualizado' }
      ]
    }
  ];

  const chartData = {
    pacientes: [
      { month: 'Jan', value: 1180 },
      { month: 'Fev', value: 1205 },
      { month: 'Mar', value: 1220 },
      { month: 'Abr', value: 1235 },
      { month: 'Mai', value: 1240 },
      { month: 'Jun', value: 1247 }
    ],
    consultas: [
      { month: 'Jan', value: 580 },
      { month: 'Fev', value: 620 },
      { month: 'Mar', value: 650 },
      { month: 'Abr', value: 680 },
      { month: 'Mai', value: 710 },
      { month: 'Jun', value: 740 }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Atualizado': return 'text-green-400';
      case 'Pendente': return 'text-yellow-400';
      case 'Desatualizado': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Atualizado': return 'bg-green-600';
      case 'Pendente': return 'bg-yellow-600';
      case 'Desatualizado': return 'bg-red-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <>
      <BackButton href="/" />
      <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Relatórios e Analytics</h1>
          <p className="text-slate-400">Análise de dados e indicadores</p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>Novo Relatório</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-slate-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('relatorios')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'relatorios'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Relatórios
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm">↗ +{dashboardMetrics.crescimentoPacientes}%</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Pacientes Ativos</h3>
              <h2 className="text-3xl font-bold text-white">{dashboardMetrics.pacientesTotal.toLocaleString()}</h2>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm">↗ +{dashboardMetrics.crescimentoConsultas}%</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Consultas Hoje</h3>
              <h2 className="text-3xl font-bold text-white">{dashboardMetrics.consultasHoje}</h2>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm">↗ +{dashboardMetrics.crescimentoDocumentos}%</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Documentos Gerados</h3>
              <h2 className="text-3xl font-bold text-white">{dashboardMetrics.documentosGerados.toLocaleString()}</h2>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm">↗ +{dashboardMetrics.crescimentoReceita}%</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Receita Mensal</h3>
              <h2 className="text-3xl font-bold text-white">R$ {dashboardMetrics.receitaMensal.toLocaleString()}</h2>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pacientes */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Crescimento de Pacientes</h3>
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="h-64 flex items-end justify-between">
                {chartData.pacientes.map((item, index) => (
                  <div key={item.month} className="flex flex-col items-center">
                    <div
                      className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm mb-2"
                      style={{ height: `${(item.value / 1250) * 200}px` }}
                    />
                    <span className="text-slate-400 text-xs">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de Consultas */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Consultas Mensais</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="h-64 flex items-end justify-between">
                {chartData.consultas.map((item, index) => (
                  <div key={item.month} className="flex flex-col items-center">
                    <div
                      className="w-8 bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm mb-2"
                      style={{ height: `${(item.value / 750) * 200}px` }}
                    />
                    <span className="text-slate-400 text-xs">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relatórios Tab */}
      {activeTab === 'relatorios' && (
        <div className="space-y-6">
          {/* Filtros */}
          <div className="flex items-center space-x-4 mb-6">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 3 meses</option>
              <option value="365">Último ano</option>
            </select>

            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="geral">Relatório Geral</option>
              <option value="financeiro">Financeiro</option>
              <option value="clinico">Clínico</option>
              <option value="operacional">Operacional</option>
            </select>
          </div>

          {/* Categorias de Relatórios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportsCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                  </div>

                  <div className="space-y-3">
                    {category.reports.map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium text-sm">{report.name}</h4>
                          <p className="text-slate-400 text-xs">
                            Último: {new Date(report.lastGenerated).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 ${getStatusBadgeColor(report.status)} text-white text-xs rounded-full`}>
                            {report.status}
                          </span>
                          <button className="p-1 bg-slate-600 hover:bg-slate-500 rounded text-white">
                            <Eye className="w-3 h-3" />
                          </button>
                          <button className="p-1 bg-slate-600 hover:bg-slate-500 rounded text-white">
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Geral */}
            <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-6">Performance Geral</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Taxa de Ocupação</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-slate-700 rounded-full">
                      <div className="w-28 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-white font-medium">87%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Satisfação do Paciente</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-slate-700 rounded-full">
                      <div className="w-30 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-white font-medium">94%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Eficiência Operacional</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-slate-700 rounded-full">
                      <div className="w-26 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <span className="text-white font-medium">82%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left">
                  <Download className="w-5 h-5 text-blue-500" />
                  <span className="text-white">Exportar Dados</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left">
                  <Printer className="w-5 h-5 text-green-500" />
                  <span className="text-white">Imprimir Relatório</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left">
                  <Share className="w-5 h-5 text-purple-500" />
                  <span className="text-white">Compartilhar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
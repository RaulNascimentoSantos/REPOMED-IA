import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, FileText, Clock, Activity, Download } from 'lucide-react';

const MetricsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8082/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      // Mock data for demonstration
      setMetrics({
        documents_total: 156,
        templates_total: 5,
        api_latency_p95: 85.2,
        uptime: 2847392
      });
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  // Mock data for charts
  const documentsOverTime = [
    { month: 'Jan', documents: 20 },
    { month: 'Fev', documents: 35 },
    { month: 'Mar', documents: 28 },
    { month: 'Abr', documents: 45 },
    { month: 'Mai', documents: 67 },
    { month: 'Jun', documents: 52 },
    { month: 'Jul', documents: 78 },
    { month: 'Ago', documents: 89 }
  ];

  const documentTypes = [
    { name: 'Receitas', value: 65, color: '#6366f1' },
    { name: 'Atestados', value: 45, color: '#10b981' },
    { name: 'Exames', value: 30, color: '#f59e0b' },
    { name: 'Relatórios', value: 16, color: '#ef4444' }
  ];

  const apiMetrics = [
    { time: '00:00', latency: 45 },
    { time: '04:00', latency: 52 },
    { time: '08:00', latency: 78 },
    { time: '12:00', latency: 85 },
    { time: '16:00', latency: 72 },
    { time: '20:00', latency: 59 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Activity className="h-8 w-8 text-blue-600 mr-3" />
                Dashboard de Métricas
              </h1>
              <p className="text-gray-600 mt-1">
                Acompanhe o desempenho e uso do sistema
              </p>
            </div>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              onClick={() => {
                // TODO: Implement export functionality
                alert('Exportar Relatório - Funcionalidade em desenvolvimento');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Documentos</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.documents_total}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-600 ml-1">vs mês anterior</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Templates Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.templates_total}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">Todos funcionais</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Latência API (P95)</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.api_latency_p95.toFixed(1)}ms</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">Excelente</span>
              <span className="text-gray-600 ml-1">&lt; 100ms</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{formatUptime(metrics.uptime)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">99.9%</span>
              <span className="text-gray-600 ml-1">disponibilidade</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Documents Over Time */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos Criados por Mês</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={documentsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="documents" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Document Types Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={documentTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {documentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* API Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance da API (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={apiMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}ms`, 'Latência']} />
              <Line type="monotone" dataKey="latency" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Serviços</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">API Principal</span>
              </div>
              <span className="text-green-600 font-medium">Operacional</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Sistema de Assinatura</span>
              </div>
              <span className="text-green-600 font-medium">Operacional</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Base de Dados</span>
              </div>
              <span className="text-yellow-600 font-medium">Modo Mock</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Sistema de Verificação</span>
              </div>
              <span className="text-green-600 font-medium">Operacional</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {[
              { time: '14:32', action: 'Documento assinado', details: 'Receita Simples - João Silva' },
              { time: '14:28', action: 'Novo template criado', details: 'Encaminhamento Médico' },
              { time: '14:15', action: 'Verificação realizada', details: 'Hash: a1b2c3d4...' },
              { time: '14:02', action: 'Usuário registrado', details: 'Dr. Maria Santos' },
              { time: '13:45', action: 'Documento criado', details: 'Atestado Médico - Pedro Costa' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;
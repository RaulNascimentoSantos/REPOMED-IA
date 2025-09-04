import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, FileText, Activity, Calendar } from 'lucide-react';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');
  
  // Mock data - replace with real API data
  const documentsPerDay = [
    { date: '01/01', documentos: 12, assinados: 8 },
    { date: '02/01', documentos: 19, assinados: 15 },
    { date: '03/01', documentos: 15, assinados: 12 },
    { date: '04/01', documentos: 25, assinados: 18 },
    { date: '05/01', documentos: 22, assinados: 20 },
    { date: '06/01', documentos: 18, assinados: 16 },
    { date: '07/01', documentos: 28, assinados: 25 }
  ];

  const documentTypes = [
    { name: 'Receitas', value: 45, color: '#3b82f6' },
    { name: 'Atestados', value: 25, color: '#10b981' },
    { name: 'Laudos', value: 20, color: '#f59e0b' },
    { name: 'Relatórios', value: 10, color: '#ef4444' }
  ];

  const patientsGrowth = [
    { mes: 'Jan', pacientes: 120 },
    { mes: 'Fev', pacientes: 145 },
    { mes: 'Mar', pacientes: 165 },
    { mes: 'Abr', pacientes: 180 },
    { mes: 'Mai', pacientes: 210 },
    { mes: 'Jun', pacientes: 235 }
  ];

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px'
  };

  const statCardStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center'
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div style={cardStyle}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center">
              <Activity className="h-8 w-8 mr-3 text-blue-500" />
              Analytics
            </h1>
            <p className="text-slate-600 mt-2">Análise detalhada do desempenho do sistema</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
          <FileText className="h-8 w-8 mx-auto mb-3" />
          <h3 className="text-2xl font-bold">1,247</h3>
          <p className="text-sm opacity-90">Documentos Criados</p>
          <div className="text-xs mt-2 opacity-80">+12% vs mês anterior</div>
        </div>

        <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <Users className="h-8 w-8 mx-auto mb-3" />
          <h3 className="text-2xl font-bold">235</h3>
          <p className="text-sm opacity-90">Pacientes Ativos</p>
          <div className="text-xs mt-2 opacity-80">+8% vs mês anterior</div>
        </div>

        <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <TrendingUp className="h-8 w-8 mx-auto mb-3" />
          <h3 className="text-2xl font-bold">94.2%</h3>
          <p className="text-sm opacity-90">Taxa de Assinatura</p>
          <div className="text-xs mt-2 opacity-80">+2.1% vs mês anterior</div>
        </div>

        <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
          <Calendar className="h-8 w-8 mx-auto mb-3" />
          <h3 className="text-2xl font-bold">18</h3>
          <p className="text-sm opacity-90">Docs por Dia (média)</p>
          <div className="text-xs mt-2 opacity-80">+5% vs mês anterior</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Documents per Day Chart */}
        <div style={cardStyle}>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Documentos por Dia
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={documentsPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="documentos" fill="#3b82f6" name="Total" />
              <Bar dataKey="assinados" fill="#10b981" name="Assinados" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Document Types Pie Chart */}
        <div style={cardStyle}>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Tipos de Documentos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={documentTypes}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {documentTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Patients Growth */}
        <div style={cardStyle}>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Crescimento de Pacientes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={patientsGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="pacientes" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Heatmap Placeholder */}
        <div style={cardStyle}>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Atividade por Hora
          </h3>
          <div className="grid grid-cols-8 gap-1 h-64">
            {Array.from({ length: 24 * 7 }, (_, i) => (
              <div
                key={i}
                className={`rounded aspect-square ${
                  Math.random() > 0.7 ? 'bg-green-500' :
                  Math.random() > 0.5 ? 'bg-yellow-400' :
                  Math.random() > 0.3 ? 'bg-blue-400' : 'bg-gray-200'
                }`}
                title={`Hora ${i % 24}:00 - ${Math.floor(Math.random() * 20)} atividades`}
              />
            ))}
          </div>
          <div className="mt-3 text-sm text-slate-600">
            <span className="inline-flex items-center mr-4">
              <div className="w-3 h-3 bg-gray-200 rounded mr-1"></div>
              Baixa atividade
            </span>
            <span className="inline-flex items-center mr-4">
              <div className="w-3 h-3 bg-yellow-400 rounded mr-1"></div>
              Média atividade
            </span>
            <span className="inline-flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
              Alta atividade
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div style={cardStyle}>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">
          Métricas Detalhadas
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métrica
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  7 dias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  30 dias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tendência
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Documentos criados
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">28</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">142</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,247</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">— +12%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Novos pacientes
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">18</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">67</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">— +8%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Taxa de assinatura
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">96.4%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">94.8%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">94.2%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">— +2.1%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Tempo médio de assinatura
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.3 min</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.8 min</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3.1 min</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">— -15%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
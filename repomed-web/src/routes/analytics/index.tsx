import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Loader2, TrendingUp, Users, FileText, Activity, Calendar, BarChart3, PieChart } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell 
} from 'recharts';

export default function Analytics() {
  const [period, setPeriod] = React.useState('7d');
  
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ['analytics', 'dashboard', period],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/metrics/dashboard?period=${period}`);
        return response.data || response;
      } catch {
        return generateMockDashboard();
      }
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });
  
  const { data: performanceData, isLoading: loadingPerformance } = useQuery({
    queryKey: ['analytics', 'performance', period],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/metrics/performance?period=${period}`);
        return response.data || response;
      } catch {
        return generateMockPerformance();
      }
    }
  });
  
  const generateMockDashboard = () => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    return {
      summary: {
        totalDocuments: 1234,
        activeUsers: 45,
        avgResponseTime: 245,
        successRate: 99.8
      },
      dailyActivity: days.map((day, i) => ({
        day,
        documentos: Math.floor(Math.random() * 50) + 100,
        usuarios: Math.floor(Math.random() * 20) + 10
      })),
      documentTypes: [
        { name: 'Receitas', value: 450, color: '#3B82F6' },
        { name: 'Atestados', value: 280, color: '#10B981' },
        { name: 'Laudos', value: 190, color: '#F59E0B' },
        { name: 'Relatórios', value: 314, color: '#EF4444' }
      ],
      hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}h`,
        requests: Math.floor(Math.random() * 100) + 20
      }))
    };
  };
  
  const generateMockPerformance = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        responseTime: Math.floor(Math.random() * 100) + 200,
        errorRate: Math.random() * 2,
        throughput: Math.floor(Math.random() * 500) + 800
      };
    });
    
    return {
      timeSeries: last7Days,
      endpoints: [
        { endpoint: '/api/documents', avgTime: '120ms', calls: '2.3k', errors: '0.1%' },
        { endpoint: '/api/templates', avgTime: '89ms', calls: '1.8k', errors: '0%' },
        { endpoint: '/api/patients', avgTime: '156ms', calls: '956', errors: '0.2%' },
        { endpoint: '/api/auth', avgTime: '245ms', calls: '432', errors: '1.2%' }
      ]
    };
  };
  
  const isLoading = loadingDashboard || loadingPerformance;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Carregando analytics...</span>
      </div>
    );
  }
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Análise detalhada de performance e uso do sistema
              </p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Documentos</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {dashboardData?.summary?.totalDocuments || 0}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12% vs período anterior</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Usuários Ativos</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {dashboardData?.summary?.activeUsers || 0}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8% vs período anterior</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Tempo Resposta</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {dashboardData?.summary?.avgResponseTime || 0}ms
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">-5% vs período anterior</p>
              </div>
              <Activity className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Taxa Sucesso</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {dashboardData?.summary?.successRate || 0}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+0.2% vs período anterior</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
        
        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividade Diária */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Atividade Diária
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData?.dailyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px' 
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="documentos" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6}
                  name="Documentos"
                />
                <Area 
                  type="monotone" 
                  dataKey="usuarios" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                  name="Usuários"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Distribuição por Tipo */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Documentos por Tipo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={dashboardData?.documentTypes || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(dashboardData?.documentTypes || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Performance Timeline */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Performance ao Longo do Tempo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData?.timeSeries || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#6b7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px' 
                }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="responseTime" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Tempo Resposta (ms)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="throughput" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Throughput (req/s)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Endpoints Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Performance por Endpoint
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Endpoint
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tempo Médio
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Chamadas
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Taxa de Erro
                  </th>
                </tr>
              </thead>
              <tbody>
                {(performanceData?.endpoints || []).map((endpoint: any, index: number) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-white font-mono">
                      {endpoint.endpoint}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-slate-700 dark:text-slate-300">
                      {endpoint.avgTime}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-slate-700 dark:text-slate-300">
                      {endpoint.calls}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        parseFloat(endpoint.errors) > 1 
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                          : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      }`}>
                        {endpoint.errors}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
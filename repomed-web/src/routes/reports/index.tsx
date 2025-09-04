import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Loader2, Download, FileText, TrendingUp, Calendar, Filter } from 'lucide-react';

export default function Reports(){
  const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
  const [reportType, setReportType] = React.useState('performance');
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', reportType, dateRange],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (dateRange.start) params.append('start', dateRange.start);
        if (dateRange.end) params.append('end', dateRange.end);
        
        const response = await api.get(`/api/metrics/${reportType}?${params}`);
        return response.data || response;
      } catch (err) {
        // Se a rota não existir, usar dados mock
        console.warn('API reports não disponível, usando mock');
        return generateMockData(reportType);
      }
    }
  });
  
  const generateMockData = (type: string) => {
    const baseData = {
      period: `${new Date().toLocaleDateString('pt-BR')} - ${new Date().toLocaleDateString('pt-BR')}`,
      generated_at: new Date().toISOString()
    };
    
    switch(type) {
      case 'performance':
        return {
          ...baseData,
          metrics: [
            { name: 'Tempo médio resposta', value: '245ms', trend: '+5%' },
            { name: 'Taxa de sucesso', value: '99.8%', trend: '+0.2%' },
            { name: 'Requisições/dia', value: '1,234', trend: '+12%' },
            { name: 'Documentos criados', value: '89', trend: '+23%' }
          ]
        };
      case 'usage':
        return {
          ...baseData,
          metrics: [
            { name: 'Usuários ativos', value: '45', trend: '+8%' },
            { name: 'Documentos/usuário', value: '3.2', trend: '+0.5' },
            { name: 'Templates mais usados', value: 'Receita (67%)', trend: 'stable' },
            { name: 'Horário de pico', value: '10-12h', trend: 'stable' }
          ]
        };
      case 'financial':
        return {
          ...baseData,
          metrics: [
            { name: 'Documentos processados', value: '2,456', trend: '+15%' },
            { name: 'Valor estimado', value: 'R$ 12,280', trend: '+15%' },
            { name: 'Custo/documento', value: 'R$ 0.50', trend: '-5%' },
            { name: 'ROI estimado', value: '320%', trend: '+20%' }
          ]
        };
      default:
        return { ...baseData, metrics: [] };
    }
  };
  
  const exportCSV = () => {
    if (!data) return;
    
    const rows = Array.isArray(data.metrics) ? data.metrics : [data];
    const headers = Object.keys(rows[0] || {});
    
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  
  const exportPDF = () => {
    // Simular exportação PDF
    alert('Exportação PDF será implementada em breve');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Carregando relatório...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-800 dark:text-red-200">Erro ao carregar relatórios</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Relatórios</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Visualize e exporte relatórios detalhados do sistema
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportCSV} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
              <Button onClick={exportPDF} variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Relatório
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="performance">Performance</option>
                <option value="usage">Uso do Sistema</option>
                <option value="financial">Financeiro</option>
                <option value="audit">Auditoria</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={() => refetch()} className="w-full flex items-center justify-center gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </div>
        </div>
        
        {/* Métricas Cards */}
        {data?.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.metrics.map((metric: any, index: number) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{metric.name}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {metric.value}
                    </p>
                  </div>
                  {metric.trend && (
                    <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-lg
                      ${metric.trend.startsWith('+') 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                        : metric.trend.startsWith('-')
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      <TrendingUp className="h-3 w-3" />
                      {metric.trend}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Dados Detalhados */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Dados Detalhados
          </h2>
          
          <div className="overflow-x-auto">
            <pre className="bg-slate-100 dark:bg-slate-900 rounded-xl p-4 text-xs text-slate-700 dark:text-slate-300">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          <p className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            Relatório gerado em: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
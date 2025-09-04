import React, { useState } from 'react';
import { Download, Calendar, Filter, FileText, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('documents');
  const [dateRange, setDateRange] = useState('30d');
  const [exportFormat, setExportFormat] = useState('pdf');

  // Mock reports data
  const reportTypes = [
    {
      id: 'documents',
      name: 'Relatório de Documentos',
      description: 'Análise completa de documentos criados, assinados e pendentes',
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      metrics: {
        total: 1247,
        signed: 1175,
        pending: 72,
        growth: '+12%'
      }
    },
    {
      id: 'patients',
      name: 'Relatório de Pacientes',
      description: 'Estatísticas de cadastro e atividade de pacientes',
      icon: <Users className="h-8 w-8 text-green-500" />,
      metrics: {
        total: 235,
        new: 67,
        active: 198,
        growth: '+8%'
      }
    },
    {
      id: 'performance',
      name: 'Relatório de Performance',
      description: 'Métricas de desempenho do sistema e tempo de resposta',
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      metrics: {
        responseTime: '1.2s',
        uptime: '99.8%',
        errors: '0.2%',
        growth: '+5%'
      }
    },
    {
      id: 'usage',
      name: 'Relatório de Uso',
      description: 'Análise de utilização das funcionalidades do sistema',
      icon: <BarChart3 className="h-8 w-8 text-orange-500" />,
      metrics: {
        dailyUsers: 42,
        sessions: 156,
        avgSession: '12.5min',
        growth: '+15%'
      }
    }
  ];

  const handleGenerateReport = () => {
    const report = reportTypes.find(r => r.id === selectedReport);
    alert(`Gerando ${report.name} no formato ${exportFormat.toUpperCase()} para os últimos ${dateRange}...`);
  };

  const handleDownloadSample = (reportId) => {
    alert(`Download do relatório exemplo: ${reportTypes.find(r => r.id === reportId).name}`);
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px'
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div style={cardStyle}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center">
              <FileText className="h-8 w-8 mr-3 text-blue-500" />
              Relatórios
            </h1>
            <p className="text-slate-600 mt-2">Gere relatórios detalhados do sistema RepoMed IA</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Types */}
        <div className="lg:col-span-2">
          <div style={cardStyle}>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Tipos de Relatório</h2>
            <div className="grid gap-4">
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedReport === report.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {report.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-slate-900">{report.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{report.description}</p>
                      
                      {/* Metrics Preview */}
                      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {Object.entries(report.metrics).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-lg font-bold text-slate-900">{value}</div>
                            <div className="text-xs text-slate-500 capitalize">
                              {key === 'responseTime' ? 'Resp. Time' :
                               key === 'avgSession' ? 'Avg Session' :
                               key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSample(report.id);
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Exemplo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Reports */}
          <div style={cardStyle}>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Relatórios Rápidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-2">Resumo Diário</h3>
                <p className="text-sm text-slate-600 mb-3">Relatório das atividades do dia atual</p>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-blue-600">28</div>
                  <Button size="sm" onClick={() => alert('Gerando resumo diário...')}>
                    <Download className="h-4 w-4 mr-1" />
                    Gerar
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-2">Resumo Semanal</h3>
                <p className="text-sm text-slate-600 mb-3">Análise dos últimos 7 dias</p>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-green-600">142</div>
                  <Button size="sm" onClick={() => alert('Gerando resumo semanal...')}>
                    <Download className="h-4 w-4 mr-1" />
                    Gerar
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-2">Resumo Mensal</h3>
                <p className="text-sm text-slate-600 mb-3">Relatório completo do mês</p>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-purple-600">1,247</div>
                  <Button size="sm" onClick={() => alert('Gerando resumo mensal...')}>
                    <Download className="h-4 w-4 mr-1" />
                    Gerar
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-2">Auditoria</h3>
                <p className="text-sm text-slate-600 mb-3">Log de atividades e alterações</p>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-orange-600">324</div>
                  <Button size="sm" onClick={() => alert('Gerando relatório de auditoria...')}>
                    <Download className="h-4 w-4 mr-1" />
                    Gerar
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Report Generator */}
        <div>
          <div style={cardStyle}>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Configurar Relatório
            </h2>
            
            <div className="space-y-4">
              {/* Selected Report */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Relatório Selecionado
                </label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm font-medium text-blue-900">
                    {reportTypes.find(r => r.id === selectedReport)?.name}
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Período
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1d">Último dia</option>
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                  <option value="1y">Último ano</option>
                  <option value="custom">Período personalizado</option>
                </select>
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Download className="h-4 w-4 inline mr-1" />
                  Formato de Exportação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['pdf', 'excel', 'csv', 'json'].map((format) => (
                    <button
                      key={format}
                      onClick={() => setExportFormat(format)}
                      className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                        exportFormat === format
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filtros Adicionais
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                    <span className="ml-2 text-sm text-slate-600">Incluir documentos assinados</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                    <span className="ml-2 text-sm text-slate-600">Incluir documentos pendentes</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded text-blue-600" />
                    <span className="ml-2 text-sm text-slate-600">Incluir dados sensíveis</span>
                  </label>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                className="w-full"
                onClick={handleGenerateReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>

          {/* Recent Reports */}
          <div style={cardStyle}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Relatórios Recentes</h2>
            <div className="space-y-3">
              {[
                { name: 'Relatório de Documentos', date: '15/01/2024', format: 'PDF', size: '2.1 MB' },
                { name: 'Relatório de Pacientes', date: '10/01/2024', format: 'Excel', size: '856 KB' },
                { name: 'Resumo Semanal', date: '08/01/2024', format: 'PDF', size: '1.4 MB' },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{report.name}</div>
                    <div className="text-xs text-slate-500">{report.date} " {report.format} " {report.size}</div>
                  </div>
                  <Button size="sm" variant="secondary">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Export Stats */}
          <div style={cardStyle}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Estatísticas</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Relatórios gerados hoje:</span>
                <span className="text-sm font-medium text-slate-900">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Esta semana:</span>
                <span className="text-sm font-medium text-slate-900">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Este mês:</span>
                <span className="text-sm font-medium text-slate-900">47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Espaço usado:</span>
                <span className="text-sm font-medium text-slate-900">14.2 MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Settings,
  Filter,
  Search,
  Eye,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Globe,
  Users,
  FileText
} from 'lucide-react';

export default function SystemMonitorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const performRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const systemMetrics = [
    {
      name: 'CPU Usage',
      value: '47%',
      status: 'normal',
      trend: 'stable',
      icon: Cpu,
      color: 'text-blue-500',
      bgColor: 'bg-blue-600',
      details: 'Intel Core i7-12700K @ 3.6GHz'
    },
    {
      name: 'Memory',
      value: '6.2GB / 16GB',
      status: 'normal',
      trend: 'up',
      icon: HardDrive,
      color: 'text-green-500',
      bgColor: 'bg-green-600',
      details: 'DDR4 3200MHz - 38% utilização'
    },
    {
      name: 'Storage',
      value: '245GB / 1TB',
      status: 'normal',
      trend: 'up',
      icon: HardDrive,
      color: 'text-purple-500',
      bgColor: 'bg-purple-600',
      details: 'SSD NVMe - 24% utilizado'
    },
    {
      name: 'Network',
      value: '156 Mbps',
      status: 'excellent',
      trend: 'stable',
      icon: Wifi,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-600',
      details: 'Ethernet Gigabit - Latência 2ms'
    }
  ];

  const serviceStatus = [
    {
      name: 'RepoMed API',
      status: 'online',
      port: '8085',
      uptime: '15d 4h 32m',
      requests: '12.5k/h',
      icon: Server
    },
    {
      name: 'Web Frontend',
      status: 'online',
      port: '3009',
      uptime: '15d 4h 30m',
      requests: '8.2k/h',
      icon: Globe
    },
    {
      name: 'Database',
      status: 'online',
      port: '5432',
      uptime: '21d 12h 15m',
      requests: '3.1k/h',
      icon: Database
    },
    {
      name: 'Node-RED',
      status: 'online',
      port: '1880',
      uptime: '12d 8h 45m',
      requests: '520/h',
      icon: Activity
    },
    {
      name: 'Auth Service',
      status: 'warning',
      port: '3001',
      uptime: '2h 15m',
      requests: '1.8k/h',
      icon: Shield
    },
    {
      name: 'File Service',
      status: 'online',
      port: '3002',
      uptime: '15d 4h 28m',
      requests: '450/h',
      icon: FileText
    }
  ];

  const recentLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:35:22',
      level: 'info',
      service: 'repomed-api',
      message: 'Usuario autenticado com sucesso: dr.silva@repomed.com.br',
      details: 'JWT token gerado e enviado'
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:34:18',
      level: 'warning',
      service: 'auth-service',
      message: 'Tentativa de login com senha incorreta',
      details: 'IP: 192.168.1.105 - 3 tentativas'
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:33:45',
      level: 'info',
      service: 'database',
      message: 'Backup automatico concluido com sucesso',
      details: 'Tamanho: 127MB - Tempo: 45s'
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:32:12',
      level: 'error',
      service: 'node-red',
      message: 'Falha na conexao com API externa',
      details: 'Timeout apos 30s - Endpoint: /api/cep'
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:31:07',
      level: 'info',
      service: 'web-frontend',
      message: 'Cache de assets atualizado',
      details: '245 arquivos processados'
    },
    {
      id: 6,
      timestamp: '2024-01-15 14:30:33',
      level: 'info',
      service: 'repomed-api',
      message: 'Novo paciente cadastrado',
      details: 'ID: #P2024-0847 - Dr. João Silva'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'error': return 'bg-red-600';
      case 'offline': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-900/20 border-red-600/30';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
      case 'info': return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
      default: return 'text-slate-400 bg-slate-900/20 border-slate-600/30';
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'info': return CheckCircle;
      default: return Activity;
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/sistema" inline />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">📊 Monitoramento</h1>
              <p className="text-slate-400">Sistema de monitoramento em tempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={performRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              Configurar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
          {[
            { id: 'overview', name: 'Visão Geral', icon: Activity },
            { id: 'services', name: 'Serviços', icon: Server },
            { id: 'logs', name: 'Logs', icon: FileText },
            { id: 'alerts', name: 'Alertas', icon: AlertTriangle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemMetrics.map((metric, index) => {
              const TrendIcon = getTrendIcon(metric.trend);
              return (
                <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:scale-105 duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${metric.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendIcon className={`w-4 h-4 ${getTrendColor(metric.trend)}`} />
                      <span className={`text-xs px-2 py-1 rounded-full ${metric.status === 'excellent' ? 'bg-green-600' : metric.status === 'normal' ? 'bg-blue-600' : 'bg-yellow-600'} text-white`}>
                        {metric.status}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-slate-400 text-sm font-medium mb-1">{metric.name}</h3>
                  <p className="text-2xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">{metric.value}</p>
                  <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">{metric.details}</p>
                </div>
              );
            })}
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">Performance das Últimas 24 Horas</h3>
            <div className="relative h-64 bg-slate-900 rounded-lg p-4">
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
                {Array.from({length: 24}, (_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-2 bg-gradient-to-t from-blue-600 via-purple-500 to-green-400 rounded-t-sm mb-2"
                      style={{ height: `${Math.random() * 120 + 40}px` }}
                    />
                    <span className="text-slate-500 text-xs">{i}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceStatus.map((service, index) => (
              <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:scale-105 duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <service.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-blue-200 transition-colors">{service.name}</h4>
                      <p className="text-sm text-slate-400">Port: {service.port}</p>
                    </div>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`}></span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Uptime:</span>
                    <span className="text-white text-sm">{service.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Requests:</span>
                    <span className="text-white text-sm">{service.requests}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar nos logs..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {/* Logs List */}
          <div className="bg-slate-800 rounded-xl border border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Logs do Sistema</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentLogs.map((log) => {
                  const LogIcon = getLogIcon(log.level);
                  return (
                    <div key={log.id} className={`flex items-start gap-3 p-4 rounded-lg border ${getLogLevelColor(log.level)} hover:bg-opacity-30 transition-colors group`}>
                      <div className="flex-shrink-0 mt-1">
                        <LogIcon className={`w-4 h-4 ${log.level === 'error' ? 'text-red-400' : log.level === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">{log.timestamp}</span>
                          <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded">{log.service}</span>
                        </div>
                        <p className="text-sm text-white group-hover:text-blue-200 transition-colors mb-1">{log.message}</p>
                        <p className="text-xs text-slate-500">{log.details}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">Alertas Ativos</h3>
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-white font-medium mb-2">Nenhum alerta ativo</h4>
              <p className="text-slate-400">Todos os sistemas estão funcionando normalmente</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
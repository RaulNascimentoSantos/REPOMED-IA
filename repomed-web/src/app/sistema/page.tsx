'use client';


import BackButton from '@/app/components/BackButton';
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Server,
  Database,
  GitBranch,
  Zap,
  FileCode,
  Globe,
  BarChart3,
  Settings,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function SistemaPage() {
  const router = useRouter();

  const systemModules = [
    {
      id: 'kanban',
      name: 'Kanban Pipeline',
      description: 'Sistema de gerenciamento visual com automação AI',
      icon: GitBranch,
      href: '/kanban',
      status: 'online',
      color: 'bg-purple-600'
    },
    {
      id: 'urls',
      name: 'URLs Dashboard',
      description: 'Central de URLs alimentada automaticamente via Node-RED',
      icon: Globe,
      href: '/urls',
      status: 'online',
      color: 'bg-blue-600'
    },
    {
      id: 'monitor',
      name: 'Monitoramento',
      description: 'Sistema de monitoramento de performance e logs',
      icon: Monitor,
      href: '/sistema/monitor',
      status: 'online',
      color: 'bg-green-600'
    },
    {
      id: 'database',
      name: 'Banco de Dados',
      description: 'Gestão e monitoramento do banco de dados',
      icon: Database,
      href: '/sistema/database',
      status: 'online',
      color: 'bg-orange-600'
    },
    {
      id: 'api',
      name: 'APIs',
      description: 'Documentação e teste das APIs do sistema',
      icon: FileCode,
      href: '/sistema/api',
      status: 'online',
      color: 'bg-indigo-600'
    },
    {
      id: 'security',
      name: 'Segurança',
      description: 'Logs de segurança e controle de acesso',
      icon: Shield,
      href: '/sistema/security',
      status: 'online',
      color: 'bg-red-600'
    }
  ];

  const systemStats = [
    {
      label: 'CPU Usage',
      value: '45%',
      icon: Cpu,
      color: 'text-green-500',
      trend: 'stable'
    },
    {
      label: 'Memory',
      value: '2.8GB / 8GB',
      icon: HardDrive,
      color: 'text-blue-500',
      trend: 'up'
    },
    {
      label: 'Network',
      value: '125 Mbps',
      icon: Wifi,
      color: 'text-purple-500',
      trend: 'stable'
    },
    {
      label: 'Uptime',
      value: '15d 4h 32m',
      icon: Clock,
      color: 'text-orange-500',
      trend: 'up'
    }
  ];

  const recentLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:30:25',
      level: 'info',
      message: 'Sistema de backup executado com sucesso',
      service: 'backup-service'
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:25:12',
      level: 'warning',
      message: 'Alta utilização de CPU detectada',
      service: 'monitor'
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:20:08',
      level: 'info',
      message: 'Novo usuário autenticado: dr.silva@repomed.com.br',
      service: 'auth-service'
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:15:45',
      level: 'error',
      message: 'Falha na conexão com API externa',
      service: 'external-api'
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:10:33',
      level: 'info',
      message: 'Cache limpo automaticamente',
      service: 'cache-service'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'offline': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-slate-400';
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
    <>
      <BackButton href="/" />
      <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🔧 Sistema</h1>
        <p className="text-slate-400">Monitoramento e gestão do sistema RepoMed IA</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemStats.map((stat, index) => (
          <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:scale-105 duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-600' : stat.trend === 'down' ? 'bg-red-600' : 'bg-gray-600'} text-white`}>
                {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : '→'}
              </span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Modules */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Módulos do Sistema</h2>
          </div>

          <div className="space-y-4">
            {systemModules.map((module) => (
              <div
                key={module.id}
                onClick={() => router.push(module.href)}
                className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all transform hover:scale-105 duration-300 cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <module.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-blue-200 transition-colors">{module.name}</h3>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{module.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(module.status)}`}></span>
                  <span className="text-xs text-slate-400 capitalize">{module.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">Logs Recentes</h2>
            </div>
            <button
              onClick={() => router.push('/sistema/monitor')}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Ver todos →
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentLogs.map((log) => {
              const LogIcon = getLogIcon(log.level);
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors group">
                  <div className="flex-shrink-0 mt-1">
                    <LogIcon className={`w-4 h-4 ${getLogLevelColor(log.level)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">{log.timestamp}</span>
                      <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded">{log.service}</span>
                    </div>
                    <p className="text-sm text-white group-hover:text-blue-200 transition-colors">{log.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => router.push('/sistema/monitor')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 duration-200 flex items-center justify-center gap-3"
        >
          <Monitor className="w-5 h-5" />
          Monitoramento Avançado
        </button>

        <button
          onClick={() => router.push('/relatorios')}
          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 duration-200 flex items-center justify-center gap-3"
        >
          <BarChart3 className="w-5 h-5" />
          Relatórios do Sistema
        </button>

        <button
          onClick={() => router.push('/configuracoes')}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 duration-200 flex items-center justify-center gap-3"
        >
          <Settings className="w-5 h-5" />
          Configurações
        </button>
      </div>
      </div>
    </>
  );
}
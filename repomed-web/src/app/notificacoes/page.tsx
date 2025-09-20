'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Heart,
  Activity,
  Mail,
  Phone,
  Settings,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Trash,
  Archive,
  Star,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function NotificacoesPage() {
  const [filter, setFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  const notificacoes = [
    {
      id: 1,
      tipo: 'urgente',
      titulo: 'Paciente em Estado Crítico',
      mensagem: 'João Silva apresenta pressão arterial 180/110. Requer atenção imediata.',
      tempo: '5 min atrás',
      lida: false,
      categoria: 'Emergência',
      paciente: 'João Silva',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-600/30'
    },
    {
      id: 2,
      tipo: 'consulta',
      titulo: 'Consulta Agendada',
      mensagem: 'Maria Santos agendou consulta para hoje às 14:30.',
      tempo: '15 min atrás',
      lida: false,
      categoria: 'Agendamento',
      paciente: 'Maria Santos',
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-600/30'
    },
    {
      id: 3,
      tipo: 'exame',
      titulo: 'Resultado de Exame Disponível',
      mensagem: 'Hemograma completo de Ana Costa já está disponível.',
      tempo: '1 hora atrás',
      lida: true,
      categoria: 'Exames',
      paciente: 'Ana Costa',
      icon: FileText,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-600/30'
    },
    {
      id: 4,
      tipo: 'medicamento',
      titulo: 'Medicação Vencendo',
      mensagem: 'Prescrição de Carlos Lima vence em 2 dias.',
      tempo: '2 horas atrás',
      lida: true,
      categoria: 'Medicamentos',
      paciente: 'Carlos Lima',
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-600/30'
    },
    {
      id: 5,
      tipo: 'sistema',
      titulo: 'Backup Concluído',
      mensagem: 'Backup automático dos dados foi realizado com sucesso.',
      tempo: '3 horas atrás',
      lida: true,
      categoria: 'Sistema',
      paciente: null,
      icon: CheckCircle,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-600/30'
    },
    {
      id: 6,
      tipo: 'lembrete',
      titulo: 'Reunião de Equipe',
      mensagem: 'Reunião semanal da equipe médica em 30 minutos.',
      tempo: '30 min atrás',
      lida: false,
      categoria: 'Lembretes',
      paciente: null,
      icon: User,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-600/30'
    }
  ];

  const stats = {
    total: notificacoes.length,
    naoLidas: notificacoes.filter(n => !n.lida).length,
    urgentes: notificacoes.filter(n => n.tipo === 'urgente').length,
    hoje: notificacoes.length
  };

  const filteredNotificacoes = notificacoes.filter(notif => {
    const matchesSearch = notif.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.mensagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notif.paciente && notif.paciente.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filter === 'todas') return matchesSearch;
    if (filter === 'nao-lidas') return matchesSearch && !notif.lida;
    if (filter === 'urgentes') return matchesSearch && notif.tipo === 'urgente';
    if (filter === 'sistema') return matchesSearch && notif.tipo === 'sistema';

    return matchesSearch;
  });

  const handleMarkAsRead = (id) => {
    // Aqui marcaria como lida
    console.log('Marcar como lida:', id);
  };

  const handleDelete = (id) => {
    // Aqui deletaria a notificação
    console.log('Deletar:', id);
  };

  return (
    <>
      <BackButton href="/" />
      <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Notificações</h1>
          <p className="text-slate-400">Central de alertas e notificações</p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 hover:scale-105 text-white rounded-lg transition-all duration-300">
            <Settings className="w-4 h-4" />
            <span>Configurar</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transform hover:scale-105 transition-all duration-300 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm group-hover:text-blue-300 transition-colors">Total</p>
              <p className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors">{stats.total}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10 transform hover:scale-105 transition-all duration-300 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm group-hover:text-yellow-300 transition-colors">Não Lidas</p>
              <p className="text-2xl font-bold text-white group-hover:text-yellow-100 transition-colors">{stats.naoLidas}</p>
            </div>
            <Eye className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10 transform hover:scale-105 transition-all duration-300 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm group-hover:text-red-300 transition-colors">Urgentes</p>
              <p className="text-2xl font-bold text-white group-hover:text-red-100 transition-colors">{stats.urgentes}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transform hover:scale-105 transition-all duration-300 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm group-hover:text-green-300 transition-colors">Hoje</p>
              <p className="text-2xl font-bold text-white group-hover:text-green-100 transition-colors">{stats.hoje}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
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
              placeholder="Buscar notificações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 transition-all"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="todas">Todas</option>
            <option value="nao-lidas">Não Lidas</option>
            <option value="urgentes">Urgentes</option>
            <option value="sistema">Sistema</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 bg-slate-800 hover:bg-slate-700 hover:scale-110 rounded-lg transition-all duration-300">
            <Filter className="w-4 h-4 text-slate-400" />
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white rounded-lg transition-all duration-300">
            <span>Marcar Todas como Lidas</span>
          </button>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-4">
        {filteredNotificacoes.map((notificacao) => {
          const Icon = notificacao.icon;

          return (
            <div
              key={notificacao.id}
              className={`${notificacao.bgColor} rounded-xl p-6 border ${notificacao.borderColor} hover:scale-105 transition-all duration-300 group ${
                !notificacao.lida ? 'ring-2 ring-blue-500/20' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-12 h-12 ${notificacao.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${notificacao.color}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-white font-semibold group-hover:text-blue-200 transition-colors">{notificacao.titulo}</h3>
                      {!notificacao.lida && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      )}
                      <span className={`px-2 py-1 ${notificacao.bgColor} ${notificacao.color} text-xs rounded-full border ${notificacao.borderColor}`}>
                        {notificacao.categoria}
                      </span>
                    </div>

                    <p className="text-slate-300 mb-3 group-hover:text-slate-200 transition-colors">{notificacao.mensagem}</p>

                    <div className="flex items-center space-x-4 text-slate-400 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{notificacao.tempo}</span>
                      </div>
                      {notificacao.paciente && (
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{notificacao.paciente}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center space-x-2 ml-4">
                  {!notificacao.lida && (
                    <button
                      onClick={() => handleMarkAsRead(notificacao.id)}
                      className="p-2 bg-slate-700 hover:bg-blue-600 hover:scale-110 text-white rounded-lg transition-all duration-300 group"
                    >
                      <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  )}

                  <button className="p-2 bg-slate-700 hover:bg-green-600 hover:scale-110 text-white rounded-lg transition-all duration-300 group">
                    <Star className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>

                  <button className="p-2 bg-slate-700 hover:bg-yellow-600 hover:scale-110 text-white rounded-lg transition-all duration-300 group">
                    <Archive className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>

                  <button
                    onClick={() => handleDelete(notificacao.id)}
                    className="p-2 bg-slate-700 hover:bg-red-600 hover:scale-110 text-white rounded-lg transition-all duration-300 group"
                  >
                    <Trash className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>

                  <button className="p-2 bg-slate-700 hover:bg-slate-600 hover:scale-110 text-white rounded-lg transition-all duration-300 group">
                    <MoreVertical className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configurações de Notificações */}
      <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
        <h3 className="text-lg font-semibold text-white mb-4">Configurações de Notificação</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Tipos de Notificação</h4>
            {[
              { label: 'Emergências Médicas', icon: AlertTriangle, enabled: true },
              { label: 'Agendamentos', icon: Calendar, enabled: true },
              { label: 'Resultados de Exames', icon: FileText, enabled: true },
              { label: 'Lembretes de Medicação', icon: Clock, enabled: false },
              { label: 'Notificações do Sistema', icon: Settings, enabled: true }
            ].map((config, index) => {
              const Icon = config.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                    <span className="text-white group-hover:text-blue-200 transition-colors">{config.label}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={config.enabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-medium">Métodos de Entrega</h4>
            {[
              { label: 'Notificações Push', icon: Bell, enabled: true },
              { label: 'Email', icon: Mail, enabled: true },
              { label: 'SMS', icon: Phone, enabled: false },
              { label: 'Sons de Alerta', icon: Volume2, enabled: true }
            ].map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                    <span className="text-white group-hover:text-blue-200 transition-colors">{method.label}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
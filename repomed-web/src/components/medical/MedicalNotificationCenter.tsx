'use client';

/**
 * RepoMed IA v6.0 - Centro de Notificações Médicas Inteligentes
 *
 * Sistema avançado de notificações contextuais para medicina com:
 * - Priorização automática baseada em criticidade médica
 * - Alertas de segurança e conformidade regulatória
 * - Integração com workflows clínicos
 * - Suporte a acessibilidade WCAG AA
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Heart,
  FileText,
  Users,
  Settings,
  X
} from 'lucide-react';
import { useFeatureFlag } from '@/components/providers/FeatureFlagProvider';

interface MedicalNotification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'patient' | 'prescription' | 'regulatory' | 'system' | 'safety';
  title: string;
  message: string;
  timestamp: Date;
  actionRequired?: boolean;
  relatedPatient?: string;
  crmReference?: string;
  read: boolean;
  priority: 1 | 2 | 3 | 4 | 5; // 1 = mais crítico
}

const MOCK_NOTIFICATIONS: MedicalNotification[] = [
  {
    id: '1',
    type: 'critical',
    category: 'safety',
    title: 'Interação Medicamentosa Crítica',
    message: 'Paciente Maria Silva: Possível interação entre Varfarina e Amoxicilina. Revisar prescrição urgentemente.',
    timestamp: new Date(Date.now() - 5 * 60000), // 5 min atrás
    actionRequired: true,
    relatedPatient: 'Maria Silva - CPF: ***123.456',
    crmReference: 'CRM SP 123456',
    read: false,
    priority: 1
  },
  {
    id: '2',
    type: 'warning',
    category: 'regulatory',
    title: 'Assinatura Digital Expirando',
    message: 'Seu certificado ICP-Brasil expira em 15 dias. Renove para manter validade jurídica dos documentos.',
    timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2h atrás
    actionRequired: true,
    read: false,
    priority: 2
  },
  {
    id: '3',
    type: 'info',
    category: 'system',
    title: 'Backup Automático Concluído',
    message: 'Backup diário dos dados clínicos realizado com sucesso às 03:00.',
    timestamp: new Date(Date.now() - 6 * 60 * 60000), // 6h atrás
    read: true,
    priority: 4
  }
];

export default function MedicalNotificationCenter() {
  const [notifications, setNotifications] = useState<MedicalNotification[]>(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const aiSuggestions = useFeatureFlag('FF_AI_SUGGESTIONS');

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.type === 'critical' && !n.read).length;

  const getIcon = (category: MedicalNotification['category']) => {
    const iconMap = {
      patient: Heart,
      prescription: FileText,
      regulatory: Shield,
      system: Settings,
      safety: AlertTriangle
    };
    return iconMap[category];
  };

  const getTypeColor = (type: MedicalNotification['type']) => {
    const colorMap = {
      critical: 'bg-red-50 border-red-200 text-red-900',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      info: 'bg-blue-50 border-blue-200 text-blue-900',
      success: 'bg-green-50 border-green-200 text-green-900'
    };
    return colorMap[type];
  };

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) return 'bg-red-600 text-white';
    if (priority === 2) return 'bg-orange-500 text-white';
    if (priority === 3) return 'bg-yellow-500 text-white';
    return 'bg-gray-400 text-white';
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return 'Agora';
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'critical') return n.type === 'critical';
    return true;
  }).sort((a, b) => a.priority - b.priority);

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        aria-label={`${unreadCount} notificações não lidas`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[1.25rem] h-5 text-xs font-medium rounded-full flex items-center justify-center ${
            criticalCount > 0 ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificações Médicas
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filters */}
              <div className="flex space-x-1 mt-3">
                {(['all', 'unread', 'critical'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filter === filterType
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {filterType === 'all' ? 'Todas' :
                     filterType === 'unread' ? 'Não lidas' : 'Críticas'}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>Nenhuma notificação encontrada</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const IconComponent = getIcon(notification.category);

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            {notification.priority <= 2 && (
                              <span className={`px-1.5 py-0.5 text-xs rounded-full ${getPriorityBadge(notification.priority)}`}>
                                {notification.priority === 1 ? 'URGENTE' : 'ALTA'}
                              </span>
                            )}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>

                          {notification.relatedPatient && (
                            <p className="text-xs text-gray-500 mb-1">
                              📋 {notification.relatedPatient}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimeAgo(notification.timestamp)}
                            </span>

                            {notification.actionRequired && (
                              <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full hover:bg-red-200 transition-colors">
                                Ação Necessária
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {aiSuggestions && (
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-600 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Sistema IA monitora automaticamente interações e alertas regulatórios
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
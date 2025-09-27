'use client';

/**
 * 🏥 Medical Dashboard 2025 - Premium Medical Interface
 * Enterprise-grade dashboard for healthcare professionals
 * Optimized for medical workflows and senior doctors
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { isFeatureEnabled } from '@/config/feature-flags';
import { HomeProV9 } from '../home-pro/HomeProV9';
import {
  Activity,
  Users,
  FileText,
  Heart,
  TrendingUp,
  Clock,
  Shield,
  Brain,
  Stethoscope,
  Pill,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  Award,
  Bell,
  Star,
  BarChart3
} from 'lucide-react';

interface MedicalStats {
  patientsToday: number;
  documentsGenerated: number;
  emergencyAlerts: number;
  completionRate: number;
  averageTime: string;
  aiInsights: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  route: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  badge?: string;
}

interface MedicalAlert {
  id: string;
  type: 'emergency' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  actionRequired: boolean;
}

export default function MedicalDashboard2025() {
  const router = useRouter();
  const { theme, isDarkMode, isMedicalTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState<MedicalStats>({
    patientsToday: 23,
    documentsGenerated: 45,
    emergencyAlerts: 2,
    completionRate: 94,
    averageTime: '2.3 min',
    aiInsights: 12
  });

  const [alerts, setAlerts] = useState<MedicalAlert[]>([
    {
      id: '1',
      type: 'emergency',
      title: 'Paciente Crítico',
      message: 'João Silva - Pressão arterial elevada detectada',
      time: '2 min',
      actionRequired: true
    },
    {
      id: '2',
      type: 'warning',
      title: 'Receita Pendente',
      message: '3 prescrições aguardando assinatura digital',
      time: '5 min',
      actionRequired: true
    },
    {
      id: '3',
      type: 'info',
      title: 'IA Insight',
      message: 'Padrão detectado: aumento de casos respiratórios',
      time: '10 min',
      actionRequired: false
    }
  ]);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: 'emergency-prescription',
      title: 'Receita de Emergência',
      description: 'Gerar prescrição urgente com validação IA',
      icon: Pill,
      color: 'medical-btn-danger',
      route: '/prescricoes/emergency',
      priority: 'critical',
      badge: 'URGENTE'
    },
    {
      id: 'new-patient',
      title: 'Novo Paciente',
      description: 'Cadastro completo com IA assistida',
      icon: Users,
      color: 'medical-btn-primary',
      route: '/pacientes/novo',
      priority: 'high'
    },
    {
      id: 'ai-diagnosis',
      title: 'Diagnóstico IA',
      description: 'Assistente de diagnóstico inteligente',
      icon: Brain,
      color: 'medical-btn-success',
      route: '/diagnostico/ia',
      priority: 'high',
      badge: 'IA'
    },
    {
      id: 'telemedicine',
      title: 'Teleconsulta',
      description: 'Iniciar consulta virtual segura',
      icon: Calendar,
      color: 'medical-btn-primary',
      route: '/telemedicina/nova',
      priority: 'medium'
    },
    {
      id: 'medical-cert',
      title: 'Atestado Médico',
      description: 'Geração automática com validade jurídica',
      icon: Shield,
      color: 'medical-btn-secondary',
      route: '/documentos/criar/atestado',
      priority: 'medium'
    },
    {
      id: 'reports',
      title: 'Relatórios IA',
      description: 'Análises inteligentes e insights médicos',
      icon: BarChart3,
      color: 'medical-btn-secondary',
      route: '/relatorios/ia',
      priority: 'low'
    }
  ];

  const handleQuickAction = (action: QuickAction) => {
    try {
      console.log(`[MedicalDashboard] Ação rápida: ${action.title}`);

      // Enhanced navigation with safety checks
      if (isClient && router && router.push) {
        router.push(action.route);
      } else if (typeof window !== 'undefined') {
        window.location.href = action.route;
      }
    } catch (error) {
      console.error('[MedicalDashboard] Erro na navegação:', error);
      // Fallback navigation
      if (typeof window !== 'undefined') {
        window.location.href = action.route;
      }
    }
  };

  const handleAlertAction = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get dynamic card styling based on theme
  const getCardClasses = () => {
    if (isMedicalTheme) {
      return 'medical-card';
    }
    if (isDarkMode) {
      return 'bg-slate-800 border border-slate-700';
    }
    return 'bg-white/80 backdrop-blur-lg border border-white/20';
  };

  // Get dynamic background based on theme
  const getBackgroundClasses = () => {
    if (isMedicalTheme) {
      return 'medical-bg-primary';
    }
    if (isDarkMode) {
      return 'bg-slate-900';
    }
    return 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50';
  };

  // Get dynamic text colors based on theme
  const getTitleClasses = () => {
    if (isMedicalTheme) {
      return 'medical-title';
    }
    if (isDarkMode) {
      return 'text-white';
    }
    return 'text-slate-800';
  };

  const getTextClasses = () => {
    if (isMedicalTheme) {
      return 'medical-text';
    }
    if (isDarkMode) {
      return 'text-slate-300';
    }
    return 'text-slate-600';
  };

  // Check if Home PRO V9 is enabled
  if (isFeatureEnabled('FF_HOME_PRO_V9')) {
    return <HomeProV9 className={`min-h-screen p-4 lg:p-6 ${getBackgroundClasses()} hx-bg`} />;
  }

  return (
    <div className={`min-h-screen p-4 lg:p-6 ${getBackgroundClasses()} hx-bg`}>
      {/* Header Section Premium */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h1 className={`text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight hx-title ${
                isMedicalTheme ? 'text-white drop-shadow-lg' :
                isDarkMode ? 'text-white drop-shadow-lg' : 'text-slate-900'
              }`}>
                🏥 RepoMed IA
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  v6.0 Pro
                </span>
                <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full font-medium">
                  Enterprise
                </span>
              </div>
            </div>
            <div className={`text-lg font-medium ${getTextClasses()}`}>
              <p className="mb-1">
                Bom dia, <span className={`font-bold ${
                  isMedicalTheme ? 'text-blue-300' :
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}>Dr. João Silva</span> • <span className="font-mono">CRM SP 123456</span>
              </p>
              <div className={`text-sm flex items-center gap-2 ${
                isMedicalTheme ? 'text-slate-300' :
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <span>{formatDate(currentTime)}</span>
                <span>•</span>
                <span>{formatTime(currentTime)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
                  Sistema online e operacional
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto justify-center lg:justify-end">
            <div className={`rounded-2xl p-3 lg:p-4 shadow-xl ${getCardClasses()} hx-card`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className={`text-xs ${getTextClasses()}`}>Status do Sistema</p>
                  <p className="font-semibold text-emerald-600">🟢 Totalmente Operacional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Alerts Premium */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${getTitleClasses()}`}>
            <Bell className="w-5 h-5" />
            Alertas Médicos
            <span className="text-sm bg-red-500 text-white px-2 py-1 rounded-full font-medium">{alerts.length}</span>
          </h2>
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-2xl p-6 shadow-xl flex items-center justify-between ${getCardClasses()} hx-alert ${
                  alert.type === 'emergency' ? 'border-red-200 bg-red-50/50' :
                  alert.type === 'warning' ? 'border-orange-200 bg-orange-50/50' :
                  alert.type === 'success' ? 'border-green-200 bg-green-50/50' :
                  'border-blue-200 bg-blue-50/50'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold ${getTitleClasses()}`}>{alert.title}</h3>
                    {alert.actionRequired && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">AÇÃO NECESSÁRIA</span>
                    )}
                  </div>
                  <p className={getTextClasses()}>{alert.message}</p>
                  <p className={`text-xs mt-1 ${getTextClasses()}`}>Há {alert.time}</p>
                </div>
                <button
                  onClick={() => handleAlertAction(alert.id)}
                  className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Resolver
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Overview Premium */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${getTitleClasses()}`}>
          <Activity className="w-5 h-5" />
          Estatísticas Médicas - Hoje
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${getCardClasses()} hx-stat`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Hoje</span>
            </div>
            <div className={`text-3xl font-bold mb-1 ${getTitleClasses()}`}>{stats.patientsToday}</div>
            <div className={`text-sm mb-2 ${getTextClasses()}`}>Pacientes Atendidos</div>
            <div className="flex items-center text-xs text-green-600 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15% vs ontem
            </div>
          </div>

          <div className={`rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${getCardClasses()} hx-stat`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Produção</span>
            </div>
            <div className={`text-3xl font-bold mb-1 ${getTitleClasses()}`}>{stats.documentsGenerated}</div>
            <div className={`text-sm mb-2 ${getTextClasses()}`}>Documentos Gerados</div>
            <div className="flex items-center text-xs text-green-600 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8% vs semana passada
            </div>
          </div>

          <div className={`rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${getCardClasses()} hx-stat`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Meta</span>
            </div>
            <div className={`text-3xl font-bold mb-1 ${getTitleClasses()}`}>{stats.completionRate}%</div>
            <div className={`text-sm mb-2 ${getTextClasses()}`}>Taxa de Conclusão</div>
            <div className="flex items-center text-xs text-green-600 font-medium">
              <Target className="w-3 h-3 mr-1" />
              Meta: 95%
            </div>
          </div>

          <div className={`rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${getCardClasses()} hx-stat`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">IA</span>
            </div>
            <div className={`text-3xl font-bold mb-1 ${getTitleClasses()}`}>{stats.averageTime}</div>
            <div className={`text-sm mb-2 ${getTextClasses()}`}>Tempo Médio/Documento</div>
            <div className="flex items-center text-xs text-green-600 font-medium">
              <Zap className="w-3 h-3 mr-1" />
              -40% com IA
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Medical Workflow Premium */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${getTitleClasses()}`}>
          <Zap className="w-5 h-5" />
          Ações Rápidas Médicas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <div
              key={action.id}
              onClick={() => handleQuickAction(action)}
              className={`rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group ${getCardClasses()} hx-card`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  action.priority === 'critical' ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' :
                  action.priority === 'high' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' :
                  action.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white' :
                  'bg-gradient-to-r from-gray-500 to-slate-600 text-white'
                }`}>
                  <action.icon className="w-6 h-6" />
                </div>
                {action.badge && (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    action.badge === 'URGENTE' ? 'bg-red-100 text-red-700 border border-red-200' :
                    action.badge === 'IA' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {action.badge}
                  </span>
                )}
              </div>

              <h3 className={`text-lg font-bold mb-2 ${getTitleClasses()}`}>{action.title}</h3>
              <p className={`mb-4 text-sm ${getTextClasses()}`}>{action.description}</p>

              <button className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hx-btn ${
                action.priority === 'critical' ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700' :
                action.priority === 'high' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700' :
                action.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700' :
                'bg-gradient-to-r from-gray-500 to-slate-600 text-white hover:from-gray-600 hover:to-slate-700'
              }`}>
                Acessar
                {action.priority === 'critical' && <AlertTriangle className="w-4 h-4" />}
                {action.priority === 'high' && <Star className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights Section Premium */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${getTitleClasses()}`}>
          <Brain className="w-5 h-5" />
          Insights Médicos IA
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium border border-blue-200">{stats.aiInsights} Novos</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 ${getCardClasses()}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${getTitleClasses()}`}>Padrão Epidemiológico</h3>
                <p className={`text-sm ${getTextClasses()}`}>Detectado pela IA</p>
              </div>
            </div>
            <p className={`mb-4 ${getTextClasses()}`}>
              Aumento de 23% em casos respiratórios nos últimos 7 dias.
              Recomenda-se atenção especial para sintomas de gripe.
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700">
              Ver Detalhes
            </button>
          </div>

          <div className={`rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-green-50/50 to-emerald-50/50 ${getCardClasses()}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${getTitleClasses()}`}>Eficiência Médica</h3>
                <p className={`text-sm ${getTextClasses()}`}>Relatório semanal</p>
              </div>
            </div>
            <p className={`mb-4 ${getTextClasses()}`}>
              Sua produtividade aumentou 40% com o uso da IA.
              Tempo médio por consulta: 12 min (vs 20 min média nacional).
            </p>
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700">
              Ver Relatório
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Premium */}
      <div>
        <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${getTitleClasses()}`}>
          <Clock className="w-5 h-5" />
          Atividade Recente
        </h2>
        <div className={`rounded-2xl p-6 shadow-xl ${getCardClasses()}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50/80 border border-green-200 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${getTitleClasses()}`}>Receita médica gerada com sucesso</p>
                <p className={`text-sm ${getTextClasses()}`}>Paciente: Maria Silva - Há 5 min</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50/80 border border-blue-200 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${getTitleClasses()}`}>Novo paciente cadastrado</p>
                <p className={`text-sm ${getTextClasses()}`}>Pedro Santos - Há 12 min</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-yellow-50/80 border border-yellow-200 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${getTitleClasses()}`}>IA sugeriu diagnóstico alternativo</p>
                <p className={`text-sm ${getTextClasses()}`}>Consulta #1247 - Há 18 min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
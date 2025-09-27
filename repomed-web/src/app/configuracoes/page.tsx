'use client';

import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Globe,
  Download,
  Upload,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Lock,
  Mail,
  Phone,
  Calendar,
  Clock,
  Monitor,
  Smartphone,
  Users,
  FileText
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    consultas: true,
    documentos: false,
    alertas: true
  });

  interface NotificationItem {
    key: keyof typeof notifications;
    label: string;
    icon: any;
  }

  const { theme, setTheme, fontSize, setFontSize, language, setLanguage } = useTheme();

  const tabsConfig = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'sistema', label: 'Sistema', icon: Database },
    { id: 'integracao', label: 'Integração', icon: Globe },
    { id: 'backup', label: 'Backup', icon: Download }
  ];

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Configurações</h1>
              <p className="text-slate-400">Gerencie as configurações do sistema</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Redefinir</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Save className="w-4 h-4" />
            <span>Salvar Tudo</span>
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar de Navegação */}
        <aside className="w-64 bg-slate-800 rounded-xl p-4 border border-slate-700 h-fit">
          <div className="space-y-2">
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1">
          {/* Tab Perfil */}
          {activeTab === 'perfil' && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-6">Informações do Perfil</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Nome Completo</label>
                  <input
                    type="text"
                    defaultValue="Dr. João Silva"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="dr.silva@repomed.com.br"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">CRM</label>
                  <input
                    type="text"
                    defaultValue="CRM SP 123456"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Especialidade</label>
                  <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Clínica Geral</option>
                    <option>Cardiologia</option>
                    <option>Neurologia</option>
                    <option>Pediatria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Telefone</label>
                  <input
                    type="tel"
                    defaultValue="(11) 99999-9999"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Endereço</label>
                  <input
                    type="text"
                    defaultValue="São Paulo, SP"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-slate-400 text-sm font-medium mb-2">Bio</label>
                <textarea
                  rows={4}
                  defaultValue="Médico especialista em clínica geral com mais de 10 anos de experiência."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Tab Segurança */}
          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-6">Segurança da Conta</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Senha Atual</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Nova Senha</label>
                    <input
                      type="password"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Confirmar Nova Senha</label>
                    <input
                      type="password"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Lock className="w-4 h-4" />
                  <span>Alterar Senha</span>
                </button>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Autenticação de Dois Fatores</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Habilitar 2FA</p>
                    <p className="text-slate-400 text-sm">Adicione uma camada extra de segurança</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab Notificações */}
          {activeTab === 'notificacoes' && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-6">Preferências de Notificação</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Canais de Notificação</h3>
                  <div className="space-y-4">
                    {([
                      { key: 'email', label: 'Notificações por Email', icon: Mail },
                      { key: 'sms', label: 'Notificações por SMS', icon: Phone },
                      { key: 'push', label: 'Notificações Push', icon: Bell }
                    ] as NotificationItem[]).map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.key} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5 text-slate-400" />
                            <span className="text-white">{item.label}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[item.key]}
                              onChange={() => handleNotificationChange(item.key)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Tipos de Notificação</h3>
                  <div className="space-y-4">
                    {([
                      { key: 'consultas', label: 'Lembretes de Consulta', icon: Calendar },
                      { key: 'documentos', label: 'Novos Documentos', icon: FileText },
                      { key: 'alertas', label: 'Alertas Críticos', icon: AlertTriangle }
                    ] as NotificationItem[]).map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.key} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5 text-slate-400" />
                            <span className="text-white">{item.label}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[item.key]}
                              onChange={() => handleNotificationChange(item.key)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Aparência */}
          {activeTab === 'aparencia' && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-6">Configurações de Aparência</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Tema</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    <div
                      onClick={() => setTheme('dark')}
                      className={`p-4 bg-slate-700 rounded-lg border-2 cursor-pointer transition-all ${
                        theme === 'dark' ? 'border-blue-500' : 'border-transparent hover:border-slate-500'
                      }`}
                    >
                      <div className="w-full h-16 bg-slate-900 rounded mb-2"></div>
                      <p className="text-white text-sm text-center">Escuro</p>
                    </div>
                    <div
                      onClick={() => setTheme('light')}
                      className={`p-4 bg-slate-700 rounded-lg border-2 cursor-pointer transition-all ${
                        theme === 'light' ? 'border-blue-500' : 'border-transparent hover:border-slate-500'
                      }`}
                    >
                      <div className="w-full h-16 bg-white rounded mb-2"></div>
                      <p className="text-white text-sm text-center">Claro</p>
                    </div>
                    <div
                      onClick={() => setTheme('medical')}
                      className={`p-4 bg-slate-700 rounded-lg border-2 cursor-pointer transition-all ${
                        theme === 'medical' ? 'border-blue-500' : 'border-transparent hover:border-slate-500'
                      }`}
                    >
                      <div className="w-full h-16 bg-slate-50 rounded mb-2"></div>
                      <p className="text-white text-sm text-center">Médico</p>
                    </div>
                    <div
                      onClick={() => setTheme('blue')}
                      className={`p-4 bg-slate-700 rounded-lg border-2 cursor-pointer transition-all ${
                        theme === 'blue' ? 'border-blue-500' : 'border-transparent hover:border-slate-500'
                      }`}
                    >
                      <div className="w-full h-16 bg-blue-800 rounded mb-2"></div>
                      <p className="text-white text-sm text-center">Azul</p>
                    </div>
                    <div
                      onClick={() => setTheme('green')}
                      className={`p-4 bg-slate-700 rounded-lg border-2 cursor-pointer transition-all ${
                        theme === 'green' ? 'border-blue-500' : 'border-transparent hover:border-slate-500'
                      }`}
                    >
                      <div className="w-full h-16 bg-green-800 rounded mb-2"></div>
                      <p className="text-white text-sm text-center">Verde</p>
                    </div>
                    <div
                      onClick={() => setTheme('purple')}
                      className={`p-4 bg-slate-700 rounded-lg border-2 cursor-pointer transition-all ${
                        theme === 'purple' ? 'border-blue-500' : 'border-transparent hover:border-slate-500'
                      }`}
                    >
                      <div className="w-full h-16 bg-purple-800 rounded mb-2"></div>
                      <p className="text-white text-sm text-center">Roxo</p>
                    </div>
                    <div
                      onClick={() => setTheme('orange')}
                      className={`p-4 bg-slate-700 rounded-lg border-2 cursor-pointer transition-all ${
                        theme === 'orange' ? 'border-blue-500' : 'border-transparent hover:border-slate-500'
                      }`}
                    >
                      <div className="w-full h-16 bg-orange-800 rounded mb-2"></div>
                      <p className="text-white text-sm text-center">Laranja</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Tamanho da Fonte</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="small">Pequeno</option>
                    <option value="medium">Médio</option>
                    <option value="large">Grande</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Idioma</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'pt' | 'en')}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pt">Português (Brasil)</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">Prévia do Tema Atual:</p>
                  <div className="p-4 rounded-lg border border-slate-600" style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)'
                  }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-base)' }}>
                      Texto principal em {theme} com fonte {fontSize}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                      Texto secundário
                    </div>
                    <button
                      className="mt-2 px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: 'var(--accent-primary)' }}
                    >
                      Botão de exemplo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Sistema */}
          {activeTab === 'sistema' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-6">Configurações do Sistema</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Fuso Horário</label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>América/São_Paulo</option>
                      <option>América/Rio_Branco</option>
                      <option>América/Manaus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Idioma</label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Português (Brasil)</option>
                      <option>English</option>
                      <option>Español</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Formato de Data</label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>DD/MM/AAAA</option>
                      <option>MM/DD/AAAA</option>
                      <option>AAAA-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">Formato de Hora</label>
                    <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>24 horas</option>
                      <option>12 horas (AM/PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Cache Automático</p>
                      <p className="text-slate-400 text-sm">Melhora a velocidade do sistema</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Integração */}
          {activeTab === 'integracao' && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-6">Integrações Externas</h2>

              <div className="space-y-4">
                {[
                  { name: 'API de Laboratórios', status: 'Conectado', color: 'text-green-400' },
                  { name: 'Sistema de Imagem', status: 'Desconectado', color: 'text-red-400' },
                  { name: 'Telemedicina', status: 'Conectado', color: 'text-green-400' },
                  { name: 'Farmácia Digital', status: 'Pendente', color: 'text-yellow-400' }
                ].map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">{integration.name}</h4>
                      <p className={`text-sm ${integration.color}`}>{integration.status}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Configurar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-6">Backup e Restauração</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Backup Automático</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white">Backup Diário</p>
                        <p className="text-slate-400 text-sm">Último backup: 15/01/2024 03:00</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Ações Manuais</h3>
                    <div className="space-y-2">
                      <button className="w-full flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        <span>Fazer Backup Agora</span>
                      </button>
                      <button className="w-full flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Restaurar Backup</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Histórico de Backups</h3>
                <div className="space-y-3">
                  {[
                    { date: '15/01/2024 03:00', size: '245 MB', status: 'Sucesso' },
                    { date: '14/01/2024 03:00', size: '243 MB', status: 'Sucesso' },
                    { date: '13/01/2024 03:00', size: '241 MB', status: 'Sucesso' },
                    { date: '12/01/2024 03:00', size: '238 MB', status: 'Erro' }
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{backup.date}</p>
                        <p className="text-slate-400 text-sm">{backup.size}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        backup.status === 'Sucesso' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {backup.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Home,
  Users,
  FileText,
  Calendar,
  Settings,
  User,
  TrendingUp,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Shield,
  Archive,
  Clipboard,
  Activity,
  BarChart3,
  Stethoscope,
  Pill,
  FileCheck,
  UserPlus,
  Clock,
  Heart,
  DollarSign,
  Video,
  History,
  CalendarDays
} from 'lucide-react';
import { OfflineIndicator, OfflineIndicatorCompact } from '@/components/ui/OfflineIndicator';
import MedicalNotificationCenter from '@/components/medical/MedicalNotificationCenter';
import FastActions from '@/components/ui/FastActions';

interface NavigationSubmenuItem {
  name: string;
  href: string;
  ariaLabel?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  ariaLabel: string;
  submenu?: NavigationSubmenuItem[];
}

interface NavigationSeparator {
  type: 'separator';
  label: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Documentos']);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, isDarkMode, isMedicalTheme } = useTheme();

  // Simples navegação por teclado sem timeouts
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Simples atalhos diretos sem promises ou timeouts
      if (e.ctrlKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        router.push('/home');
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        router.push('/pacientes');
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        router.push('/documentos');
      }

      // Quick escape for modals/overlays
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleGlobalShortcuts);
    return () => document.removeEventListener('keydown', handleGlobalShortcuts);
  }, [router]);

  // Função para detectar se uma rota está ativa
  const isRouteActive = (href: string, submenu?: NavigationSubmenuItem[]) => {
    // Rota exata para home
    if (href === '/home' && pathname === '/home') return true;

    // Para outras rotas, verificar se começam com o href
    if (href !== '/home' && pathname.startsWith(href) && pathname !== '/') return true;

    // Verificar submenu items
    if (submenu) {
      return submenu.some(subitem => pathname === subitem.href || pathname.startsWith(subitem.href));
    }

    return false;
  };

  // Medical navigation structure organized by workflow priority and logical grouping
  const navigation: (NavigationItem | NavigationSeparator)[] = [
    // Critical Medical Functions - Always accessible and visually prominent
    {
      name: 'Início',
      href: '/home',
      icon: Home,
      current: isRouteActive('/home'),
      priority: 'critical',
      ariaLabel: 'Página inicial do sistema médico'
    },
    {
      name: 'Pacientes',
      href: '/pacientes',
      icon: Users,
      current: isRouteActive('/pacientes', [
        { name: 'Lista de Pacientes', href: '/pacientes', ariaLabel: 'Ver todos os pacientes' },
        { name: 'Novo Paciente', href: '/pacientes/novo', ariaLabel: 'Cadastrar novo paciente' },
        { name: 'Prontuários', href: '/pacientes/prontuarios', ariaLabel: 'Acessar prontuários médicos' }
      ]),
      priority: 'critical',
      ariaLabel: 'Gestão de pacientes e prontuários',
      submenu: [
        { name: 'Lista de Pacientes', href: '/pacientes', ariaLabel: 'Ver todos os pacientes' },
        { name: 'Novo Paciente', href: '/pacientes/novo', ariaLabel: 'Cadastrar novo paciente' },
        { name: 'Prontuários', href: '/pacientes/prontuarios', ariaLabel: 'Acessar prontuários médicos' }
      ]
    },
    {
      name: 'Prescrições',
      href: '/prescricoes',
      icon: Pill,
      current: isRouteActive('/prescricoes'),
      priority: 'critical',
      ariaLabel: 'Gerenciar prescrições médicas'
    },
    {
      name: 'Exames',
      href: '/exames',
      icon: FileCheck,
      current: isRouteActive('/exames'),
      priority: 'critical',
      ariaLabel: 'Gerenciar exames e resultados'
    },

    // Separator for visual grouping
    { type: 'separator', label: 'Fluxos de Trabalho' },

    // Medical Workflows - Regular medical activities
    {
      name: 'Agendamento',
      href: '/agendamento',
      icon: CalendarDays,
      current: isRouteActive('/agendamento'),
      priority: 'high',
      ariaLabel: 'Sistema de agendamento de consultas'
    },
    {
      name: 'Consultas',
      href: '/consultas',
      icon: Calendar,
      current: isRouteActive('/consultas', [
        { name: 'Agenda', href: '/consultas', ariaLabel: 'Ver agenda de consultas' },
        { name: 'Nova Consulta', href: '/consultas/nova', ariaLabel: 'Agendar nova consulta' },
        { name: 'Histórico', href: '/consultas/historico', ariaLabel: 'Histórico de consultas' }
      ]),
      priority: 'high',
      ariaLabel: 'Gerenciar consultas médicas',
      submenu: [
        { name: 'Agenda', href: '/consultas', ariaLabel: 'Ver agenda de consultas' },
        { name: 'Nova Consulta', href: '/consultas/nova', ariaLabel: 'Agendar nova consulta' },
        { name: 'Histórico', href: '/consultas/historico', ariaLabel: 'Histórico de consultas' }
      ]
    },
    {
      name: 'Telemedicina',
      href: '/telemedicina',
      icon: Video,
      current: isRouteActive('/telemedicina'),
      priority: 'high',
      ariaLabel: 'Plataforma de telemedicina'
    },
    {
      name: 'Documentos',
      href: '/documentos',
      icon: FileText,
      current: isRouteActive('/documentos', [
        { name: 'Todos os Documentos', href: '/documentos', ariaLabel: 'Ver todos os documentos' },
        { name: 'Receitas', href: '/documentos?filter=receitas', ariaLabel: 'Receitas médicas' },
        { name: 'Atestados', href: '/documentos?filter=atestados', ariaLabel: 'Atestados médicos' },
        { name: 'Relatórios', href: '/documentos?filter=relatorios', ariaLabel: 'Relatórios médicos' }
      ]),
      priority: 'high',
      ariaLabel: 'Gestão de documentos médicos',
      submenu: [
        { name: 'Todos os Documentos', href: '/documentos', ariaLabel: 'Ver todos os documentos' },
        { name: 'Receitas', href: '/documentos?filter=receitas', ariaLabel: 'Receitas médicas' },
        { name: 'Atestados', href: '/documentos?filter=atestados', ariaLabel: 'Atestados médicos' },
        { name: 'Relatórios', href: '/documentos?filter=relatorios', ariaLabel: 'Relatórios médicos' }
      ]
    },

    // Separator for visual grouping
    { type: 'separator', label: 'Análise e Relatórios' },

    // Analytics & Reports - Data analysis and reporting
    {
      name: 'Histórico',
      href: '/historico',
      icon: History,
      current: isRouteActive('/historico'),
      priority: 'medium',
      ariaLabel: 'Histórico médico e atividades'
    },
    {
      name: 'Relatórios',
      href: '/relatorios',
      icon: BarChart3,
      current: isRouteActive('/relatorios'),
      priority: 'medium',
      ariaLabel: 'Relatórios e análises médicas'
    },
    {
      name: 'Financeiro',
      href: '/financeiro',
      icon: DollarSign,
      current: isRouteActive('/financeiro'),
      priority: 'medium',
      ariaLabel: 'Gestão financeira'
    },

    // Separator for visual grouping
    { type: 'separator', label: 'Sistema e Configurações' },

    // System & Configuration - Administrative functions
    {
      name: 'Notificações',
      href: '/notificacoes',
      icon: Bell,
      current: isRouteActive('/notificacoes'),
      priority: 'low',
      ariaLabel: 'Central de notificações'
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: Archive,
      current: isRouteActive('/templates', [
        { name: 'Gerenciar Templates', href: '/templates', ariaLabel: 'Ver todos os templates' },
        { name: 'Novo Template', href: '/templates/new', ariaLabel: 'Criar novo template' },
        { name: 'Templates Favoritos', href: '/templates?filter=favorites', ariaLabel: 'Templates favoritos' }
      ]),
      priority: 'low',
      ariaLabel: 'Gerenciar templates de documentos',
      submenu: [
        { name: 'Gerenciar Templates', href: '/templates', ariaLabel: 'Ver todos os templates' },
        { name: 'Novo Template', href: '/templates/new', ariaLabel: 'Criar novo template' },
        { name: 'Templates Favoritos', href: '/templates?filter=favorites', ariaLabel: 'Templates favoritos' }
      ]
    },
    {
      name: 'Assinatura Digital',
      href: '/assinatura',
      icon: Shield,
      current: isRouteActive('/assinatura'),
      priority: 'low',
      ariaLabel: 'Sistema de assinatura digital'
    },
    {
      name: 'Sistema',
      href: '/sistema',
      icon: Activity,
      current: isRouteActive('/sistema', [
        { name: 'Kanban', href: '/kanban', ariaLabel: 'Quadro Kanban de tarefas' },
        { name: 'URLs Dashboard', href: '/urls', ariaLabel: 'Dashboard de URLs' },
        { name: 'Monitoramento', href: '/sistema/monitor', ariaLabel: 'Monitoramento do sistema' }
      ]) || pathname.startsWith('/kanban') || pathname.startsWith('/urls'),
      priority: 'low',
      ariaLabel: 'Configurações do sistema',
      submenu: [
        { name: 'Kanban', href: '/kanban', ariaLabel: 'Quadro Kanban de tarefas' },
        { name: 'URLs Dashboard', href: '/urls', ariaLabel: 'Dashboard de URLs' },
        { name: 'Monitoramento', href: '/sistema/monitor', ariaLabel: 'Monitoramento do sistema' }
      ]
    }
  ];

  const userNavigation = [
    { name: 'Meu Perfil', href: '/profile', icon: User },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
    { name: 'Sair', href: '#', icon: LogOut, action: 'logout' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const handleNavigation = (href: string, action?: string) => {
    try {
      console.log('[MainLayout] Navegando para:', href, action ? `(${action})` : '');

      if (action === 'logout') {
        handleLogout();
        return;
      }

      // Garantir que o menu seja fechado primeiro
      setUserMenuOpen(false);
      setSidebarOpen(false);

      // Tentar navegação com router primeiro
      router.push(href);

    } catch (error) {
      console.error('[MainLayout] Erro na navegação com router, usando fallback:', error);
      // Fallback para window.location se router.push falhar
      try {
        window.location.href = href;
      } catch (fallbackError) {
        console.error('[MainLayout] Erro no fallback de navegação:', fallbackError);
      }
    }
  };

  const handleMenuClick = (item: any) => {
    try {
      console.log('[MainLayout] Menu clicado:', item.name, item.href);

      if (item.submenu) {
        toggleSubmenu(item.name);
      } else {
        handleNavigation(item.href);
      }
    } catch (error) {
      console.error('[MainLayout] Erro no handleMenuClick:', error);
      // Fechar sidebar mesmo se houver erro
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`min-h-screen ${
      isMedicalTheme ? 'bg-slate-900' :
      isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className={`flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 ${
          isMedicalTheme ? 'bg-slate-800 border-r border-slate-700' :
          isDarkMode ? 'bg-slate-800 border-r border-slate-700' : 'bg-white border-r border-gray-200'
        }`}>
          {/* Logo */}
          <div className={`flex h-20 shrink-0 items-center border-b pb-4 ${
            isMedicalTheme ? 'border-slate-700' :
            isDarkMode ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3 w-full">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className={`text-lg font-bold truncate ${
                  isMedicalTheme ? 'text-white' :
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  🏥 RepoMed IA
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">v6.0 Pro</span>
                  <p className={`text-xs truncate ${
                    isMedicalTheme ? 'text-slate-300' :
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>Sistema Médico</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col" role="navigation" aria-label="Menu principal de navegação médica">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item, index) => {
                    // Handle separators
                    if ('type' in item && item.type === 'separator') {
                      return (
                        <li key={`separator-${index}`} role="separator" className="my-3">
                          <div className="px-2">
                            <div className={`border-t ${
                              isMedicalTheme ? 'border-slate-300' :
                              isDarkMode ? 'border-slate-600' : 'border-slate-300'
                            }`}></div>
                            <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                              isMedicalTheme ? 'text-slate-700' :
                              isDarkMode ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {item.label}
                            </p>
                          </div>
                        </li>
                      );
                    }

                    // Priority-based styling with medical design system
                    const getPriorityStyles = (priority: string, current: boolean) => {
                      if (current) {
                        return priority === 'critical'
                          ? 'bg-red-600 text-white shadow-lg'
                          : 'bg-blue-600 text-white shadow-lg';
                      }

                      switch (priority) {
                        case 'critical':
                          return `${
                            isMedicalTheme ? 'text-white font-semibold hover:bg-red-600/20' :
                            isDarkMode ? 'text-slate-200 hover:bg-red-500/20' : 'text-slate-800 hover:bg-red-50'
                          } transition-all duration-200`;
                        case 'high':
                          return `${
                            isMedicalTheme ? 'text-white font-semibold hover:bg-blue-600/20' :
                            isDarkMode ? 'text-slate-200 hover:bg-blue-500/20' : 'text-slate-800 hover:bg-blue-50'
                          } transition-all duration-200`;
                        case 'medium':
                          return `${
                            isMedicalTheme ? 'text-slate-100 font-medium hover:bg-slate-600/30' :
                            isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'
                          } transition-all duration-200`;
                        case 'low':
                          return `${
                            isMedicalTheme ? 'text-slate-200 font-medium hover:bg-slate-600/20' :
                            isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'
                          } transition-all duration-200`;
                        default:
                          return `${
                            isMedicalTheme ? 'text-white font-medium hover:bg-slate-600/20' :
                            isDarkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-800 hover:bg-slate-100'
                          } transition-all duration-200`;
                      }
                    };

                    return (
                      <li key={item.name}>
                        <button
                          onClick={() => {
                            try {
                              console.log('[MainLayout] Desktop menu click:', item.name);
                              handleMenuClick(item);
                            } catch (error) {
                              console.error('[MainLayout] Erro no click desktop:', error);
                            }
                          }}
                          className={`group flex w-full gap-x-3 rounded-lg p-3 text-base leading-6 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getPriorityStyles(item.priority, item.current)}`}
                          aria-label={item.ariaLabel}
                          aria-expanded={item.submenu ? expandedMenus.includes(item.name) : undefined}
                          aria-haspopup={item.submenu ? 'true' : undefined}
                        >
                          <item.icon className={`h-6 w-6 shrink-0 ${item.priority === 'critical' ? 'text-current' : ''}`} />
                          {item.name}
                          {item.submenu && (
                            <ChevronDown className={`ml-auto h-5 w-5 transition-transform ${
                              expandedMenus.includes(item.name) ? 'rotate-180' : ''
                            }`} />
                          )}
                        </button>

                        {/* Submenu */}
                        {item.submenu && expandedMenus.includes(item.name) && (
                          <ul className="mt-1 ml-8 space-y-1" role="group" aria-label={`${item.name} submenu`}>
                            {item.submenu.map((subitem) => (
                              <li key={subitem.name}>
                                <button
                                  onClick={() => {
                                    try {
                                      console.log('[MainLayout] Desktop submenu click:', subitem.name, subitem.href);
                                      handleNavigation(subitem.href);
                                    } catch (error) {
                                      console.error('[MainLayout] Erro no click submenu desktop:', error);
                                    }
                                  }}
                                  className={`block w-full text-left rounded-lg py-2 px-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isMedicalTheme ? 'text-slate-200 hover:text-white hover:bg-slate-600/40' :
                                    isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                  }`}
                                  aria-label={subitem.ariaLabel || subitem.name}
                                >
                                  {subitem.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>

              {/* User Info */}
              <li className="mt-auto">
                <div className={`rounded-2xl p-4 shadow-lg ${
                  isMedicalTheme ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
                  isDarkMode ? 'bg-slate-700' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-lg">👨‍⚕️</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-base font-bold ${
                        isMedicalTheme ? 'text-white' :
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>Dr. João Silva</p>
                      <p className={`text-sm ${
                        isMedicalTheme ? 'text-slate-200' :
                        isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>CRM SP 123456 • Online</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className={`text-sm font-medium ${
                          isMedicalTheme ? 'text-green-300' :
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>Sistema Ativo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/80" onClick={() => setSidebarOpen(false)} />
          <div className={`fixed inset-y-0 left-0 z-50 w-72 px-6 pb-4 ${
            isMedicalTheme ? 'bg-slate-800 border-r border-slate-700' :
            isDarkMode ? 'bg-slate-800' : 'bg-white border-r border-gray-200'
          }`}>
            <div className="flex h-16 shrink-0 items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isMedicalTheme ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-blue-600'
                }`}>
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${
                    isMedicalTheme ? 'text-white' :
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>🏥 RepoMed IA</h1>
                  <p className={`text-sm ${
                    isMedicalTheme ? 'text-slate-300' :
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>Sistema Médico Enterprise</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`transition-colors ${
                  isMedicalTheme ? 'text-slate-300 hover:text-white' :
                  isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
                aria-label="Fechar menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="mt-8" role="navigation" aria-label="Menu principal de navegação médica (mobile)">
              <ul role="list" className="space-y-1">
                {navigation.map((item, index) => {
                  // Handle separators
                  if ('type' in item && item.type === 'separator') {
                    return (
                      <li key={`separator-${index}`} role="separator" className="my-3">
                        <div className="px-2">
                          <div className={`border-t ${
                            isMedicalTheme ? 'border-slate-600' :
                            isDarkMode ? 'border-slate-600' : 'border-slate-300'
                          }`}></div>
                          <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                            isMedicalTheme ? 'text-slate-300' :
                            isDarkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {item.label}
                          </p>
                        </div>
                      </li>
                    );
                  }

                  // Priority-based styling (same as desktop)
                  const getPriorityStyles = (priority: string, current: boolean) => {
                    if (current) {
                      return priority === 'critical'
                        ? 'bg-red-600 text-white border-l-4 border-red-400'
                        : 'bg-blue-600 text-white';
                    }

                    switch (priority) {
                      case 'critical':
                        return isMedicalTheme
                          ? 'text-red-200 hover:text-white hover:bg-red-700/30 border-l-2 border-red-500/50'
                          : 'text-red-200 hover:text-white hover:bg-red-700/30 border-l-2 border-red-500/50';
                      case 'high':
                        return isMedicalTheme
                          ? 'text-white font-semibold hover:text-white hover:bg-blue-700/30'
                          : 'text-blue-200 hover:text-white hover:bg-blue-700/30';
                      case 'medium':
                        return isMedicalTheme
                          ? 'text-slate-100 hover:text-white hover:bg-slate-700'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700';
                      case 'low':
                        return isMedicalTheme
                          ? 'text-slate-200 hover:text-white hover:bg-slate-700/50'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50';
                      default:
                        return isMedicalTheme
                          ? 'text-white hover:text-white hover:bg-slate-700'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700';
                    }
                  };

                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => {
                          try {
                            console.log('[MainLayout] Mobile menu click:', item.name);
                            handleMenuClick(item);
                          } catch (error) {
                            console.error('[MainLayout] Erro no click mobile:', error);
                          }
                        }}
                        className={`group flex w-full gap-x-3 rounded-md p-2 text-base leading-6 font-semibold transition-all duration-200 ${getPriorityStyles(item.priority, item.current)}`}
                        aria-label={item.ariaLabel}
                        aria-expanded={item.submenu ? expandedMenus.includes(item.name) : undefined}
                        aria-haspopup={item.submenu ? 'true' : undefined}
                      >
                        <item.icon className={`h-6 w-6 shrink-0 ${item.priority === 'critical' ? 'text-current' : ''}`} />
                        {item.name}
                        {item.submenu && (
                          <ChevronDown className={`ml-auto h-5 w-5 transition-transform ${
                            expandedMenus.includes(item.name) ? 'rotate-180' : ''
                          }`} />
                        )}
                      </button>

                      {/* Submenu Mobile */}
                      {item.submenu && expandedMenus.includes(item.name) && (
                        <ul className="mt-1 ml-8 space-y-1" role="group" aria-label={`${item.name} submenu`}>
                          {item.submenu.map((subitem) => (
                            <li key={subitem.name}>
                              <button
                                onClick={() => {
                                  try {
                                    console.log('[MainLayout] Mobile submenu click:', subitem.name, subitem.href);
                                    handleNavigation(subitem.href);
                                  } catch (error) {
                                    console.error('[MainLayout] Erro no click submenu mobile:', error);
                                  }
                                }}
                                className={`block w-full text-left rounded-lg py-2 px-3 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  isMedicalTheme ? 'text-slate-200 hover:text-white hover:bg-slate-700' :
                                  isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                                aria-label={subitem.ariaLabel || subitem.name}
                              >
                                {subitem.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <div className={`sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 border-b ${
          isMedicalTheme ? 'bg-slate-800 border-slate-700' :
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <button
            type="button"
            className={`-m-2.5 p-2.5 lg:hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              isMedicalTheme ? 'text-slate-300 hover:text-white' :
              isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <label htmlFor="search-field" className="sr-only">
                Buscar
              </label>
              <Search className={`pointer-events-none absolute inset-y-0 left-0 h-full w-5 ml-3 ${
                isMedicalTheme ? 'text-slate-400' :
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`} />
              <input
                id="search-field"
                className={`block h-full w-full border-0 bg-transparent py-0 pl-10 pr-0 focus:ring-0 sm:text-base focus:outline-none ${
                  isMedicalTheme ? 'text-white placeholder:text-slate-400' :
                  isDarkMode ? 'text-white placeholder:text-slate-400' : 'text-slate-900 placeholder:text-slate-500'
                }`}
                placeholder="🔍 Buscar pacientes, documentos, receitas..."
                type="search"
                name="search"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = (e.target as HTMLInputElement).value;

                    if (!query || query.trim().length === 0) {
                      console.log('[MainLayout] Query vazia');
                      return;
                    }

                    console.log('[MainLayout] Pesquisa inteligente:', query);

                    const cleanQuery = query.toLowerCase().trim();

                    // Mapeamento inteligente expandido
                    const routeMap: Record<string, string> = {
                      'paciente': '/pacientes',
                      'pacientes': '/pacientes',
                      'documento': '/documentos',
                      'documentos': '/documentos',
                      'receita': '/prescricoes',
                      'receitas': '/prescricoes',
                      'prescricao': '/prescricoes',
                      'prescricoes': '/prescricoes',
                      'consulta': '/consultas',
                      'consultas': '/consultas',
                      'agendamento': '/agendamento',
                      'agenda': '/agendamento',
                      'exame': '/exames',
                      'exames': '/exames',
                      'relatorio': '/relatorios',
                      'relatorios': '/relatorios',
                      'configuracao': '/configuracoes',
                      'configuracoes': '/configuracoes',
                      'config': '/configuracoes',
                      'template': '/templates',
                      'templates': '/templates',
                      'assinatura': '/assinatura',
                      'financeiro': '/financeiro',
                      'historico': '/historico',
                      'notificacao': '/notificacoes',
                      'notificacoes': '/notificacoes',
                      'sistema': '/sistema',
                      'kanban': '/kanban',
                      'urls': '/urls',
                      'monitor': '/sistema/monitor',
                      'monitoramento': '/sistema/monitor',
                      'home': '/home',
                      'dashboard': '/home',
                      'perfil': '/profile',
                      'profile': '/profile',
                      'telemedicina': '/telemedicina'
                    };

                    // Busca por correspondência exata
                    for (const [term, route] of Object.entries(routeMap)) {
                      if (cleanQuery.includes(term)) {
                        try {
                          console.log(`[MainLayout] Rota encontrada: ${term} -> ${route}`);
                          router.push(route);
                          (e.target as HTMLInputElement).value = '';
                          return;
                        } catch (error) {
                          console.error('[MainLayout] Erro na navegação da pesquisa:', error);
                          // Fallback seguro
                          try {
                            window.location.href = route;
                            return;
                          } catch (fallbackError) {
                            console.error('[MainLayout] Fallback de navegação falhou:', fallbackError);
                          }
                        }
                      }
                    }

                    // Fallback para página de busca geral
                    try {
                      console.log('[MainLayout] Usando fallback de pesquisa geral');
                      router.push(`/search?q=${encodeURIComponent(query)}`);
                      (e.target as HTMLInputElement).value = '';
                    } catch (error) {
                      console.error('[MainLayout] Erro no fallback de pesquisa:', error);
                    }
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Offline Status Indicator */}
              <OfflineIndicatorCompact />

              {/* Advanced Medical Notifications */}
              <MedicalNotificationCenter />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center space-x-2 rounded-lg p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isMedicalTheme ? 'text-white hover:bg-slate-700' :
                    isDarkMode ? 'text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700' :
                    'text-slate-700 hover:text-slate-900 bg-white/50 hover:bg-white/80'
                  }`}
                >
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-semibold">👨‍⚕️</span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className={`text-sm font-medium ${
                      isMedicalTheme ? 'text-white' :
                      isDarkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}>Dr. João Silva</p>
                    <p className={`text-xs ${
                      isMedicalTheme ? 'text-slate-300' :
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>CRM SP 123456</p>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border py-3 z-50 ${
                    isMedicalTheme ? 'bg-white border-blue-200' :
                    isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'
                  }`}>
                    <div className={`px-4 py-3 border-b mb-2 ${
                      isMedicalTheme ? 'border-slate-600' :
                      isDarkMode ? 'border-slate-600' : 'border-slate-200'
                    }`}>
                      <p className={`font-bold text-lg ${
                        isMedicalTheme ? 'text-slate-900' :
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>Dr. João Silva</p>
                      <p className={`text-sm font-mono font-semibold ${
                        isMedicalTheme ? 'text-blue-700' :
                        isDarkMode ? 'text-blue-300' : 'text-blue-600'
                      }`}>CRM SP 123456</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className={`text-sm font-bold ${
                          isMedicalTheme ? 'text-green-700' :
                          isDarkMode ? 'text-green-300' : 'text-green-600'
                        }`}>Sistema Ativo</span>
                      </div>
                    </div>
                    {userNavigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          try {
                            console.log('[MainLayout] User menu click:', item.name, item.href);
                            handleNavigation(item.href, item.action);
                          } catch (error) {
                            console.error('[MainLayout] Erro no click user menu:', error);
                          }
                        }}
                        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg mx-2 mb-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          item.action === 'logout'
                            ? isMedicalTheme
                              ? 'text-red-700 hover:text-red-800 hover:bg-red-100'
                              : isDarkMode
                                ? 'text-red-300 hover:text-red-200 hover:bg-red-900/30'
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            : isMedicalTheme
                              ? 'text-slate-800 hover:text-slate-900 hover:bg-blue-50'
                              : isDarkMode
                                ? 'text-slate-200 hover:text-white hover:bg-slate-700'
                                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>

      {/* Fast Actions Button */}
      <FastActions />

      {/* Offline Indicator - Full featured for medical safety */}
      <OfflineIndicator />
    </div>
  );
}
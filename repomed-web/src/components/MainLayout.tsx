'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
import { QuickActionsBarSimple } from '@/components/quick-actions/QuickActionsBarSimple';
import { OfflineIndicator, OfflineIndicatorCompact } from '@/components/ui/OfflineIndicator';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Documentos']);
  const pathname = usePathname();
  const router = useRouter();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Check for key combinations
      if (e.key.toLowerCase() === 'g') {
        const nextKey = new Promise<string>((resolve) => {
          const handler = (nextE: KeyboardEvent) => {
            document.removeEventListener('keydown', handler);
            resolve(nextE.key.toLowerCase());
          };
          document.addEventListener('keydown', handler);

          // Timeout after 2 seconds
          setTimeout(() => {
            document.removeEventListener('keydown', handler);
            resolve('');
          }, 2000);
        });

        nextKey.then((next) => {
          switch (next) {
            case 'p':
              e.preventDefault();
              router.push('/pacientes');
              break;
            case 'd':
              e.preventDefault();
              router.push('/documentos');
              break;
            case 'a':
              e.preventDefault();
              router.push('/agendamento');
              break;
            case 'h':
              e.preventDefault();
              router.push('/home');
              break;
          }
        });
      }

      if (e.key.toLowerCase() === 'n') {
        const nextKey = new Promise<string>((resolve) => {
          const handler = (nextE: KeyboardEvent) => {
            document.removeEventListener('keydown', handler);
            resolve(nextE.key.toLowerCase());
          };
          document.addEventListener('keydown', handler);

          // Timeout after 2 seconds
          setTimeout(() => {
            document.removeEventListener('keydown', handler);
            resolve('');
          }, 2000);
        });

        nextKey.then((next) => {
          switch (next) {
            case 'r':
              e.preventDefault();
              router.push('/prescricoes/nova');
              break;
            case 'd':
              e.preventDefault();
              router.push('/documentos/novo');
              break;
            case 'p':
              e.preventDefault();
              router.push('/pacientes/novo');
              break;
          }
        });
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

  const navigation = [
    {
      name: 'Dashboard',
      href: '/home',
      icon: Home,
      current: pathname === '/home'
    },
    {
      name: 'Pacientes',
      href: '/pacientes',
      icon: Users,
      current: pathname === '/pacientes',
      submenu: [
        { name: 'Lista de Pacientes', href: '/pacientes' },
        { name: 'Novo Paciente', href: '/pacientes/novo' },
        { name: 'Prontuários', href: '/pacientes/prontuarios' }
      ]
    },
    {
      name: 'Documentos',
      href: '/documentos',
      icon: FileText,
      current: pathname === '/documentos',
      submenu: [
        { name: 'Todos os Documentos', href: '/documentos' },
        { name: 'Receitas', href: '/documentos?filter=receitas' },
        { name: 'Atestados', href: '/documentos?filter=atestados' },
        { name: 'Relatórios', href: '/documentos?filter=relatorios' }
      ]
    },
    {
      name: 'Consultas',
      href: '/consultas',
      icon: Calendar,
      current: pathname === '/consultas',
      submenu: [
        { name: 'Agenda', href: '/consultas' },
        { name: 'Nova Consulta', href: '/consultas/nova' },
        { name: 'Histórico', href: '/consultas/historico' }
      ]
    },
    {
      name: 'Assinatura Digital',
      href: '/assinatura',
      icon: Shield,
      current: pathname === '/assinatura'
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: Archive,
      current: pathname === '/templates',
      submenu: [
        { name: 'Gerenciar Templates', href: '/templates' },
        { name: 'Novo Template', href: '/templates/new' },
        { name: 'Templates Favoritos', href: '/templates?filter=favorites' }
      ]
    },
    {
      name: 'Agendamento',
      href: '/agendamento',
      icon: CalendarDays,
      current: pathname === '/agendamento'
    },
    {
      name: 'Telemedicina',
      href: '/telemedicina',
      icon: Video,
      current: pathname === '/telemedicina'
    },
    {
      name: 'Histórico',
      href: '/historico',
      icon: History,
      current: pathname === '/historico'
    },
    {
      name: 'Notificações',
      href: '/notificacoes',
      icon: Bell,
      current: pathname === '/notificacoes'
    },
    {
      name: 'Prescrições',
      href: '/prescricoes',
      icon: Pill,
      current: pathname === '/prescricoes'
    },
    {
      name: 'Exames',
      href: '/exames',
      icon: FileCheck,
      current: pathname === '/exames'
    },
    {
      name: 'Relatórios',
      href: '/relatorios',
      icon: BarChart3,
      current: pathname === '/relatorios'
    },
    {
      name: 'Financeiro',
      href: '/financeiro',
      icon: DollarSign,
      current: pathname === '/financeiro'
    },
    {
      name: 'Sistema',
      href: '/sistema',
      icon: Activity,
      current: pathname.startsWith('/sistema'),
      submenu: [
        { name: 'Kanban', href: '/kanban' },
        { name: 'URLs Dashboard', href: '/urls' },
        { name: 'Monitoramento', href: '/sistema/monitor' }
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
    if (action === 'logout') {
      handleLogout();
    } else {
      router.push(href);
    }
    setUserMenuOpen(false);
    setSidebarOpen(false);
  };

  const handleMenuClick = (item: any) => {
    if (item.submenu) {
      toggleSubmenu(item.name);
    } else {
      handleNavigation(item.href);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-800 px-6 pb-4 border-r border-slate-700">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">RepoMed IA</h1>
                <p className="text-xs text-slate-400">Sistema Médico v4.0</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => handleMenuClick(item)}
                        className={`group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                          item.current
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                        {item.submenu && (
                          <ChevronDown className={`ml-auto h-5 w-5 transition-transform ${
                            expandedMenus.includes(item.name) ? 'rotate-180' : ''
                          }`} />
                        )}
                      </button>

                      {/* Submenu */}
                      {item.submenu && expandedMenus.includes(item.name) && (
                        <ul className="mt-1 ml-8 space-y-1">
                          {item.submenu.map((subitem) => (
                            <li key={subitem.name}>
                              <button
                                onClick={() => handleNavigation(subitem.href)}
                                className="block w-full text-left rounded-md py-1 px-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                              >
                                {subitem.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </li>

              {/* User Info */}
              <li className="mt-auto">
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">JS</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Dr. João Silva</p>
                      <p className="text-slate-400 text-sm">CRM SP 123456</p>
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
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-800 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">RepoMed IA</h1>
                  <p className="text-xs text-slate-400">Sistema Médico v4.0</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="mt-8">
              <ul role="list" className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => handleMenuClick(item)}
                      className={`group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                        item.current
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      {item.name}
                      {item.submenu && (
                        <ChevronDown className={`ml-auto h-5 w-5 transition-transform ${
                          expandedMenus.includes(item.name) ? 'rotate-180' : ''
                        }`} />
                      )}
                    </button>

                    {/* Submenu Mobile */}
                    {item.submenu && expandedMenus.includes(item.name) && (
                      <ul className="mt-1 ml-8 space-y-1">
                        {item.submenu.map((subitem) => (
                          <li key={subitem.name}>
                            <button
                              onClick={() => handleNavigation(subitem.href)}
                              className="block w-full text-left rounded-md py-1 px-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                              {subitem.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-700 bg-slate-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-400 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Buscar
              </label>
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-3" />
              <input
                id="search-field"
                className="block h-full w-full border-0 bg-transparent py-0 pl-10 pr-0 text-white placeholder:text-slate-400 focus:ring-0 sm:text-sm"
                placeholder="Buscar pacientes, documentos..."
                type="search"
                name="search"
              />
            </form>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Offline Status Indicator */}
              <OfflineIndicatorCompact />

              {/* Notifications */}
              <button
                onClick={() => handleNavigation('/notificacoes')}
                className="relative -m-2.5 p-2.5 text-slate-400 hover:text-white transition-colors"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  3
                </span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-slate-300 hover:text-white"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">JS</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-1">
                    {userNavigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.href, item.action)}
                        className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700"
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

      {/* Quick Actions Bar - Fixed position for medical workflows */}
      <QuickActionsBarSimple />

      {/* Offline Indicator - Full featured for medical safety */}
      <OfflineIndicator />
    </div>
  );
}
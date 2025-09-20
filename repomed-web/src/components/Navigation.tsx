'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, Users, FileText, Calendar, Settings, LogOut, Menu, X, ChevronLeft,
  ClipboardList, Edit3, Layout, BarChart3, Share2, TestTube,
  Stethoscope, Award, FlaskConical, Activity, UserCog, Building,
  PenTool, Heart, Brain, Pill, Syringe, FolderOpen, Plus, Search,
  Bell, Moon, Sun, HelpCircle, MessageSquare, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Início', href: '/', icon: Home },
  { name: 'Dashboard', href: '/home', icon: BarChart3 },
  {
    name: 'Pacientes',
    href: '/pacientes',
    icon: Users,
    children: [
      { name: 'Lista de Pacientes', href: '/pacientes', icon: Users },
      { name: 'Novo Paciente', href: '/pacientes/novo', icon: Plus },
      { name: 'Prontuários', href: '/pacientes/prontuarios', icon: FileText },
    ]
  },
  {
    name: 'Prescrições',
    href: '/prescricoes',
    icon: ClipboardList,
    children: [
      { name: 'Todas Prescrições', href: '/prescricoes', icon: ClipboardList },
      { name: 'Nova Prescrição', href: '/prescricoes/nova', icon: Plus },
      { name: 'Assinar Prescrição', href: '/assinatura', icon: Edit3 },
    ]
  },
  {
    name: 'Documentos',
    href: '/documentos',
    icon: FileText,
    children: [
      { name: 'Todos Documentos', href: '/documentos', icon: FolderOpen },
      { name: 'Criar Documento', href: '/documentos/criar', icon: Plus },
    ]
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: Layout,
    children: [
      { name: 'Ver Templates', href: '/templates', icon: Layout },
      { name: 'Novo Template', href: '/templates/new', icon: Plus },
    ]
  },
  {
    name: 'Consultas',
    href: '/consultas',
    icon: Calendar,
    children: [
      { name: 'Lista de Consultas', href: '/consultas', icon: Calendar },
      { name: 'Agendar Consulta', href: '/agendamento', icon: Plus },
      { name: 'Calendário', href: '/calendar', icon: Calendar },
    ]
  },
  {
    name: 'Relatórios',
    href: '/relatorios',
    icon: BarChart3,
    children: [
      { name: 'Relatórios Gerais', href: '/relatorios', icon: BarChart3 },
      { name: 'Analytics', href: '/dashboard/analytics', icon: Activity },
    ]
  },
  { 
    name: 'Configurações', 
    href: '/settings', 
    icon: Settings,
    children: [
      { name: 'Configurações Gerais', href: '/settings', icon: Settings },
      { name: 'Dados da Clínica', href: '/settings/clinic', icon: Building },
      { name: 'Assinatura Digital', href: '/settings/signature', icon: Edit3 },
      { name: 'Perfil', href: '/profile', icon: UserCog },
    ]
  },
  { name: 'Demo', href: '/demo', icon: TestTube, badge: 'Novo' },
];

export function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg lg:hidden"
      >
        <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-72 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 shadow-2xl z-50 transition-transform duration-300",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RepoMed IA
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">v3.0 Enterprise</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              <span className="text-white font-semibold">DR</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Dr. João Silva</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">CRM-SP 123456</p>
            </div>
            <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-4 gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 group">
              <Bell className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 group">
              <Search className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 group">
              <MessageSquare className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
            </button>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 group"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-gray-500 group-hover:text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200",
                        isActive(item.href)
                          ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <ChevronLeft className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        expandedItems.includes(item.name) ? "-rotate-90" : "rotate-0"
                      )} />
                    </button>
                    {expandedItems.includes(item.name) && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                                isActive(child.href)
                                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                              )}
                            >
                              <child.icon className="h-4 w-4" />
                              <span className="text-sm">{child.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200",
                      isActive(item.href)
                        ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Back Button for Pages */}
      {pathname !== '/' && pathname !== '/dashboard' && (
        <button
          onClick={() => router.back()}
          className="fixed top-4 right-4 z-40 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg flex items-center space-x-2 hover:shadow-xl transition-all duration-200"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Voltar</span>
        </button>
      )}
    </>
  );
}
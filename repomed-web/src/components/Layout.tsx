import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Pacientes', href: '/patients', icon: '👥' },
    { name: 'Prescrições', href: '/prescriptions', icon: '📋' },
    { name: 'Documentos', href: '/documents', icon: '📄' },
    { name: 'Templates', href: '/templates', icon: '📝' },
    { name: 'Atestados', href: '/atestados', icon: '🏥' },
    { name: 'Laudos', href: '/laudos', icon: '🔬' },
    { name: 'Exames', href: '/exames', icon: '🧪' },
    { name: 'Métricas', href: '/metrics', icon: '📈' },
    { name: 'Relatórios', href: '/reports', icon: '📊' },
    { name: 'Analytics', href: '/analytics', icon: '📉' },
    { name: 'Compartilhar', href: '/share', icon: '🔗' },
    { name: 'Configurações', href: '/settings', icon: '⚙️' },
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                ✕
              </button>
            </div>
            <SidebarContent navigation={navigation} isCurrentPath={isCurrentPath} />
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <SidebarContent navigation={navigation} isCurrentPath={isCurrentPath} />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
        </div>

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-900">RepoMed IA</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {user?.name}
              </span>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => logout()}
              >
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarContent: React.FC<{
  navigation: Array<{ name: string; href: string; icon: string }>;
  isCurrentPath: (path: string) => boolean;
}> = ({ navigation, isCurrentPath }) => {
  return (
    <>
      <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">RepoMed IA</h1>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-white space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${isCurrentPath(item.href)
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Layout;
import { useState, useEffect, ReactNode } from 'react';
import { 
  Search, Menu, X, Bell, Settings, User, 
  FileText, Stethoscope, Calendar, PieChart,
  MessageSquare, HelpCircle, LogOut, Command
} from 'lucide-react';
import { CommandPalette } from '@/components/CommandPalette';
import { PatientPanel } from '@/components/workspace/PatientPanel';
import { EditorPanel } from '@/components/workspace/EditorPanel';
import { ValidationPanel } from '@/components/workspace/ValidationPanel';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useHotkeys } from '@/hooks/useHotkeys';
import { cn } from '@/lib/utils';

interface MedicalWorkspaceProps {
  children?: ReactNode;
}

export const MedicalWorkspace = ({ children }: MedicalWorkspaceProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('editor');
  
  // Atalhos de teclado globais
  useHotkeys('cmd+k', () => setCommandOpen(true));
  useHotkeys('cmd+/', () => setSidebarOpen(!sidebarOpen));
  useHotkeys('cmd+1', () => setActivePanel('patient'));
  useHotkeys('cmd+2', () => setActivePanel('editor'));
  useHotkeys('cmd+3', () => setActivePanel('validation'));
  
  const navigation = [
    { name: 'Dashboard', icon: PieChart, href: '/', badge: null },
    { name: 'Pacientes', icon: User, href: '/patients', badge: '127' },
    { name: 'Documentos', icon: FileText, href: '/documents', badge: '23' },
    { name: 'Consultas', icon: Stethoscope, href: '/appointments', badge: '5' },
    { name: 'Agenda', icon: Calendar, href: '/calendar', badge: null },
    { name: 'Mensagens', icon: MessageSquare, href: '/messages', badge: '3' },
  ];
  
  return (
    <div className="h-screen flex overflow-hidden bg-neutral-50">
      {/* Command Palette */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      
      {/* Sidebar */}
      <div className={cn(
        'flex flex-col w-64 bg-white border-r border-neutral-200 transition-all duration-300',
        !sidebarOpen && '-ml-64'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">RepoMed IA</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-neutral-500 group-hover:text-primary-500" />
                <span className="text-sm font-medium text-neutral-700">{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-primary-100 text-primary-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>
        
        {/* User Menu */}
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 cursor-pointer">
            <img 
              src="/api/placeholder/32/32" 
              alt="User" 
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Dr. João Silva</p>
              <p className="text-xs text-neutral-500">CRM: 123456-SP</p>
            </div>
            <Settings className="w-4 h-4 text-neutral-400" />
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-neutral-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Global Search */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar paciente, documento ou comando..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onFocus={() => setCommandOpen(true)}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-neutral-100 border border-neutral-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-neutral-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Help */}
            <button className="p-2 hover:bg-neutral-100 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </button>
            
            {/* Offline Indicator */}
            <OfflineIndicator />
          </div>
        </header>
        
        {/* Workspace Area - Tri-pane Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Patient Panel */}
          <div className={cn(
            'w-80 bg-white border-r border-neutral-200 transition-all duration-300',
            activePanel !== 'patient' && 'w-12'
          )}>
            <PatientPanel collapsed={activePanel !== 'patient'} />
          </div>
          
          {/* Editor Panel */}
          <div className="flex-1 flex flex-col">
            {children || <EditorPanel />}
          </div>
          
          {/* Validation Panel */}
          <div className={cn(
            'w-96 bg-white border-l border-neutral-200 transition-all duration-300',
            activePanel !== 'validation' && 'w-12'
          )}>
            <ValidationPanel collapsed={activePanel !== 'validation'} />
          </div>
        </div>
      </div>
    </div>
  );
};
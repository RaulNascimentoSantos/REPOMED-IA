'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Plus,
  Users,
  FileText,
  Pill,
  Search,
  Calendar,
  Settings,
  Zap,
  Keyboard,
  X
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  shortcut: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
  category: 'create' | 'navigate' | 'search';
  priority: 'high' | 'medium' | 'low';
}

interface QuickActionsBarProps {
  isVisible?: boolean;
  onToggle?: () => void;
  className?: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'new-prescription',
    label: 'Nova Prescrição',
    shortcut: 'N+R',
    icon: Pill,
    href: '/prescricoes/nova',
    description: 'Criar nova prescrição médica',
    category: 'create',
    priority: 'high'
  },
  {
    id: 'new-document',
    label: 'Novo Documento',
    shortcut: 'N+D',
    icon: FileText,
    href: '/documentos/novo',
    description: 'Criar novo documento médico',
    category: 'create',
    priority: 'high'
  },
  {
    id: 'patients',
    label: 'Pacientes',
    shortcut: 'G+P',
    icon: Users,
    href: '/pacientes',
    description: 'Gerenciar pacientes',
    category: 'navigate',
    priority: 'high'
  },
  {
    id: 'search',
    label: 'Buscar',
    shortcut: 'Ctrl+K',
    icon: Search,
    href: '/buscar',
    description: 'Busca global no sistema',
    category: 'search',
    priority: 'medium'
  },
  {
    id: 'calendar',
    label: 'Agenda',
    shortcut: 'G+A',
    icon: Calendar,
    href: '/agenda',
    description: 'Visualizar agenda médica',
    category: 'navigate',
    priority: 'medium'
  }
];

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  isVisible = true,
  onToggle,
  className
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Debug log
  console.log('QuickActionsBar rendered:', { isVisible, pathname, isExpanded });

  // Filtrar ações baseado na página atual
  const filteredActions = quickActions.filter(action => {
    // Não mostrar ação da página atual
    if (pathname === action.href) return false;

    // Priorizar ações de alta prioridade
    if (action.priority === 'high') return true;

    // Mostrar ações relevantes baseado no contexto
    if (pathname.includes('/prescricoes') && action.category === 'create') return true;
    if (pathname.includes('/pacientes') && action.id === 'new-prescription') return true;

    return action.priority === 'medium';
  }).slice(0, 5); // Máximo 5 ações

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isExpanded) return;

      switch (e.key) {
        case 'Escape':
          setIsExpanded(false);
          setFocusedIndex(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev =>
            prev < filteredActions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev =>
            prev > 0 ? prev - 1 : filteredActions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && filteredActions[focusedIndex]) {
            handleActionClick(filteredActions[focusedIndex]);
          }
          break;
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isExpanded, focusedIndex, filteredActions]);

  const handleActionClick = (action: QuickAction) => {
    router.push(action.href);
    setIsExpanded(false);
    setFocusedIndex(-1);
  };

  const toggleExpanded = () => {
    console.log('QuickActionsBar clicked, toggling expanded:', !isExpanded);
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setFocusedIndex(0);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed right-6 bottom-6',
        'transition-all duration-300 ease-in-out',
        className
      )}
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop para mobile */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* Actions Panel */}
      {isExpanded && (
        <div
          className={cn(
            'absolute bottom-16 right-0 w-80',
            'bg-white dark:bg-slate-800 rounded-xl shadow-2xl',
            'border border-slate-200 dark:border-slate-700',
            'p-4 space-y-2',
            'transition-all duration-200 ease-in-out transform scale-100 opacity-100',
            'max-h-96 overflow-y-auto'
          )}
          role="menu"
          aria-label="Ações rápidas"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Ações Rápidas
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Fechar ações rápidas"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Actions List */}
          <div className="space-y-1" role="none">
            {filteredActions.map((action, index) => {
              const Icon = action.icon;
              const isFocused = index === focusedIndex;

              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg',
                    'text-left transition-all duration-150',
                    'hover:bg-slate-100 dark:hover:bg-slate-700',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    'group',
                    isFocused && 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                  )}
                  role="menuitem"
                  tabIndex={isExpanded ? 0 : -1}
                >
                  <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                    'bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30',
                    'transition-colors duration-150',
                    isFocused && 'bg-blue-100 dark:bg-blue-900/30'
                  )}>
                    <Icon className={cn(
                      'w-4 h-4 text-slate-600 dark:text-slate-300',
                      'group-hover:text-blue-600 dark:group-hover:text-blue-400',
                      isFocused && 'text-blue-600 dark:text-blue-400'
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {action.label}
                      </span>
                      <kbd className={cn(
                        'ml-2 px-2 py-1 text-xs font-mono',
                        'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300',
                        'rounded border border-slate-300 dark:border-slate-500',
                        'group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50',
                        isFocused && 'bg-blue-100 dark:bg-blue-900/50'
                      )}>
                        {action.shortcut}
                      </kbd>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {action.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-2 mt-3 border-t border-slate-200 dark:border-slate-600">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
              Use ↑↓ para navegar, Enter para selecionar, Esc para fechar
            </p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleExpanded}
        className="w-12 h-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group relative overflow-hidden"
        style={{
          backgroundColor: isExpanded ? '#1d4ed8' : '#2563eb',
          transform: isExpanded ? 'scale(0.95)' : 'scale(1)'
        }}
        aria-label={isExpanded ? 'Fechar ações rápidas' : 'Abrir ações rápidas'}
        aria-expanded={isExpanded}
        aria-haspopup="menu"
      >
        <Zap
          className={cn(
            'w-6 h-6 transition-transform duration-200',
            isExpanded && 'rotate-12 scale-110'
          )}
        />

        {/* Pulse animation when not expanded */}
        {!isExpanded && (
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
        )}
      </button>

      {/* Badge para notificações urgentes */}
      {!isExpanded && filteredActions.some(a => a.priority === 'high') && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">
            {filteredActions.filter(a => a.priority === 'high').length}
          </span>
        </div>
      )}
    </div>
  );
};

export default QuickActionsBar;
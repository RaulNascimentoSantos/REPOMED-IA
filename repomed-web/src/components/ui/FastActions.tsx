/**
 * RepoMed IA v6.1 - Fast Actions Component
 * Barra de ações rápidas para acesso rápido às funcionalidades principais
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileText,
  Users,
  Stethoscope,
  Calendar,
  Search,
  X,
  Pill,
  Shield,
  Camera,
  Phone,
  Video,
  Heart
} from 'lucide-react';

interface FastActionsProps {
  className?: string;
}

export default function FastActions({ className = '' }: FastActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const handleAction = (path: string, event?: React.MouseEvent) => {
    // Proteção anti-automação
    if (event && (!event.isTrusted || event.detail === 0)) {
      console.warn('[FastActions] Ação bloqueada - evento não confiável');
      return;
    }

    console.log('[FastActions] Navegando para:', path);
    try {
      router.push(path);
      setIsExpanded(false); // Fechar o menu após navegação
    } catch (error) {
      console.error('[FastActions] Erro na navegação:', error);
    }
  };

  const quickActions = [
    {
      icon: Pill,
      label: 'Nova Prescrição',
      path: '/prescricoes/nova',
      color: 'bg-emerald-500 hover:bg-emerald-600',
      priority: 'critical'
    },
    {
      icon: FileText,
      label: 'Novo Atestado',
      path: '/documentos/criar/atestado',
      color: 'bg-blue-500 hover:bg-blue-600',
      priority: 'high'
    },
    {
      icon: Users,
      label: 'Novo Paciente',
      path: '/pacientes/novo',
      color: 'bg-purple-500 hover:bg-purple-600',
      priority: 'high'
    },
    {
      icon: Calendar,
      label: 'Agendar Consulta',
      path: '/consultas/nova',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      priority: 'medium'
    },
    {
      icon: Stethoscope,
      label: 'Exame Rápido',
      path: '/exames/novo',
      color: 'bg-teal-500 hover:bg-teal-600',
      priority: 'medium'
    },
    {
      icon: Search,
      label: 'Buscar Paciente',
      path: '/pacientes?focus=search',
      color: 'bg-orange-500 hover:bg-orange-600',
      priority: 'medium'
    },
    {
      icon: Shield,
      label: 'Emergência',
      path: '/emergencia',
      color: 'bg-red-500 hover:bg-red-600',
      priority: 'critical'
    },
    {
      icon: Video,
      label: 'Telemedicina',
      path: '/telemedicina/nova',
      color: 'bg-pink-500 hover:bg-pink-600',
      priority: 'low'
    }
  ];

  if (!isExpanded) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <button
          onClick={(e) => {
            if (e.isTrusted) {
              setIsExpanded(true);
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          aria-label="Abrir ações rápidas"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Overlay para fechar */}
      <div
        className="fixed inset-0 bg-black bg-opacity-20"
        onClick={() => setIsExpanded(false)}
      />

      {/* Container principal */}
      <div className="relative">
        {/* Ações rápidas */}
        <div className="flex flex-col-reverse space-y-reverse space-y-3 mb-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;

            return (
              <div
                key={action.path}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={(e) => handleAction(action.path, e)}
                  className={`flex items-center space-x-3 ${action.color} text-white rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 min-w-[200px] group`}
                  aria-label={action.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{action.label}</span>

                  {/* Indicador de prioridade */}
                  {action.priority === 'critical' && (
                    <div className="w-2 h-2 bg-white rounded-full opacity-75 ml-auto" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Botão de fechar */}
        <button
          onClick={() => setIsExpanded(false)}
          className="bg-gray-600 hover:bg-gray-700 text-white rounded-full p-4 shadow-lg transition-all duration-200"
          aria-label="Fechar ações rápidas"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Estilos para animações */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Pill, Users, FileText, Calendar, Stethoscope, Clock, AlertTriangle } from 'lucide-react';

export const QuickActionsBarSimple: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
    console.log('QuickActionsBarSimple mounted and ready');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        e.preventDefault();
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown, { passive: false });
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isExpanded]);

  const toggleExpanded = () => {
    console.log('Simple QuickActionsBar clicked, current state:', isExpanded);
    setIsExpanded(!isExpanded);
  };

  const navigateTo = (path: string) => {
    console.log('Navigating to:', path);
    router.push(path);
    setIsExpanded(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      right: '24px',
      bottom: '24px',
      zIndex: 9999
    }}>
      {/* Expanded Menu */}
      {isExpanded && (
        <div style={{
          position: 'absolute',
          bottom: '72px',
          right: '0',
          width: '380px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          border: '2px solid var(--border-color)',
          padding: '20px',
          marginBottom: '8px',
          zIndex: 10000,
          animation: 'slideUp 0.2s ease-out',
          maxHeight: '480px',
          overflowY: 'auto'
        }}>
          <style>
            {`
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
          <div style={{
            marginBottom: '16px',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            fontSize: '16px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '8px'
          }}>
            ⚡ Ações Rápidas
          </div>

          <button
            onClick={() => navigateTo('/prescricoes/nova')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Pill size={20} color="var(--accent-primary)" />
            <div>
              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Nova Prescrição</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Criar nova prescrição médica</div>
            </div>
          </button>

          <button
            onClick={() => navigateTo('/pacientes')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Users size={20} color="var(--accent-primary)" />
            <div>
              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Pacientes</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Gerenciar pacientes</div>
            </div>
          </button>

          <button
            onClick={() => navigateTo('/documentos')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FileText size={20} color="var(--accent-primary)" />
            <div>
              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Documentos</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Gerenciar documentos</div>
            </div>
          </button>

          <button
            onClick={() => navigateTo('/agendamento')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Calendar size={20} color="var(--success)" />
            <div>
              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Agendamento</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Agendar consultas</div>
            </div>
          </button>

          <button
            onClick={() => navigateTo('/consultas/nova')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Stethoscope size={20} color="var(--error)" />
            <div>
              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Nova Consulta</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Iniciar atendimento</div>
            </div>
          </button>

          <button
            onClick={() => navigateTo('/historico')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Clock size={20} color="var(--accent-secondary)" />
            <div>
              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Histórico</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Consultas anteriores</div>
            </div>
          </button>

          {/* Seção Emergência */}
          <div style={{
            borderTop: '2px solid var(--status-error-border)',
            paddingTop: '12px',
            marginTop: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'var(--status-error-text)',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              🚨 EMERGÊNCIA MÉDICA
            </div>

            <button
              onClick={() => {
                console.log('EMERGÊNCIA: Acionando protocolo de urgência');
                alert('🚨 Protocolo de Emergência Ativado!\n\nRedirecionando para atendimento prioritário...');
                navigateTo('/emergencia');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'var(--status-error-bg)',
                border: '2px solid var(--status-error-border)',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--status-error-bg)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <AlertTriangle size={24} color="var(--status-error-border)" />
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--status-error-text)', fontSize: '14px' }}>
                  EMERGÊNCIA
                </div>
                <div style={{ fontSize: '11px', color: 'var(--status-error-text)' }}>
                  Atendimento prioritário urgente
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleExpanded}
        onTouchStart={toggleExpanded}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: isExpanded ? 'var(--accent-secondary)' : 'var(--accent-primary)',
          border: '2px solid var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(37, 99, 235, 0.5)',
          transition: 'all 0.2s ease',
          fontSize: '0',
          outline: 'none',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-secondary)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isExpanded ? 'var(--accent-secondary)' : 'var(--accent-primary)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Ações Rápidas"
        aria-label="Botão de ações rápidas"
      >
        <Zap
          color="white"
          size={28}
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>
    </div>
  );
};

export default QuickActionsBarSimple;
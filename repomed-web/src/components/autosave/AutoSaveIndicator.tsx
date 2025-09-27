'use client';

/**
 * RepoMed IA v5.1 - Indicador de Auto-Save
 *
 * Componente visual para mostrar status do auto-save ao médico:
 * - Indicador discreto mas visível
 * - Feedback em tempo real
 * - Alertas para dados críticos
 * - Histórico de versões
 */

import React, { useState } from 'react';
import {
  Save,
  Clock,
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  RotateCcw,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  metrics: {
    totalSaves: number;
    criticalSaves: number;
    lastSave: number | null;
    lastCriticality: 'low' | 'medium' | 'high' | 'critical';
    storageUsed: number;
    hasUnsavedChanges: boolean;
  };
  onForceSave?: () => void;
  onLoadHistory?: () => any[];
  onClearHistory?: () => void;
  currentCriticality: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
  position?: 'fixed' | 'inline';
}

const CriticalityConfig = {
  low: {
    color: 'var(--text-aaa-secondary)',
    bg: '#f9fafb',
    icon: Save,
    label: 'Baixo'
  },
  medium: {
    color: '#d97706',
    bg: '#fef3c7',
    icon: Clock,
    label: 'Médio'
  },
  high: {
    color: '#dc2626',
    bg: '#fef2f2',
    icon: AlertTriangle,
    label: 'Alto'
  },
  critical: {
    color: '#7c2d12',
    bg: '#fed7d7',
    icon: Shield,
    label: 'Crítico'
  }
};

export default function AutoSaveIndicator({
  isSaving,
  lastSaved,
  metrics,
  onForceSave,
  onLoadHistory,
  onClearHistory,
  currentCriticality,
  className = '',
  position = 'fixed'
}: AutoSaveIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const config = CriticalityConfig[currentCriticality];
  const Icon = config.icon;

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Nunca';

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} h atrás`;

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getStatusIcon = () => {
    if (isSaving) return <RotateCcw className="w-4 h-4 animate-spin" />;
    if (metrics.hasUnsavedChanges) return <Clock className="w-4 h-4 text-orange-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isSaving) return 'Salvando...';
    if (metrics.hasUnsavedChanges) return 'Alterações pendentes';
    return 'Salvo';
  };

  const positionClasses = position === 'fixed'
    ? 'fixed bottom-4 left-4 z-50 w-80 shadow-lg'
    : 'w-full';

  return (
    <div
      className={`bg-white border-2 rounded-lg ${positionClasses} ${className}`}
      style={{
        borderColor: config.color,
        backgroundColor: isExpanded ? 'white' : config.bg
      }}
    >
      {/* Header Compacto */}
      <div
        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: config.color, color: 'white' }}
            >
              <Icon className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="font-medium text-base">{getStatusText()}</span>
              </div>
              <div className="text-base" style={{color: 'var(--text-aaa-secondary)'}}>
                {formatLastSaved(lastSaved)} • {config.label}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {currentCriticality === 'critical' && (
              <Shield className="w-4 h-4 text-red-600" />
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" style={{color: 'var(--text-aaa-secondary)'}} />
            ) : (
              <ChevronDown className="w-4 h-4" style={{color: 'var(--text-aaa-secondary)'}} />
            )}
          </div>
        </div>
      </div>

      {/* Detalhes Expandidos */}
      {isExpanded && (
        <div className="border-t p-4 space-y-4" style={{borderColor: 'var(--border)'}}>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-4 text-base">
            <div className="p-3 rounded" style={{backgroundColor: 'var(--bg-primary-safe)'}}>
              <div className="font-medium" style={{color: 'var(--text-aaa-secondary)'}}>Total de Salvamentos</div>
              <div className="text-lg font-bold" style={{color: 'var(--text-aaa-primary)'}}>{metrics.totalSaves}</div>
            </div>

            <div className="bg-red-50 p-3 rounded">
              <div className="font-medium text-red-700">Dados Críticos</div>
              <div className="text-lg font-bold text-red-900">{metrics.criticalSaves}</div>
            </div>
          </div>

          {/* Status Atual */}
          <div className="space-y-2">
            <div className="flex justify-between text-base">
              <span style={{color: 'var(--text-aaa-secondary)'}}>Criticidade Atual:</span>
              <span
                className="font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: config.bg,
                  color: config.color
                }}
              >
                {config.label}
              </span>
            </div>

            <div className="flex justify-between text-base">
              <span style={{color: 'var(--text-aaa-secondary)'}}>Armazenamento:</span>
              <span className="font-medium">{formatStorageSize(metrics.storageUsed)}</span>
            </div>

            {metrics.hasUnsavedChanges && (
              <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-base text-orange-800">
                  Existem alterações não salvas
                </span>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <button
              onClick={onForceSave}
              disabled={isSaving || !metrics.hasUnsavedChanges}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium"
            >
              <Save className="w-4 h-4" />
              Salvar Agora
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-base font-medium"
            >
              <History className="w-4 h-4" />
            </button>
          </div>

          {/* Histórico */}
          {showHistory && onLoadHistory && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-base">Histórico de Versões</h4>
                {onClearHistory && (
                  <button
                    onClick={onClearHistory}
                    className="text-base text-red-600 hover:text-red-800"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-32 overflow-y-auto">
                {onLoadHistory().slice(-5).reverse().map((version: any, index: number) => (
                  <div
                    key={version.version || index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-base"
                  >
                    <div>
                      <div className="font-medium">
                        Versão {version.version}
                      </div>
                      <div style={{ color: 'var(--text-aaa-secondary)' }}>
                        {new Date(version.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>

                    <div
                      className="px-2 py-1 rounded text-base font-medium"
                      style={{
                        backgroundColor: CriticalityConfig[version.criticality]?.bg || '#f9fafb',
                        color: CriticalityConfig[version.criticality]?.color || 'var(--text-aaa-secondary)'
                      }}
                    >
                      {CriticalityConfig[version.criticality]?.label || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aviso para Dados Críticos */}
          {currentCriticality === 'critical' && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-base">
                  <div className="font-medium text-red-800">Dados Críticos Detectados</div>
                  <div className="text-red-700 mt-1">
                    Este formulário contém informações médicas críticas.
                    O salvamento automático está otimizado para máxima segurança.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
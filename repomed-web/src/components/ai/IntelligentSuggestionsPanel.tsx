'use client';

/**
 * RepoMed IA v5.1 - Intelligent Suggestions Panel
 *
 * Painel de sugestões inteligentes para médicos:
 * - Reduz carga cognitiva com sugestões contextuais
 * - Alertas de segurança em tempo real
 * - Sugestões de dosagem baseadas em evidências
 * - Interface não-intrusiva que não interrompe o workflow
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Info,
  Check,
  X,
  Brain,
  Lightbulb,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { useIntelligentSuggestions, MedicalSuggestion, PatientContext, PrescriptionContext } from '@/hooks/useIntelligentSuggestions';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface IntelligentSuggestionsPanelProps {
  patientContext?: PatientContext;
  prescriptionContext?: PrescriptionContext;
  className?: string;
  position?: 'sidebar' | 'floating' | 'inline';
  maxSuggestions?: number;
}

const SuggestionTypeIcons = {
  dosage: Lightbulb,
  interaction: AlertTriangle,
  protocol: Shield,
  frequency: Clock,
  contraindication: AlertTriangle
};

const SeverityConfig = {
  info: {
    bgColor: 'var(--semantic-status-info)',
    borderColor: 'var(--status-info-border)',
    textColor: 'var(--semantic-text-primary)',
    icon: Info
  },
  warning: {
    bgColor: 'var(--semantic-status-warning)',
    borderColor: 'var(--status-warning-border)',
    textColor: 'var(--semantic-text-primary)',
    icon: AlertTriangle
  },
  critical: {
    bgColor: 'var(--semantic-status-critical)',
    borderColor: 'var(--status-error-border)',
    textColor: 'white',
    icon: AlertTriangle
  }
};

function SuggestionCard({ suggestion, onAction }: {
  suggestion: MedicalSuggestion;
  onAction: (action: string, suggestionId: string) => void;
}) {
  const TypeIcon = SuggestionTypeIcons[suggestion.type];
  const severityConfig = SeverityConfig[suggestion.severity];
  const [isExpanded, setIsExpanded] = useState(suggestion.severity === 'critical');

  return (
    <div
      className="semantic-card border-l-4 transition-all duration-200 hover:shadow-md"
      style={{
        borderLeftColor: severityConfig.borderColor,
        backgroundColor: suggestion.severity === 'critical' ? 'var(--status-error-bg)' : 'var(--semantic-bg-secondary)'
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: severityConfig.bgColor }}
        >
          <TypeIcon
            className="w-4 h-4"
            style={{ color: suggestion.severity === 'critical' ? 'white' : 'var(--semantic-text-primary)' }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4
              className="font-medium text-lg leading-tight"
              style={{ color: 'var(--semantic-text-primary)' }}
            >
              {suggestion.title}
            </h4>
            <div className="flex items-center gap-2">
              <StatusBadge
                status={suggestion.severity === 'critical' ? 'error' : suggestion.severity === 'warning' ? 'warning' : 'info'}
                showIcon={false}
                className="text-base px-2 py-1"
              >
                {suggestion.confidence}%
              </StatusBadge>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-opacity-20 rounded transition-colors"
                aria-label={isExpanded ? 'Recolher' : 'Expandir'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" style={{ color: 'var(--semantic-text-secondary)' }} />
                ) : (
                  <ChevronDown className="w-4 h-4" style={{ color: 'var(--semantic-text-secondary)' }} />
                )}
              </button>
            </div>
          </div>

          <p
            className="text-lg mb-2"
            style={{ color: 'var(--semantic-text-secondary)' }}
          >
            {suggestion.description}
          </p>

          {/* Expandable content */}
          {isExpanded && (
            <div className="mt-3 space-y-3">
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--semantic-bg-tertiary)',
                  borderColor: 'var(--semantic-border-default)'
                }}
              >
                <p
                  className="text-lg font-medium mb-1"
                  style={{ color: 'var(--semantic-text-primary)' }}
                >
                  💡 Sugestão:
                </p>
                <p
                  className="text-lg"
                  style={{ color: 'var(--semantic-text-secondary)' }}
                >
                  {suggestion.suggestion}
                </p>
              </div>

              {suggestion.sources && (
                <div className="text-base" style={{ color: 'var(--semantic-text-secondary)' }}>
                  <strong>Fontes:</strong> {suggestion.sources.join(', ')}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {suggestion.actions?.apply && (
                  <button
                    onClick={() => {
                      suggestion.actions?.apply?.();
                      onAction('apply', suggestion.id);
                    }}
                    className="semantic-action-primary text-white px-3 py-1 rounded text-base font-medium hover:opacity-90 transition-opacity"
                  >
                    <Check className="w-3 h-3 inline mr-1" />
                    Aplicar
                  </button>
                )}

                {suggestion.actions?.learnMore && (
                  <button
                    onClick={() => {
                      suggestion.actions?.learnMore?.();
                      onAction('learnMore', suggestion.id);
                    }}
                    className="semantic-card border px-3 py-1 rounded text-base font-medium hover:opacity-80 transition-opacity"
                    style={{
                      color: 'var(--semantic-text-primary)',
                      borderColor: 'var(--semantic-border-default)'
                    }}
                  >
                    Saiba Mais
                  </button>
                )}

                <button
                  onClick={() => {
                    suggestion.actions?.dismiss?.();
                    onAction('dismiss', suggestion.id);
                  }}
                  className="text-base px-3 py-1 rounded hover:bg-opacity-10 transition-colors"
                  style={{ color: 'var(--semantic-text-secondary)' }}
                >
                  <X className="w-3 h-3 inline mr-1" />
                  Dispensar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IntelligentSuggestionsPanel({
  patientContext,
  prescriptionContext,
  className = '',
  position = 'sidebar',
  maxSuggestions = 5
}: IntelligentSuggestionsPanelProps) {
  const { suggestions, isAnalyzing, metrics } = useIntelligentSuggestions({
    patientContext,
    prescriptionContext,
    enabled: true
  });

  const [isCollapsed, setIsCollapsed] = useState(false);

  const displayedSuggestions = suggestions.slice(0, maxSuggestions);
  const hasMore = suggestions.length > maxSuggestions;

  const handleSuggestionAction = (action: string, suggestionId: string) => {
    // Analytics para melhorar o sistema
    console.log(`Suggestion action: ${action} for ${suggestionId}`);
  };

  if (suggestions.length === 0 && !isAnalyzing) {
    return null; // Não mostrar painel vazio
  }

  const positionClasses = {
    sidebar: 'w-80',
    floating: 'fixed bottom-4 right-4 w-96 z-50 shadow-2xl',
    inline: 'w-full'
  };

  return (
    <div
      className={`semantic-card ${positionClasses[position]} ${className}`}
      role="complementary"
      aria-label="Sugestões Inteligentes de IA"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--semantic-border-default)' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--semantic-action-primary)' }}
          >
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3
              className="font-semibold text-lg"
              style={{ color: 'var(--semantic-text-primary)' }}
            >
              IA Assistente
            </h3>
            <p
              className="text-base"
              style={{ color: 'var(--semantic-text-secondary)' }}
            >
              {metrics.totalSuggestions} sugestões
              {metrics.criticalSuggestions > 0 && (
                <span className="ml-2 text-red-500 font-medium">
                  • {metrics.criticalSuggestions} críticas
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAnalyzing && (
            <div
              className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--semantic-action-primary)' }}
            />
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-opacity-10 rounded transition-colors"
            aria-label={isCollapsed ? 'Expandir sugestões' : 'Recolher sugestões'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" style={{ color: 'var(--semantic-text-secondary)' }} />
            ) : (
              <ChevronUp className="w-4 h-4" style={{ color: 'var(--semantic-text-secondary)' }} />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="space-y-2 p-2 max-h-96 overflow-y-auto">
          {isAnalyzing && suggestions.length === 0 && (
            <div
              className="flex items-center justify-center p-6"
              style={{ color: 'var(--semantic-text-secondary)' }}
            >
              <Zap className="w-5 h-5 mr-2" />
              <span className="text-lg">Analisando contexto médico...</span>
            </div>
          )}

          {displayedSuggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onAction={handleSuggestionAction}
            />
          ))}

          {hasMore && (
            <div
              className="text-center p-3"
              style={{ color: 'var(--semantic-text-secondary)' }}
            >
              <p className="text-base">
                +{suggestions.length - maxSuggestions} sugestões adicionais
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer com métricas */}
      {!isCollapsed && suggestions.length > 0 && (
        <div
          className="border-t p-3 text-base"
          style={{
            borderColor: 'var(--semantic-border-default)',
            color: 'var(--semantic-text-secondary)'
          }}
        >
          <div className="flex items-center justify-between">
            <span>Confiança média: {metrics.averageConfidence}%</span>
            <span className="flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              Baseado em evidências
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
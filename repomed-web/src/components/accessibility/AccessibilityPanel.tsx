'use client';

/**
 * RepoMed IA v5.1 - Accessibility Control Panel
 *
 * Painel de controle de acessibilidade para pacientes idosos:
 * - Controles de fácil acesso
 * - Visualização clara do status
 * - Instruções em linguagem simples
 * - Botões grandes e bem contrastados
 */

import React, { useState } from 'react';
import {
  Eye,
  Type,
  MousePointer,
  Volume2,
  Settings,
  RotateCcw,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  Stethoscope,
  Accessibility
} from 'lucide-react';
import { useAccessibilitySettings } from '@/hooks/useAccessibilitySettings';

interface AccessibilityPanelProps {
  position?: 'fixed' | 'inline';
  className?: string;
}

function SettingToggle({
  title,
  description,
  value,
  onChange,
  icon: Icon,
  disabled = false
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon: React.ComponentType<any>;
  disabled?: boolean;
}) {
  return (
    <div className="elderly-form-group border-b border-gray-200 pb-4">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: value ? 'var(--success-aaa, #006400)' : 'var(--bg-tertiary-aaa, #e9ecef)',
            color: value ? 'white' : 'var(--text-primary-aaa, #000000)'
          }}
        >
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <h3 className="elderly-text font-semibold mb-2">{title}</h3>
          <p className="elderly-text text-lg text-gray-600 mb-3">{description}</p>

          <button
            onClick={() => onChange(!value)}
            disabled={disabled}
            className={`elderly-button w-auto ${
              value ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              minHeight: '48px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            <div className="flex items-center gap-2">
              {value ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              {value ? 'Ativado' : 'Desativado'}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccessibilityPanel({ position = 'fixed', className = '' }: AccessibilityPanelProps) {
  const {
    settings,
    isLoading,
    isEnabled,
    toggleElderlyMode,
    toggleHighContrast,
    toggleMedicalMode,
    updateSettings,
    resetToDefaults,
    announceChange,
    metrics
  } = useAccessibilitySettings();

  const [isExpanded, setIsExpanded] = useState(false);

  if (!isEnabled || isLoading) {
    return null;
  }

  const positionClasses = position === 'fixed'
    ? 'fixed bottom-4 right-4 z-50 w-96 shadow-2xl'
    : 'w-full';

  return (
    <div
      className={`accessibility-enhanced bg-white border-4 border-black rounded-lg ${positionClasses} ${className}`}
      role="complementary"
      aria-label="Controles de Acessibilidade"
    >
      {/* Header */}
      <div className="elderly-form-group border-b border-gray-300 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center"
            >
              <Accessibility className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="elderly-text font-bold text-lg">Acessibilidade</h2>
              <p className="text-lg text-gray-600">
                {metrics.activeSettings} de {Object.keys(settings).length} opções ativas
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="elderly-button bg-gray-100 hover:bg-gray-200 text-gray-800 p-2"
            aria-label={isExpanded ? 'Recolher painel' : 'Expandir painel'}
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 max-h-96 overflow-y-auto">
          {/* Modos Rápidos */}
          <div className="elderly-form-group mb-6">
            <h3 className="elderly-text font-bold mb-4">⚡ Ativação Rápida</h3>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  toggleElderlyMode();
                  announceChange('Modo para idosos alternado');
                }}
                className={`elderly-button w-full text-left p-4 ${
                  settings.elderlyMode ? 'bg-green-100 border-green-600' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Modo Idoso</div>
                    <div className="text-lg">Ativa todas as melhorias juntas</div>
                  </div>
                  {settings.elderlyMode && <Check className="w-5 h-5 text-green-600" />}
                </div>
              </button>

              <button
                onClick={() => {
                  toggleMedicalMode();
                  announceChange('Modo médico alternado');
                }}
                className={`elderly-button w-full text-left p-4 ${
                  settings.medicalHighContrast ? 'bg-blue-100 border-blue-600' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Modo Médico</div>
                    <div className="text-lg">Otimizado para prescrições</div>
                  </div>
                  {settings.medicalHighContrast && <Check className="w-5 h-5 text-blue-600" />}
                </div>
              </button>
            </div>
          </div>

          {/* Configurações Individuais */}
          <div className="elderly-form-group mb-6">
            <h3 className="elderly-text font-bold mb-4">🔧 Configurações Individuais</h3>

            <div className="space-y-4">
              <SettingToggle
                title="Alto Contraste"
                description="Cores mais fortes para melhor visibilidade"
                value={settings.highContrast}
                onChange={(value) => updateSettings({ highContrast: value })}
                icon={Eye}
              />

              <SettingToggle
                title="Texto Grande"
                description="Aumenta o tamanho de todo o texto"
                value={settings.largeText}
                onChange={(value) => updateSettings({ largeText: value })}
                icon={Type}
              />

              <SettingToggle
                title="Botões Grandes"
                description="Botões maiores e mais fáceis de clicar"
                value={settings.clickTargetsLarge}
                onChange={(value) => updateSettings({ clickTargetsLarge: value })}
                icon={MousePointer}
              />

              <SettingToggle
                title="Reduzir Movimento"
                description="Remove animações que podem causar desconforto"
                value={settings.reducedMotion}
                onChange={(value) => updateSettings({ reducedMotion: value })}
                icon={RotateCcw}
              />

              <SettingToggle
                title="Anúncios de Voz"
                description="Narração de mudanças para deficientes visuais"
                value={settings.voiceAnnouncements}
                onChange={(value) => updateSettings({ voiceAnnouncements: value })}
                icon={Volume2}
              />
            </div>
          </div>

          {/* Informações e Reset */}
          <div className="elderly-form-group border-t border-gray-300 pt-4">
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="elderly-text text-lg">
                  💡 <strong>Dica:</strong> Suas configurações são salvas automaticamente
                  e estarão disponíveis na próxima visita.
                </p>
              </div>

              <button
                onClick={() => {
                  resetToDefaults();
                  announceChange('Configurações de acessibilidade resetadas');
                }}
                className="elderly-button w-full bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
              >
                <div className="flex items-center justify-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Restaurar Padrões
                </div>
              </button>

              <div className="text-center text-lg" style={{ color: 'var(--text-aaa-secondary)' }}>
                Pontuação de Acessibilidade: {metrics.accessibilityScore}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle quando recolhido */}
      {!isExpanded && position === 'fixed' && (
        <div className="p-4">
          <div className="flex items-center justify-between text-lg text-gray-600">
            <span>{metrics.activeSettings} ativas</span>
            <button
              onClick={toggleElderlyMode}
              className="elderly-button bg-blue-600 text-white px-3 py-1 text-base"
            >
              {settings.elderlyMode ? '👴 ON' : '👴 OFF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
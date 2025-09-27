'use client';

/**
 * RepoMed IA v5.1 - Accessibility Settings Hook
 *
 * Controle centralizado de configurações de acessibilidade para pacientes idosos:
 * - Alto contraste AAA (7:1)
 * - Texto aumentado
 * - Redução de movimento
 * - Focus indicators melhorados
 * - Persistência no localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { useFeatureFlag } from '@/components/providers/FeatureFlagProvider';

export interface AccessibilitySettings {
  // Contraste e visibilidade
  highContrast: boolean;           // Modo alto contraste AAA
  largeText: boolean;              // Texto aumentado (18px+)
  extraLargeText: boolean;         // Texto extra grande (24px+)

  // Movimento e animações
  reducedMotion: boolean;          // Reduzir animações
  noAnimations: boolean;           // Desabilitar todas as animações

  // Interação
  enhancedFocus: boolean;          // Focus indicators maiores
  clickTargetsLarge: boolean;      // Botões maiores (56px+)

  // Específicos para idosos
  elderlyMode: boolean;            // Ativa todas as melhorias juntas
  voiceAnnouncements: boolean;     // Anúncios de tela (screen reader)
  simplifiedInterface: boolean;    // Interface simplificada

  // Configurações médicas
  medicalHighContrast: boolean;    // Contraste específico para prescrições
  printOptimized: boolean;         // Otimizado para impressão
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  extraLargeText: false,
  reducedMotion: false,
  noAnimations: false,
  enhancedFocus: false,
  clickTargetsLarge: false,
  elderlyMode: false,
  voiceAnnouncements: false,
  simplifiedInterface: false,
  medicalHighContrast: false,
  printOptimized: false,
};

const STORAGE_KEY = 'repomed-accessibility-settings';

// Detectar preferências do sistema
function detectSystemPreferences(): Partial<AccessibilitySettings> {
  if (typeof window === 'undefined') return {};

  const preferences: Partial<AccessibilitySettings> = {};

  // Detectar prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    preferences.reducedMotion = true;
  }

  // Detectar prefers-contrast (experimental)
  if (window.matchMedia('(prefers-contrast: high)').matches) {
    preferences.highContrast = true;
  }

  // Detectar se é dispositivo touch (tablets/móveis)
  if ('ontouchstart' in window) {
    preferences.clickTargetsLarge = true;
  }

  return preferences;
}

export function useAccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const isAccessibilityEnabled = useFeatureFlag('FF_A11Y_ENHANCED');

  // Carregar configurações do localStorage
  useEffect(() => {
    if (!isAccessibilityEnabled) {
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const systemPrefs = detectSystemPreferences();

      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...systemPrefs, ...parsed });
      } else {
        // Primeira visita: aplicar preferências do sistema
        setSettings({ ...DEFAULT_SETTINGS, ...systemPrefs });
      }
    } catch (error) {
      console.warn('Erro ao carregar configurações de acessibilidade:', error);
      setSettings({ ...DEFAULT_SETTINGS, ...detectSystemPreferences() });
    } finally {
      setIsLoading(false);
    }
  }, [isAccessibilityEnabled]);

  // Salvar configurações no localStorage
  const saveSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    if (!isAccessibilityEnabled) return;

    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Erro ao salvar configurações de acessibilidade:', error);
    }
  }, [settings, isAccessibilityEnabled]);

  // Aplicar classes CSS baseadas nas configurações
  useEffect(() => {
    if (!isAccessibilityEnabled || isLoading) return;

    const body = document.body;
    const html = document.documentElement;

    // Remover classes existentes
    body.classList.remove(
      'accessibility-enhanced',
      'high-contrast-mode',
      'elderly-optimized',
      'large-text-mode',
      'extra-large-text-mode',
      'reduced-motion-mode',
      'no-animations-mode',
      'enhanced-focus-mode',
      'large-targets-mode',
      'medical-contrast-mode'
    );

    // Aplicar classes baseadas nas configurações
    if (settings.elderlyMode || settings.highContrast) {
      body.classList.add('accessibility-enhanced');
    }

    if (settings.highContrast) {
      body.classList.add('high-contrast-mode');
    }

    if (settings.largeText) {
      body.classList.add('large-text-mode');
    }

    if (settings.extraLargeText) {
      body.classList.add('extra-large-text-mode');
    }

    if (settings.reducedMotion || settings.noAnimations) {
      body.classList.add('reduced-motion-mode');
    }

    if (settings.noAnimations) {
      body.classList.add('no-animations-mode');
    }

    if (settings.enhancedFocus) {
      body.classList.add('enhanced-focus-mode');
    }

    if (settings.clickTargetsLarge) {
      body.classList.add('large-targets-mode');
    }

    if (settings.elderlyMode) {
      body.classList.add('elderly-optimized');
    }

    if (settings.medicalHighContrast) {
      body.classList.add('medical-contrast-mode');
    }

    // Configurar CSS custom properties
    html.style.setProperty('--accessibility-font-scale',
      settings.extraLargeText ? '1.5' : settings.largeText ? '1.25' : '1'
    );

    html.style.setProperty('--accessibility-focus-width',
      settings.enhancedFocus ? '4px' : '2px'
    );

    html.style.setProperty('--accessibility-button-height',
      settings.clickTargetsLarge ? '56px' : '44px'
    );

  }, [settings, isAccessibilityEnabled, isLoading]);

  // Ações específicas
  const toggleElderlyMode = useCallback(() => {
    const newElderlyMode = !settings.elderlyMode;

    // Modo idoso ativa várias configurações juntas
    saveSettings({
      elderlyMode: newElderlyMode,
      largeText: newElderlyMode,
      enhancedFocus: newElderlyMode,
      clickTargetsLarge: newElderlyMode,
      reducedMotion: newElderlyMode,
      simplifiedInterface: newElderlyMode
    });
  }, [settings.elderlyMode, saveSettings]);

  const toggleHighContrast = useCallback(() => {
    saveSettings({ highContrast: !settings.highContrast });
  }, [settings.highContrast, saveSettings]);

  const toggleMedicalMode = useCallback(() => {
    const newMedicalMode = !settings.medicalHighContrast;

    // Modo médico ativa configurações específicas para prescrições
    saveSettings({
      medicalHighContrast: newMedicalMode,
      largeText: newMedicalMode,
      enhancedFocus: newMedicalMode,
      printOptimized: newMedicalMode
    });
  }, [settings.medicalHighContrast, saveSettings]);

  const resetToDefaults = useCallback(() => {
    const systemPrefs = detectSystemPreferences();
    setSettings({ ...DEFAULT_SETTINGS, ...systemPrefs });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Anunciar mudanças para screen readers
  const announceChange = useCallback((message: string) => {
    if (!settings.voiceAnnouncements) return;

    // Criar elemento para anúncio
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remover após anúncio
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [settings.voiceAnnouncements]);

  return {
    settings,
    isLoading,
    isEnabled: isAccessibilityEnabled,

    // Actions
    updateSettings: saveSettings,
    toggleElderlyMode,
    toggleHighContrast,
    toggleMedicalMode,
    resetToDefaults,
    announceChange,

    // Utilities
    getSettingValue: useCallback((key: keyof AccessibilitySettings) => settings[key], [settings]),

    // Estado computado
    isHighContrastActive: settings.highContrast || settings.elderlyMode || settings.medicalHighContrast,
    isLargeTextActive: settings.largeText || settings.extraLargeText || settings.elderlyMode,
    isReducedMotionActive: settings.reducedMotion || settings.noAnimations || settings.elderlyMode,

    // Métricas para analytics
    metrics: {
      activeSettings: Object.values(settings).filter(Boolean).length,
      isElderlyOptimized: settings.elderlyMode,
      accessibilityScore: Math.round(
        (Object.values(settings).filter(Boolean).length / Object.keys(settings).length) * 100
      )
    }
  };
}
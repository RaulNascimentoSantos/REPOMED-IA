'use client';

/**
 * RepoMed IA v5.1 - Feature Flag Provider
 *
 * Provider React para gerenciar feature flags em toda a aplicação.
 * Permite ativação/desativação segura de funcionalidades.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { FeatureFlags, getFeatureFlags, setFeatureFlags } from '@/config/feature-flags';

interface FeatureFlagContextType {
  flags: FeatureFlags;
  isFeatureEnabled: (flag: keyof FeatureFlags) => boolean;
  toggleFeature: (flag: keyof FeatureFlags, enabled: boolean) => void;
  updateFlags: (updates: Partial<FeatureFlags>) => void;
  resetToDefaults: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

interface FeatureFlagProviderProps {
  children: React.ReactNode;
  initialFlags?: Partial<FeatureFlags>;
}

export function FeatureFlagProvider({ children, initialFlags }: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    const current = getFeatureFlags();
    return initialFlags ? { ...current, ...initialFlags } : current;
  });

  useEffect(() => {
    // Aplicar flags iniciais se fornecidas
    if (initialFlags) {
      setFeatureFlags(initialFlags);
    }
  }, [initialFlags]);

  const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
    return flags[flag];
  };

  const toggleFeature = (flag: keyof FeatureFlags, enabled: boolean): void => {
    const newFlags = { ...flags, [flag]: enabled };
    setFlags(newFlags);
    setFeatureFlags({ [flag]: enabled });
  };

  const updateFlags = (updates: Partial<FeatureFlags>): void => {
    const newFlags = { ...flags, ...updates };
    setFlags(newFlags);
    setFeatureFlags(updates);
  };

  const resetToDefaults = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('repomed-feature-flags');
      window.location.reload();
    }
  };

  const value: FeatureFlagContextType = {
    flags,
    isFeatureEnabled,
    toggleFeature,
    updateFlags,
    resetToDefaults,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook para usar feature flags em componentes
 */
export function useFeatureFlags(): FeatureFlagContextType {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags deve ser usado dentro de FeatureFlagProvider');
  }
  return context;
}

/**
 * Hook para verificar uma feature flag específica
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(flag);
}

/**
 * Componente para renderização condicional baseada em feature flag
 */
interface FeatureGateProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const isEnabled = useFeatureFlag(feature);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}

/**
 * HOC para envolver componentes com feature flags
 */
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  feature: keyof FeatureFlags,
  fallback?: React.ComponentType<P>
) {
  return function FeatureFlaggedComponent(props: P) {
    const isEnabled = useFeatureFlag(feature);

    if (!isEnabled) {
      return fallback ? <fallback {...props} /> : null;
    }

    return <Component {...props} />;
  };
}

/**
 * Debug Panel removido para produção
 * Feature flags debug panel has been completely removed for production
 */
interface FeatureFlags {
  FF_SAFETY_GUARDS: boolean;
  FF_AUTOSAVE: boolean;
  FF_NAV_SHORTCUTS: boolean;
  FF_OFFLINE_READ: boolean;
  FF_ENHANCED_A11Y: boolean;
  FF_PERFORMANCE_MONITOR: boolean;
  FF_TELEMETRY: boolean;
}

const defaultFlags: FeatureFlags = {
  FF_SAFETY_GUARDS: false,
  FF_AUTOSAVE: false,
  FF_NAV_SHORTCUTS: false,
  FF_OFFLINE_READ: false,
  FF_ENHANCED_A11Y: false,
  FF_PERFORMANCE_MONITOR: false,
  FF_TELEMETRY: false
};

let cachedFlags: FeatureFlags | null = null;

export function getFeatureFlags(): FeatureFlags {
  if (cachedFlags) {
    return cachedFlags;
  }

  try {
    const stored = localStorage.getItem('feature-flags');
    if (stored) {
      const parsedFlags = JSON.parse(stored);
      cachedFlags = { ...defaultFlags, ...parsedFlags };
    } else {
      cachedFlags = { ...defaultFlags };
    }
  } catch {
    cachedFlags = { ...defaultFlags };
  }

  return cachedFlags;
}

export function setFeatureFlag(flag: keyof FeatureFlags, enabled: boolean): void {
  const currentFlags = getFeatureFlags();
  const newFlags = { ...currentFlags, [flag]: enabled };

  localStorage.setItem('feature-flags', JSON.stringify(newFlags));
  cachedFlags = newFlags;

  window.dispatchEvent(new CustomEvent('feature-flags-updated', {
    detail: { flag, enabled, flags: newFlags }
  }));
}

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return getFeatureFlags()[flag];
}

export function enableFeature(flag: keyof FeatureFlags): void {
  setFeatureFlag(flag, true);
}

export function disableFeature(flag: keyof FeatureFlags): void {
  setFeatureFlag(flag, false);
}

export function resetFeatureFlags(): void {
  localStorage.removeItem('feature-flags');
  cachedFlags = null;

  window.dispatchEvent(new CustomEvent('feature-flags-updated', {
    detail: { flags: getFeatureFlags() }
  }));
}

export function getAllFlags(): FeatureFlags {
  return { ...getFeatureFlags() };
}

export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  return isFeatureEnabled(flag);
}

export const FeatureFlagDescriptions: Record<keyof FeatureFlags, string> = {
  FF_SAFETY_GUARDS: 'Ativar validações de segurança médica avançadas',
  FF_AUTOSAVE: 'Ativar salvamento automático de formulários',
  FF_NAV_SHORTCUTS: 'Ativar atalhos de teclado para navegação',
  FF_OFFLINE_READ: 'Ativar modo offline para leitura de dados',
  FF_ENHANCED_A11Y: 'Ativar melhorias de acessibilidade médica',
  FF_PERFORMANCE_MONITOR: 'Ativar monitoramento de performance',
  FF_TELEMETRY: 'Ativar coleta de métricas de uso'
};

export const FeatureFlagCategories = {
  safety: ['FF_SAFETY_GUARDS'] as (keyof FeatureFlags)[],
  ux: ['FF_AUTOSAVE', 'FF_NAV_SHORTCUTS', 'FF_ENHANCED_A11Y'] as (keyof FeatureFlags)[],
  performance: ['FF_OFFLINE_READ', 'FF_PERFORMANCE_MONITOR'] as (keyof FeatureFlags)[],
  analytics: ['FF_TELEMETRY'] as (keyof FeatureFlags)[]
};

if (typeof window !== 'undefined') {
  (window as any).__REPOMED_FEATURE_FLAGS__ = {
    getFlags: getAllFlags,
    enable: enableFeature,
    disable: disableFeature,
    reset: resetFeatureFlags,
    isEnabled: isFeatureEnabled
  };
}
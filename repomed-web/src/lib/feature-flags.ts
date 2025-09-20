/**
 * RepoMed IA - Feature Flags
 * Sistema de controle de features para rollout seguro médico
 */

export interface FeatureFlags {
  FF_SAFETY_GUARDS: boolean;
  FF_AUTOSAVE: boolean;
  FF_NAV_SHORTCUTS: boolean;
  FF_OFFLINE_READ: boolean;
  FF_MEDICAL_VALIDATION: boolean;
  FF_ADVANCED_SEARCH: boolean;
  FF_PRESCRIPTION_AI: boolean;
  FF_TELEMETRY: boolean;
}

// Configuração padrão das feature flags
const defaultFlags: FeatureFlags = {
  // Core safety features - sempre habilitadas
  FF_SAFETY_GUARDS: true,
  FF_MEDICAL_VALIDATION: true,

  // UX enhancements - habilitadas
  FF_AUTOSAVE: true,
  FF_NAV_SHORTCUTS: true,
  FF_OFFLINE_READ: true,
  FF_TELEMETRY: true,

  // Advanced features - gradual rollout
  FF_ADVANCED_SEARCH: false,
  FF_PRESCRIPTION_AI: false,
};

// Environment-based overrides
const environmentFlags: Partial<FeatureFlags> = {
  // Development
  ...(process.env.NODE_ENV === 'development' && {
    FF_ADVANCED_SEARCH: true,
    FF_PRESCRIPTION_AI: true,
  }),

  // Production
  ...(process.env.NODE_ENV === 'production' && {
    FF_SAFETY_GUARDS: true,
    FF_MEDICAL_VALIDATION: true,
  }),
};

// Combine default and environment flags
export const featureFlags: FeatureFlags = {
  ...defaultFlags,
  ...environmentFlags,
  // Override with environment variables if available
  ...(typeof window !== 'undefined' && {
    FF_SAFETY_GUARDS: getEnvFlag('FF_SAFETY_GUARDS', defaultFlags.FF_SAFETY_GUARDS),
    FF_AUTOSAVE: getEnvFlag('FF_AUTOSAVE', defaultFlags.FF_AUTOSAVE),
    FF_NAV_SHORTCUTS: getEnvFlag('FF_NAV_SHORTCUTS', defaultFlags.FF_NAV_SHORTCUTS),
    FF_OFFLINE_READ: getEnvFlag('FF_OFFLINE_READ', defaultFlags.FF_OFFLINE_READ),
    FF_MEDICAL_VALIDATION: getEnvFlag('FF_MEDICAL_VALIDATION', defaultFlags.FF_MEDICAL_VALIDATION),
    FF_ADVANCED_SEARCH: getEnvFlag('FF_ADVANCED_SEARCH', defaultFlags.FF_ADVANCED_SEARCH),
    FF_PRESCRIPTION_AI: getEnvFlag('FF_PRESCRIPTION_AI', defaultFlags.FF_PRESCRIPTION_AI),
    FF_TELEMETRY: getEnvFlag('FF_TELEMETRY', defaultFlags.FF_TELEMETRY),
  }),
};

function getEnvFlag(key: string, defaultValue: boolean): boolean {
  if (typeof window === 'undefined') return defaultValue;

  const stored = localStorage.getItem(`featureFlag_${key}`);
  if (stored !== null) {
    return stored === 'true';
  }

  return defaultValue;
}

/**
 * Hook para verificar se uma feature flag está habilitada
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag];
}

/**
 * Função para habilitar/desabilitar feature flags em runtime (desenvolvimento)
 */
export function toggleFeatureFlag(flag: keyof FeatureFlags, enabled: boolean): void {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    localStorage.setItem(`featureFlag_${flag}`, enabled.toString());
    console.log(`🚩 Feature flag ${flag} ${enabled ? 'enabled' : 'disabled'}`);

    // Reload to apply changes
    window.location.reload();
  }
}

/**
 * Medical Safety Guards - sempre habilitadas em produção
 */
export function getMedicalSafetyLevel(): 'strict' | 'normal' | 'development' {
  if (process.env.NODE_ENV === 'production') return 'strict';
  if (featureFlags.FF_SAFETY_GUARDS) return 'normal';
  return 'development';
}

/**
 * Validação de contexto médico
 */
export function isMedicalContext(): boolean {
  return featureFlags.FF_MEDICAL_VALIDATION;
}

/**
 * Debug info para desenvolvimento
 */
export function getFeatureFlagsDebugInfo(): Record<string, any> {
  if (process.env.NODE_ENV === 'development') {
    return {
      flags: featureFlags,
      safetyLevel: getMedicalSafetyLevel(),
      medicalContext: isMedicalContext(),
      environment: process.env.NODE_ENV,
    };
  }
  return {};
}
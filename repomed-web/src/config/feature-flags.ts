/**
 * RepoMed IA v5.1 - Feature Flags Configuration
 *
 * Sistema de feature flags para rollout seguro de melhorias UX médicas.
 * Todas as flags começam desabilitadas (false) para segurança.
 */

export interface FeatureFlags {
  // 🔍 Flags de Auditoria e Validação
  FF_THEME_AUDIT: boolean;           // Habilita auditoria automática de temas
  FF_CONTRAST_VALIDATION: boolean;   // Validação de contraste em tempo real
  FF_PERFORMANCE_MONITOR: boolean;   // Monitor de performance médica

  // 🎨 Flags de Tema e Design v6.0
  FF_THEME_AWARE: boolean;          // Componentes theme-aware (CSS variables)
  FF_CLINICAL_THEME: boolean;       // Novo tema Clinical otimizado para medicina
  FF_SEMANTIC_TOKENS: boolean;      // Sistema de tokens semânticos

  // 🏠 Flags de UX e Interface
  FF_HOME_PROGRESSIVE: boolean;     // Progressive disclosure na home
  FF_HOME_ENTERPRISE: boolean;      // Home Enterprise 2025 - Ultra-safe wrapper
  FF_HOME_PRO_V9: boolean;          // Home PRO V9 - Re-arquitetura Visual & UX
  FF_MEDICAL_SHORTCUTS: boolean;    // Atalhos médicos otimizados
  FF_REDUCED_MOTION: boolean;       // Modo motion-reduced para acessibilidade

  // 🤖 Flags de IA e UX Preditivo v6.0
  FF_AI_SUGGESTIONS: boolean;       // Sugestões inteligentes de IA médica
  FF_SMART_AUTOFILL: boolean;       // Autofill inteligente baseado em contexto
  FF_PREDICTIVE_SEARCH: boolean;    // Busca preditiva para medicamentos
  FF_INTELLIGENT_FORMS: boolean;    // Formulários que se adaptam ao contexto

  // 🏥 Flags de Componentes Médicos v6.0
  FF_MEDICAL_NOTIFICATIONS: boolean; // Centro de notificações médicas avançado
  FF_AUTO_SAVE_SYSTEM: boolean;     // Sistema de auto-save inteligente
  FF_MEDICAL_VALIDATION: boolean;   // Validação médica em tempo real
  FF_FORM_WRAPPER: boolean;         // Wrapper avançado para formulários médicos

  // 🧪 Flags de QA e Testing
  FF_CROSS_THEME_TESTS: boolean;    // Testes automáticos cross-theme
  FF_A11Y_ENHANCED: boolean;        // Melhorias de acessibilidade médica
  FF_DEBUG_MODE: boolean;           // Modo debug para desenvolvimento
}

/**
 * Configuração padrão das feature flags
 * IMPORTANTE: Todas começam desabilitadas para rollout seguro
 */
const DEFAULT_FLAGS: FeatureFlags = {
  // Auditoria e Validação
  FF_THEME_AUDIT: false,
  FF_CONTRAST_VALIDATION: false,
  FF_PERFORMANCE_MONITOR: false,

  // Tema e Design v6.0
  FF_THEME_AWARE: false,
  FF_CLINICAL_THEME: false,
  FF_SEMANTIC_TOKENS: false,

  // UX e Interface
  FF_HOME_PROGRESSIVE: false,
  FF_HOME_ENTERPRISE: false,
  FF_HOME_PRO_V9: false,
  FF_MEDICAL_SHORTCUTS: false,
  FF_REDUCED_MOTION: false,

  // IA e UX Preditivo v6.0
  FF_AI_SUGGESTIONS: false,
  FF_SMART_AUTOFILL: false,
  FF_PREDICTIVE_SEARCH: false,
  FF_INTELLIGENT_FORMS: false,

  // Componentes Médicos v6.0
  FF_MEDICAL_NOTIFICATIONS: false,
  FF_AUTO_SAVE_SYSTEM: false,
  FF_MEDICAL_VALIDATION: false,
  FF_FORM_WRAPPER: false,

  // QA e Testing
  FF_CROSS_THEME_TESTS: false,
  FF_A11Y_ENHANCED: false,
  FF_DEBUG_MODE: false,
};

/**
 * Obtém as feature flags do localStorage ou environment
 * Prioridade: localStorage > environment > defaults
 */
export function getFeatureFlags(): FeatureFlags {
  // Base flags: DEFAULT + DEVELOPMENT (em desenvolvimento)
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseFlags = isDevelopment
    ? { ...DEFAULT_FLAGS, ...DEVELOPMENT_FLAGS }
    : DEFAULT_FLAGS;

  // Em ambiente de desenvolvimento, verificar localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('repomed-feature-flags');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...baseFlags, ...parsed };
      }
    } catch (error) {
      console.warn('Feature flags: erro ao ler localStorage', error);
    }
  }

  // Verificar variáveis de ambiente (para build/CI)
  if (typeof process !== 'undefined' && process.env) {
    const envFlags: Partial<FeatureFlags> = {};

    Object.keys(DEFAULT_FLAGS).forEach(key => {
      const envKey = `NEXT_PUBLIC_${key}`;
      if (process.env[envKey]) {
        envFlags[key as keyof FeatureFlags] = process.env[envKey] === 'true';
      }
    });

    return { ...baseFlags, ...envFlags };
  }

  return baseFlags;
}

/**
 * Salva feature flags no localStorage
 */
export function setFeatureFlags(flags: Partial<FeatureFlags>): void {
  if (typeof window !== 'undefined') {
    try {
      const current = getFeatureFlags();
      const updated = { ...current, ...flags };
      localStorage.setItem('repomed-feature-flags', JSON.stringify(updated));

      // Recarregar página para aplicar mudanças
      if (Object.keys(flags).length > 0) {
        console.log('Feature flags atualizadas, recarregando página...');
        window.location.reload();
      }
    } catch (error) {
      console.error('Feature flags: erro ao salvar', error);
    }
  }
}

/**
 * Hook para usar feature flags em componentes React
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[flag];
}

/**
 * Utilitário para verificar se uma flag está habilitada
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[flag];
}

/**
 * Reset completo das feature flags
 */
export function resetFeatureFlags(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('repomed-feature-flags');
    console.log('Feature flags resetadas para padrão');
    window.location.reload();
  }
}

/**
 * Configurações para desenvolvimento/debug
 */
export const DEVELOPMENT_FLAGS: Partial<FeatureFlags> = {
  FF_DEBUG_MODE: false,  // DESABILITADO - não deve aparecer em produção
  FF_THEME_AUDIT: true,

  // ✅ v6.0 ATIVO - Tema Clinical otimizado
  FF_CLINICAL_THEME: true,
  FF_THEME_AWARE: true,
  FF_SEMANTIC_TOKENS: true,

  // ❌ PERMANENTEMENTE DESATIVADO - auto-click bug
  FF_HOME_PROGRESSIVE: false,

  // ✅ v6.0 ATIVO - Home Enterprise Ultra-Safe (rollback test successful)
  FF_HOME_ENTERPRISE: true,

  // 🚧 v9.0 DESENVOLVIMENTO - Home PRO Re-arquitetura Visual
  FF_HOME_PRO_V9: true,

  // ✅ v6.0 ATIVO - IA e UX Preditivo
  FF_AI_SUGGESTIONS: true,
  FF_SMART_AUTOFILL: true,
  FF_PREDICTIVE_SEARCH: true,
  FF_INTELLIGENT_FORMS: true,

  // ✅ v6.0 ATIVO - Componentes Médicos Avançados
  FF_MEDICAL_NOTIFICATIONS: true,
  FF_AUTO_SAVE_SYSTEM: true,
  FF_MEDICAL_VALIDATION: true,
  FF_FORM_WRAPPER: true,

  // ✅ Acessibilidade e QA
  FF_A11Y_ENHANCED: true,
  FF_MEDICAL_SHORTCUTS: true,
};

/**
 * Configurações para staging/homologação
 */
export const STAGING_FLAGS: Partial<FeatureFlags> = {
  FF_THEME_AUDIT: true,
  FF_CONTRAST_VALIDATION: true,
  FF_CROSS_THEME_TESTS: true,
};

/**
 * Configurações para produção (apenas funcionalidades estáveis)
 */
export const PRODUCTION_FLAGS: Partial<FeatureFlags> = {
  // ✅ v6.0 PRODUÇÃO - Features testadas e estáveis
  FF_CLINICAL_THEME: true,          // Tema Clinical aprovado para produção
  FF_THEME_AWARE: true,             // Sistema de temas estável
  FF_SEMANTIC_TOKENS: true,         // Tokens semânticos consolidados

  // ✅ Componentes médicos estáveis
  FF_MEDICAL_NOTIFICATIONS: true,   // Notificações médicas aprovadas
  FF_AI_SUGGESTIONS: true,          // IA médica estável
  FF_A11Y_ENHANCED: true,          // Acessibilidade validada

  // 🚧 Features em rollout gradual
  FF_AUTO_SAVE_SYSTEM: false,      // Auto-save: aguardando aprovação final
  FF_MEDICAL_VALIDATION: false,    // Validação: testes em andamento
  FF_FORM_WRAPPER: false,          // Forms: QA pendente

  // ❌ Features ainda em desenvolvimento
  FF_SMART_AUTOFILL: false,        // Aguardando integração com API
  FF_PREDICTIVE_SEARCH: false,     // Performance sendo otimizada
  FF_INTELLIGENT_FORMS: false,     // UX sendo refinada
};
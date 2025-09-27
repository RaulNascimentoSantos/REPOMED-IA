/**
 * RepoMed IA v6.0 - Configuração de Arquitetura Frontend
 * Padrões e regras para evitar problemas de arquitetura
 */

// Layout Rules - Regras rigorosas para layouts
export const LAYOUT_RULES = {
  // NUNCA permitir múltiplos sidebars na mesma página
  SINGLE_SIDEBAR_ONLY: true,

  // SEMPRE usar MainLayout como wrapper único
  USE_MAIN_LAYOUT_WRAPPER: true,

  // NUNCA colocar layout dentro de páginas individuais
  NO_PAGE_LEVEL_LAYOUTS: true,

  // SEMPRE usar ClientWrapper para controle de rotas
  REQUIRE_CLIENT_WRAPPER: true
} as const;

// Navigation Rules - Regras para navegação
export const NAVIGATION_RULES = {
  // SEMPRE usar router.push para navegação
  USE_ROUTER_PUSH: true,

  // NUNCA usar window.location.href sem try/catch
  SAFE_NAVIGATION_ONLY: true,

  // SEMPRE ter fallback para erros de navegação
  REQUIRE_ERROR_HANDLING: true,

  // SEMPRE logar navegação para debug
  LOG_NAVIGATION: true
} as const;

// Component Rules - Regras para componentes
export const COMPONENT_RULES = {
  // SEMPRE usar 'use client' em componentes com hooks
  CLIENT_DIRECTIVE_FOR_HOOKS: true,

  // NUNCA misturar lógica de layout com lógica de negócio
  SEPARATE_LAYOUT_BUSINESS_LOGIC: true,

  // SEMPRE usar interfaces TypeScript para props
  REQUIRE_TYPESCRIPT_INTERFACES: true,

  // SEMPRE ter error boundaries para componentes críticos
  REQUIRE_ERROR_BOUNDARIES: true
} as const;

// Performance Rules - Regras de performance
export const PERFORMANCE_RULES = {
  // NUNCA usar setInterval sem cleanup
  NO_UNCLEANED_INTERVALS: true,

  // SEMPRE usar useCallback para funções de navegação
  USE_CALLBACK_FOR_NAVIGATION: true,

  // NUNCA fazer chamadas API desnecessárias
  AVOID_UNNECESSARY_API_CALLS: true,

  // SEMPRE usar lazy loading para componentes pesados
  USE_LAZY_LOADING: true
} as const;

// Search Rules - Regras para pesquisa
export const SEARCH_RULES = {
  // SEMPRE implementar pesquisa inteligente
  SMART_SEARCH_REQUIRED: true,

  // SEMPRE ter debounce em campos de pesquisa
  DEBOUNCE_SEARCH_INPUTS: true,

  // SEMPRE ter fallback para pesquisas vazias
  HANDLE_EMPTY_SEARCHES: true
} as const;

// Architecture Validation
export function validateArchitecture() {
  const violations: string[] = [];

  // Verificar se há múltiplos sidebars
  if (typeof window !== 'undefined') {
    const sidebars = document.querySelectorAll('[data-sidebar], .sidebar, [class*="sidebar"]');
    if (sidebars.length > 1) {
      violations.push('VIOLATION: Multiple sidebars detected');
    }
  }

  return {
    isValid: violations.length === 0,
    violations
  };
}

// Navigation Helper - Helper seguro para navegação
export function safeNavigate(router: any, path: string, context: string = 'Unknown') {
  try {
    console.log(`[Navigation] ${context} -> ${path}`);
    router.push(path);
    return true;
  } catch (error) {
    console.error(`[Navigation] Erro em ${context}:`, error);

    // Fallback seguro
    try {
      window.location.href = path;
      return true;
    } catch (fallbackError) {
      console.error(`[Navigation] Fallback falhou em ${context}:`, fallbackError);
      return false;
    }
  }
}

// Component Wrapper - Wrapper para componentes seguros
export function createErrorBoundaryWrapper<T extends object>(
  errorMessage: string = 'Erro no componente'
) {
  return function withErrorBoundary(Component: React.ComponentType<T>) {
    return function WrappedComponent(props: T) {
      try {
        return React.createElement(Component, props);
      } catch (error) {
        console.error(`[ErrorBoundary] ${errorMessage}:`, error);
        return React.createElement('div', {
          className: "p-4 bg-red-100 border border-red-400 rounded"
        }, [
          React.createElement('h3', {
            key: 'title',
            className: "text-red-800 font-semibold"
          }, 'Erro no Sistema'),
          React.createElement('p', {
            key: 'message',
            className: "text-red-600"
          }, errorMessage)
        ]);
      }
    };
  };
}

// Search Helper - Helper para pesquisa inteligente
export function smartSearch(query: string, router: any): boolean {
  if (!query || query.trim().length === 0) {
    console.log('[Search] Query vazia');
    return false;
  }

  const cleanQuery = query.toLowerCase().trim();

  // Mapeamento inteligente de termos para rotas
  const routeMap: Record<string, string> = {
    'paciente': '/pacientes',
    'pacientes': '/pacientes',
    'documento': '/documentos',
    'documentos': '/documentos',
    'receita': '/prescricoes',
    'receitas': '/prescricoes',
    'prescricao': '/prescricoes',
    'prescricoes': '/prescricoes',
    'consulta': '/consultas',
    'consultas': '/consultas',
    'agendamento': '/agendamento',
    'agenda': '/agendamento',
    'exame': '/exames',
    'exames': '/exames',
    'relatorio': '/relatorios',
    'relatorios': '/relatorios',
    'configuracao': '/configuracoes',
    'configuracoes': '/configuracoes',
    'config': '/configuracoes',
    'template': '/templates',
    'templates': '/templates',
    'assinatura': '/assinatura',
    'financeiro': '/financeiro',
    'historico': '/historico'
  };

  // Busca por correspondência exata
  for (const [term, route] of Object.entries(routeMap)) {
    if (cleanQuery.includes(term)) {
      return safeNavigate(router, route, 'SmartSearch');
    }
  }

  // Fallback para página de busca geral
  return safeNavigate(router, `/search?q=${encodeURIComponent(query)}`, 'SearchFallback');
}

export default {
  LAYOUT_RULES,
  NAVIGATION_RULES,
  COMPONENT_RULES,
  PERFORMANCE_RULES,
  SEARCH_RULES,
  validateArchitecture,
  safeNavigate,
  createErrorBoundaryWrapper,
  smartSearch
};
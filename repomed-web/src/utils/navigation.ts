/**
 * RepoMed IA v6.0 - Navigation Utilities
 * Funções centralizadas para navegação segura
 */

import { NextRouter } from 'next/router';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

type Router = NextRouter | AppRouterInstance;

/**
 * Navegação segura com fallback automático
 */
export function safeNavigate(
  router: Router,
  path: string,
  context: string = 'Unknown'
): boolean {
  try {
    console.log(`[Navigation] ${context} -> ${path}`);

    // Tentar router.push primeiro
    if ('push' in router && typeof router.push === 'function') {
      router.push(path);
      return true;
    }

    // Fallback para window.location
    throw new Error('Router.push não disponível');

  } catch (error) {
    console.error(`[Navigation] Erro em ${context}:`, error);

    // Fallback seguro
    try {
      if (typeof window !== 'undefined') {
        window.location.href = path;
        return true;
      }
    } catch (fallbackError) {
      console.error(`[Navigation] Fallback falhou em ${context}:`, fallbackError);
      return false;
    }
  }

  return false;
}

/**
 * Navegação com loading state
 */
export function safeNavigateWithLoading(
  router: Router,
  path: string,
  context: string = 'Unknown',
  setLoading?: (loading: boolean) => void
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (setLoading) setLoading(true);

      const success = safeNavigate(router, path, context);

      // Simular delay mínimo para UX
      setTimeout(() => {
        if (setLoading) setLoading(false);
        resolve(success);
      }, 100);

    } catch (error) {
      console.error(`[NavigationWithLoading] Erro em ${context}:`, error);
      if (setLoading) setLoading(false);
      resolve(false);
    }
  });
}

/**
 * Validar se uma rota é válida
 */
export function validateRoute(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Validações básicas
  if (!path.startsWith('/')) {
    return false;
  }

  // Lista de rotas válidas conhecidas
  const validRoutes = [
    '/home',
    '/pacientes',
    '/documentos',
    '/prescricoes',
    '/consultas',
    '/agendamento',
    '/exames',
    '/relatorios',
    '/configuracoes',
    '/templates',
    '/assinatura',
    '/financeiro',
    '/historico',
    '/notificacoes',
    '/sistema',
    '/kanban',
    '/urls',
    '/profile',
    '/telemedicina'
  ];

  // Verificar rotas exatas
  if (validRoutes.includes(path)) {
    return true;
  }

  // Verificar rotas com parâmetros
  const routePatterns = [
    /^\/pacientes\/\w+/,
    /^\/documentos\/criar\/\w+/,
    /^\/prescricoes\/\w+/,
    /^\/consultas\/\w+/,
    /^\/templates\/\w+/,
    /^\/sistema\/\w+/,
    /^\/auth\/\w+/
  ];

  return routePatterns.some(pattern => pattern.test(path));
}

/**
 * Navegação com validação de rota
 */
export function safeValidatedNavigate(
  router: Router,
  path: string,
  context: string = 'Unknown'
): boolean {
  if (!validateRoute(path)) {
    console.error(`[ValidatedNavigation] Rota inválida em ${context}: ${path}`);
    return false;
  }

  return safeNavigate(router, path, context);
}

export default {
  safeNavigate,
  safeNavigateWithLoading,
  validateRoute,
  safeValidatedNavigate
};
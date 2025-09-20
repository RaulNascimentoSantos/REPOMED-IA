import { QueryClient } from '@tanstack/react-query'

// ⚡ Configuração otimizada do QueryClient para RepoMed IA

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache padrão de 5 minutos
      staleTime: 1000 * 60 * 5,
      
      // Manter cache por 10 minutos
      gcTime: 1000 * 60 * 10,
      
      // Retry automático para falhas de rede
      retry: (failureCount, error) => {
        // Não retry para erros 4xx (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        // Retry até 3 vezes para outros erros
        return failureCount < 3
      },
      
      // Delay entre retries (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch quando janela ganha foco
      refetchOnWindowFocus: false,
      
      // Refetch quando reconecta à internet
      refetchOnReconnect: 'always',
      
      // Background refetch quando stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry para mutations críticas
      retry: (failureCount, error) => {
        // Não retry para erros de validação ou conflitos
        if (error?.response?.status === 400 || error?.response?.status === 409) {
          return false
        }
        return failureCount < 2
      },
      
      // Network error handling
      onError: (error) => {
        console.error('Mutation error:', error)
        
        // Notify user of error
        if (error?.response?.status >= 500) {
          // Show global error toast for server errors
          console.error('Server error - consider showing user notification')
        }
      }
    }
  }
})

// Query Keys para organização e type safety
export const queryKeys = {
  // Documentos
  documents: {
    all: ['documents'],
    lists: () => [...queryKeys.documents.all, 'list'],
    list: (filters) => [...queryKeys.documents.lists(), filters],
    details: () => [...queryKeys.documents.all, 'detail'],
    detail: (id) => [...queryKeys.documents.details(), id],
    pdf: (id) => [...queryKeys.documents.all, 'pdf', id],
    stats: () => [...queryKeys.documents.all, 'stats'],
  },
  
  // Pacientes
  patients: {
    all: ['patients'],
    lists: () => [...queryKeys.patients.all, 'list'],
    list: (filters) => [...queryKeys.patients.lists(), filters],
    details: () => [...queryKeys.patients.all, 'detail'],
    detail: (id) => [...queryKeys.patients.details(), id],
    search: (query) => [...queryKeys.patients.all, 'search', query],
  },
  
  // Templates
  templates: {
    all: ['templates'],
    lists: () => [...queryKeys.templates.all, 'list'],
    list: (filters) => [...queryKeys.templates.lists(), filters],
    details: () => [...queryKeys.templates.all, 'detail'],
    detail: (id) => [...queryKeys.templates.details(), id],
    bySpecialty: (specialty) => [...queryKeys.templates.all, 'specialty', specialty],
  },
  
  // Métricas
  metrics: {
    all: ['metrics'],
    dashboard: () => [...queryKeys.metrics.all, 'dashboard'],
    trends: (period) => [...queryKeys.metrics.all, 'trends', period],
    performance: () => [...queryKeys.metrics.all, 'performance'],
    detailed: (period) => [...queryKeys.metrics.all, 'detailed', period],
  },
  
  // Sistema
  system: {
    all: ['system'],
    health: () => [...queryKeys.system.all, 'health'],
    cache: () => [...queryKeys.system.all, 'cache'],
    performance: () => [...queryKeys.system.all, 'performance'],
  }
}

// Cache invalidation patterns
export const invalidationPatterns = {
  // Invalidar todos os documentos quando um é criado/atualizado
  onDocumentChange: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.documents.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.metrics.all })
  },
  
  // Invalidar dados do paciente quando atualizado
  onPatientChange: (patientId) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.patients.all })
    if (patientId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) })
    }
  },
  
  // Invalidar templates quando modificados
  onTemplateChange: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.templates.all })
  },
  
  // Invalidar métricas quando necessário
  onMetricsUpdate: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.metrics.all })
  }
}

// Prefetch strategies para melhor UX
export const prefetchStrategies = {
  // Prefetch documentos relacionados ao abrir detalhes
  prefetchRelatedDocuments: async (patientId) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.documents.list({ patientId }),
      queryFn: () => fetch(`/api/documents?patientId=${patientId}`).then(r => r.json()),
      staleTime: 1000 * 60 * 2 // 2 minutes
    })
  },
  
  // Prefetch templates populares
  prefetchPopularTemplates: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.templates.lists(),
      queryFn: () => fetch('/api/templates?popular=true').then(r => r.json()),
      staleTime: 1000 * 60 * 15 // 15 minutes - templates mudam pouco
    })
  },
  
  // Prefetch métricas do dashboard
  prefetchDashboardMetrics: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.metrics.dashboard(),
      queryFn: () => fetch('/api/metrics/dashboard').then(r => r.json()),
      staleTime: 1000 * 60 * 2 // 2 minutes
    })
  }
}

// Background sync para dados críticos
export const backgroundSync = {
  // Sincronizar métricas em background
  syncMetrics: () => {
    queryClient.refetchQueries({ queryKey: queryKeys.metrics.all })
  },
  
  // Sincronizar documentos não assinados
  syncPendingDocuments: () => {
    queryClient.refetchQueries({
      queryKey: queryKeys.documents.list({ status: 'pending' })
    })
  }
}

// Performance monitoring
let queryCount = 0
let cacheHits = 0

export const performanceMetrics = {
  incrementQuery: () => queryCount++,
  incrementCacheHit: () => cacheHits++,
  getStats: () => ({
    totalQueries: queryCount,
    cacheHits,
    hitRate: queryCount > 0 ? (cacheHits / queryCount) * 100 : 0
  }),
  reset: () => {
    queryCount = 0
    cacheHits = 0
  }
}

// Query client event listeners para métricas
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'added') {
    performanceMetrics.incrementQuery()
  }
  
  if (event.type === 'updated' && event.query.state.data) {
    // Check if data came from cache
    if (event.query.state.dataUpdateCount === 0) {
      performanceMetrics.incrementCacheHit()
    }
  }
})

export default queryClient
import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys, invalidationPatterns, prefetchStrategies, performanceMetrics } from '../lib/queryClient'

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085'

// ================ UTILITY FUNCTIONS ================

// Enhanced fetch with error handling and metrics
const apiFetch = async (endpoint, options = {}) => {
  performanceMetrics.incrementQuery()
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
    error.response = response
    error.status = response.status
    
    // Try to get error details from response
    try {
      const errorData = await response.json()
      error.data = errorData
      if (errorData.detail) error.message = errorData.detail
    } catch (e) {
      // Response is not JSON
    }
    
    throw error
  }

  return response.json()
}

// ================ DOCUMENT HOOKS ================

export const useDocuments = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.documents.list(filters),
    queryFn: () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      return apiFetch(`/api/documents?${params.toString()}`)
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: true,
  })
}

export const useDocument = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => apiFetch(`/api/documents/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes - detalhes mudam menos
    ...options
  })
}

export const useInfiniteDocuments = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.documents.list({ ...filters, infinite: true }),
    queryFn: ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ 
        ...filters, 
        page: pageParam.toString(),
        limit: '20' 
      })
      return apiFetch(`/api/documents?${params.toString()}`)
    },
    getNextPageParam: (lastPage, allPages) => {
      // Assume API returns hasMore or similar
      return lastPage.hasMore ? allPages.length + 1 : undefined
    },
    staleTime: 1000 * 60 * 1, // 1 minute for infinite scroll
  })
}

export const useCreateDocument = () => {
  return useMutation({
    mutationFn: (documentData) => 
      apiFetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify(documentData),
      }),
    onSuccess: () => {
      invalidationPatterns.onDocumentChange()
    },
    onError: (error) => {
      console.error('Failed to create document:', error)
    }
  })
}

export const useSignDocument = () => {
  return useMutation({
    mutationFn: ({ documentId, ...signData }) =>
      apiFetch('/api/documents/sign', {
        method: 'POST',
        body: JSON.stringify({ documentId, ...signData }),
      }),
    onSuccess: (data, variables) => {
      // Invalidate specific document and lists
      invalidationPatterns.onDocumentChange()
      
      // Update cache directly for better UX
      queryClient.setQueryData(
        queryKeys.documents.detail(variables.documentId),
        (oldData) => ({ ...oldData, ...data, isSigned: true })
      )
    }
  })
}

export const useDocumentPDF = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.documents.pdf(id),
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/documents/${id}/pdf`)
      if (!response.ok) throw new Error('Failed to generate PDF')
      return response.blob()
    },
    enabled: !!id && options.enabled !== false,
    staleTime: 1000 * 60 * 10, // PDFs são estáticos
    refetchOnWindowFocus: false,
  })
}

// ================ PATIENT HOOKS ================

export const usePatients = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.patients.list(filters),
    queryFn: () => {
      const params = new URLSearchParams(filters)
      return apiFetch(`/api/patients?${params.toString()}`)
    },
    staleTime: 1000 * 60 * 5, // Pacientes mudam menos frequentemente
  })
}

export const usePatient = (id) => {
  return useQuery({
    queryKey: queryKeys.patients.detail(id),
    queryFn: () => apiFetch(`/api/patients/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // Detalhes do paciente são mais estáveis
    onSuccess: (data) => {
      // Prefetch documentos relacionados
      if (data?.id) {
        prefetchStrategies.prefetchRelatedDocuments(data.id)
      }
    }
  })
}

export const usePatientSearch = (query, options = {}) => {
  return useQuery({
    queryKey: queryKeys.patients.search(query),
    queryFn: () => apiFetch(`/api/patients?search=${encodeURIComponent(query)}&limit=10`),
    enabled: query && query.length >= 2,
    staleTime: 1000 * 30, // 30 segundos para busca
    ...options
  })
}

export const useCreatePatient = () => {
  return useMutation({
    mutationFn: (patientData) =>
      apiFetch('/api/patients', {
        method: 'POST',
        body: JSON.stringify(patientData),
      }),
    onSuccess: () => {
      invalidationPatterns.onPatientChange()
    }
  })
}

// ================ TEMPLATE HOOKS ================

export const useTemplates = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.templates.list(filters),
    queryFn: () => {
      const params = new URLSearchParams(filters)
      return apiFetch(`/api/templates?${params.toString()}`)
    },
    staleTime: 1000 * 60 * 15, // Templates são mais estáticos
    onSuccess: () => {
      // Prefetch templates populares em background
      prefetchStrategies.prefetchPopularTemplates()
    }
  })
}

export const useTemplate = (id) => {
  return useQuery({
    queryKey: queryKeys.templates.detail(id),
    queryFn: () => apiFetch(`/api/templates/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 20, // Templates individuais são muito estáveis
  })
}

export const useTemplatesBySpecialty = (specialty) => {
  return useQuery({
    queryKey: queryKeys.templates.bySpecialty(specialty),
    queryFn: () => apiFetch(`/api/templates?specialty=${encodeURIComponent(specialty)}`),
    enabled: !!specialty,
    staleTime: 1000 * 60 * 15,
  })
}

// ================ METRICS HOOKS ================

export const useMetricsDashboard = () => {
  return useQuery({
    queryKey: queryKeys.metrics.dashboard(),
    queryFn: () => apiFetch('/api/metrics/dashboard'),
    staleTime: 1000 * 60 * 1, // 1 minuto - métricas precisam ser atuais
    refetchInterval: 1000 * 60 * 2, // Auto-refresh a cada 2 minutos
    refetchIntervalInBackground: true,
  })
}

export const useMetricsTrends = (period = '30days') => {
  return useQuery({
    queryKey: queryKeys.metrics.trends(period),
    queryFn: () => apiFetch(`/api/metrics/trends?period=${period}`),
    staleTime: 1000 * 60 * 5, // 5 minutos para trends
  })
}

export const useDetailedMetrics = (period = '7days') => {
  return useQuery({
    queryKey: queryKeys.metrics.detailed(period),
    queryFn: () => apiFetch(`/api/metrics/detailed?period=${period}`),
    staleTime: 1000 * 60 * 3, // 3 minutos
  })
}

export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: queryKeys.metrics.performance(),
    queryFn: () => apiFetch('/api/performance/report'),
    staleTime: 1000 * 30, // 30 segundos - performance é muito dinâmica
    refetchInterval: 1000 * 60, // Auto-refresh cada minuto
  })
}

// ================ SYSTEM HOOKS ================

export const useSystemHealth = () => {
  return useQuery({
    queryKey: queryKeys.system.health(),
    queryFn: () => apiFetch('/health'),
    staleTime: 1000 * 10, // 10 segundos
    refetchInterval: 1000 * 30, // Check cada 30 segundos
    retry: 1, // Menos retry para health checks
  })
}

export const useCacheStats = () => {
  return useQuery({
    queryKey: queryKeys.system.cache(),
    queryFn: () => apiFetch('/api/performance/cache/stats'),
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

// ================ SPECIALIZED HOOKS ================

// Hook para dados que precisam ser sincronizados em tempo real
export const useRealtimeData = (endpoint, options = {}) => {
  return useQuery({
    queryKey: ['realtime', endpoint],
    queryFn: () => apiFetch(endpoint),
    staleTime: 0, // Sempre considerar stale
    refetchInterval: options.interval || 5000, // 5 segundos default
    refetchIntervalInBackground: true,
    ...options
  })
}

// Hook para dados offline-first
export const useOfflineFirst = (queryKey, queryFn, fallbackData) => {
  return useQuery({
    queryKey,
    queryFn,
    initialData: fallbackData,
    staleTime: Infinity, // Nunca considera stale automaticamente
    gcTime: 1000 * 60 * 60 * 24, // Manter no cache por 24h
    networkMode: 'offlineFirst',
  })
}

// Hook para operações em lote
export const useBatchOperation = () => {
  return useMutation({
    mutationFn: ({ operations }) => 
      apiFetch('/api/batch', {
        method: 'POST',
        body: JSON.stringify({ operations }),
      }),
    onSuccess: () => {
      // Invalidar múltiplas caches
      invalidationPatterns.onDocumentChange()
      invalidationPatterns.onMetricsUpdate()
    }
  })
}
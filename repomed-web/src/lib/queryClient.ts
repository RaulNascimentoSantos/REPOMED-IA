import { QueryClient } from '@tanstack/react-query';

// Optimized query client for medical applications
// Focuses on data consistency, offline resilience, and performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Medical data caching strategy
      staleTime: 30 * 1000, // 30 seconds - medical data should be fresh
      gcTime: 5 * 60 * 1000, // 5 minutes - quick cleanup for memory efficiency

      // Network failure handling for medical environments
      retry: (count, err: any) => {
        const status = err?.status ?? 0;

        // Don't retry client errors (400-499)
        if (status >= 400 && status < 500) return false;

        // Retry network errors and server errors up to 3 times
        if (status >= 500 || status === 0) return count < 3;

        return count < 2;
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Enable background refetch for critical data
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,

      // Network mode for offline scenarios
      networkMode: 'offlineFirst',

      // Error handling
      throwOnError: false,

      // Performance optimizations
      structuralSharing: true
    },

    mutations: {
      // Critical mutations (prescriptions, patient data) should retry on network failure
      retry: (count, err: any) => {
        const status = err?.status ?? 0;

        // Don't retry validation errors
        if (status >= 400 && status < 500) return false;

        // Retry server errors and network failures
        return count < 2;
      },

      // Faster retry for mutations
      retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000),

      // Network mode for offline mutations
      networkMode: 'offlineFirst'
    }
  }
});

// Custom cache keys for medical data
export const cacheKeys = {
  // Patient data - most frequently accessed
  patients: {
    all: ['patients'] as const,
    list: (filters?: any) => ['patients', 'list', filters] as const,
    detail: (id: string) => ['patients', 'detail', id] as const,
    search: (query: string) => ['patients', 'search', query] as const
  },

  // Prescriptions - critical medical data
  prescriptions: {
    all: ['prescriptions'] as const,
    list: (filters?: any) => ['prescriptions', 'list', filters] as const,
    detail: (id: string) => ['prescriptions', 'detail', id] as const,
    recent: (limit: number = 10) => ['prescriptions', 'recent', limit] as const
  },

  // Documents - archival data
  documents: {
    all: ['documents'] as const,
    list: (filters?: any) => ['documents', 'list', filters] as const,
    detail: (id: string) => ['documents', 'detail', id] as const,
    templates: ['documents', 'templates'] as const
  },

  // User and session data
  user: {
    profile: ['user', 'profile'] as const,
    preferences: ['user', 'preferences'] as const,
    settings: ['user', 'settings'] as const
  }
};

// Query invalidation helpers for medical workflows
export const invalidateQueries = {
  // After creating/updating a patient
  patient: (id?: string) => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.patients.all });
    if (id) {
      queryClient.invalidateQueries({ queryKey: cacheKeys.patients.detail(id) });
    }
  },

  // After creating/updating a prescription
  prescription: (id?: string) => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.prescriptions.all });
    if (id) {
      queryClient.invalidateQueries({ queryKey: cacheKeys.prescriptions.detail(id) });
    }
    // Also invalidate recent prescriptions
    queryClient.invalidateQueries({ queryKey: cacheKeys.prescriptions.recent() });
  },

  // After creating/updating a document
  document: (id?: string) => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.documents.all });
    if (id) {
      queryClient.invalidateQueries({ queryKey: cacheKeys.documents.detail(id) });
    }
  },

  // Clear all caches (for logout or critical errors)
  all: () => {
    queryClient.clear();
  }
};

// Prefetch strategies for improved UX
export const prefetchStrategies = {
  // Prefetch patient list when navigating to patients section
  patientsSection: async () => {
    await queryClient.prefetchQuery({
      queryKey: cacheKeys.patients.list(),
      queryFn: () => fetch('http://localhost:8081/patients').then(res => res.json()),
      staleTime: 60 * 1000 // 1 minute
    });
  },

  // Prefetch recent prescriptions for dashboard
  dashboardData: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: cacheKeys.prescriptions.recent(5),
        queryFn: () => fetch('http://localhost:8081/prescriptions?limit=5').then(res => res.json()),
        staleTime: 30 * 1000
      }),
      queryClient.prefetchQuery({
        queryKey: cacheKeys.patients.list({ limit: 10 }),
        queryFn: () => fetch('http://localhost:8081/patients?limit=10').then(res => res.json()),
        staleTime: 60 * 1000
      })
    ]);
  }
};

// Offline data utilities
export const offlineUtils = {
  // Get cached data for offline mode
  getCachedData: <T>(queryKey: any[]): T | undefined => {
    return queryClient.getQueryData(queryKey);
  },

  // Check if data is available offline
  isDataAvailable: (queryKey: any[]): boolean => {
    const data = queryClient.getQueryData(queryKey);
    return data !== undefined;
  },

  // Get last 10 entries of any type for offline mode
  getLastEntries: (type: 'patients' | 'prescriptions' | 'documents') => {
    const allQueries = queryClient.getQueryCache().getAll();
    return allQueries
      .filter(query => query.queryKey[0] === type)
      .map(query => query.state.data)
      .filter(Boolean)
      .slice(0, 10);
  }
};
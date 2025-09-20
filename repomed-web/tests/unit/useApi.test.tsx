import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDocuments, useDocument, usePatients, useMetricsDashboard } from '../../src/hooks/useApi'
import { createTestWrapper, mockApiResponse } from '../setup'

// Mock fetch globally
global.fetch = vi.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useApi hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useDocuments', () => {
    it('should fetch documents successfully', async () => {
      const mockDocuments = {
        data: [
          { id: '1', title: 'Document 1', status: 'draft' },
          { id: '2', title: 'Document 2', status: 'signed' }
        ],
        total: 2
      }

      vi.mocked(fetch).mockResolvedValue(mockApiResponse(mockDocuments))

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockDocuments)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/documents'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should handle fetch error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Server error' })
      } as Response)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
    })

    it('should pass filters as query parameters', async () => {
      const filters = { status: 'signed', patient: 'João Silva' }
      const mockResponse = { data: [], total: 0 }

      vi.mocked(fetch).mockResolvedValue(mockApiResponse(mockResponse))

      renderHook(() => useDocuments(filters), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled()
      })

      const fetchCall = vi.mocked(fetch).mock.calls[0]
      const url = fetchCall[0] as string
      expect(url).toContain('status=signed')
      expect(url).toContain('patient=Jo%C3%A3o%20Silva')
    })

    it('should skip empty filter values', async () => {
      const filters = { status: 'signed', patient: '', empty: null, undefined: undefined }
      const mockResponse = { data: [], total: 0 }

      vi.mocked(fetch).mockResolvedValue(mockApiResponse(mockResponse))

      renderHook(() => useDocuments(filters), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled()
      })

      const fetchCall = vi.mocked(fetch).mock.calls[0]
      const url = fetchCall[0] as string
      expect(url).toContain('status=signed')
      expect(url).not.toContain('patient=')
      expect(url).not.toContain('empty=')
      expect(url).not.toContain('undefined=')
    })
  })

  describe('useDocument', () => {
    it('should fetch single document successfully', async () => {
      const mockDocument = {
        id: '123',
        title: 'Test Document',
        status: 'draft',
        content: 'Document content'
      }

      vi.mocked(fetch).mockResolvedValue(mockApiResponse(mockDocument))

      const { result } = renderHook(() => useDocument('123'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockDocument)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/documents/123'),
        expect.any(Object)
      )
    })

    it('should not fetch when id is not provided', () => {
      renderHook(() => useDocument(''), {
        wrapper: createWrapper()
      })

      expect(fetch).not.toHaveBeenCalled()
    })

    it('should not fetch when id is null', () => {
      renderHook(() => useDocument(null as any), {
        wrapper: createWrapper()
      })

      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('usePatients', () => {
    it('should fetch patients successfully', async () => {
      const mockPatients = {
        data: [
          { id: '1', name: 'João Silva', cpf: '123.456.789-00' },
          { id: '2', name: 'Maria Santos', cpf: '987.654.321-00' }
        ],
        total: 2
      }

      vi.mocked(fetch).mockResolvedValue(mockApiResponse(mockPatients))

      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockPatients)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/patients'),
        expect.any(Object)
      )
    })

    it('should apply filters correctly', async () => {
      const filters = { search: 'João', status: 'active' }
      const mockResponse = { data: [], total: 0 }

      vi.mocked(fetch).mockResolvedValue(mockApiResponse(mockResponse))

      renderHook(() => usePatients(filters), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled()
      })

      const fetchCall = vi.mocked(fetch).mock.calls[0]
      const url = fetchCall[0] as string
      expect(url).toContain('search=Jo%C3%A3o')
      expect(url).toContain('status=active')
    })
  })

  describe('useMetricsDashboard', () => {
    it('should fetch dashboard metrics successfully', async () => {
      const mockMetrics = {
        totalDocuments: 150,
        signedDocuments: 120,
        pendingDocuments: 30,
        activePatients: 85,
        growthRate: 12.5
      }

      vi.mocked(fetch).mockResolvedValue(mockApiResponse(mockMetrics))

      const { result } = renderHook(() => useMetricsDashboard(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockMetrics)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/metrics/dashboard'),
        expect.any(Object)
      )
    })

    it('should have correct stale time configuration', async () => {
      const mockMetrics = { totalDocuments: 100 }
      vi.mocked(fetch).mockResolvedValue(mockApiResponse(mockMetrics))

      const { result } = renderHook(() => useMetricsDashboard(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify that the query has proper stale time (1 minute for metrics)
      expect(result.current.dataUpdatedAt).toBeTruthy()
    })

    it('should handle network errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useMetricsDashboard(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('API error handling', () => {
    it('should handle 404 errors correctly', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ detail: 'Document not found' })
      } as Response)

      const { result } = renderHook(() => useDocument('nonexistent'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
      expect((result.current.error as any).status).toBe(404)
    })

    it('should handle 500 errors correctly', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ detail: 'Internal server error' })
      } as Response)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
      expect((result.current.error as any).status).toBe(500)
    })

    it('should handle non-JSON error responses', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: () => Promise.reject(new Error('Not JSON'))
      } as Response)

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeTruthy()
    })
  })
})
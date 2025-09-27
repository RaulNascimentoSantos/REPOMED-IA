import { FastifyRequest, FastifyReply } from 'fastify'
import { MetricsTracker } from '../metrics/prometheus'

// Middleware to track HTTP requests automatically
export const metricsMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const startTime = Date.now()
  const timerKey = `http_${request.id}`
  
  // Start timing
  MetricsTracker.startTimer(timerKey)
  
  // Hook into the response to capture metrics
  reply.raw.on('finish', () => {
    const duration = MetricsTracker.endTimer(timerKey)
    const method = request.method
    const route = getRoutePattern(request.url)
    const statusCode = reply.statusCode
    
    // Track the HTTP request
    MetricsTracker.trackHttpRequest(method, route, statusCode, duration)
    
    // Track errors for 4xx/5xx responses
    if (statusCode >= 400) {
      const errorType = statusCode >= 500 ? 'server_error' : 'client_error'
      const severity = statusCode >= 500 ? 'high' : 'medium'
      MetricsTracker.trackError(errorType, severity, 'http_api')
    }
  })
}

// Helper function to normalize route patterns
function getRoutePattern(url: string): string {
  // Remove query parameters
  const path = url.split('?')[0]
  
  // Common route patterns for the RepoMed API
  const patterns = [
    { pattern: /^\/health$/, replacement: '/health' },
    { pattern: /^\/metrics$/, replacement: '/metrics' },
    { pattern: /^\/api\/auth\/register$/, replacement: '/api/auth/register' },
    { pattern: /^\/api\/auth\/login$/, replacement: '/api/auth/login' },
    { pattern: /^\/api\/documents\/[\w-]+\/sign$/, replacement: '/api/documents/:id/sign' },
    { pattern: /^\/api\/documents\/[\w-]+\/pdf$/, replacement: '/api/documents/:id/pdf' },
    { pattern: /^\/api\/documents\/[\w-]+$/, replacement: '/api/documents/:id' },
    { pattern: /^\/api\/documents$/, replacement: '/api/documents' },
    { pattern: /^\/api\/patients\/[\w-]+\/edit$/, replacement: '/api/patients/:id/edit' },
    { pattern: /^\/api\/patients\/[\w-]+$/, replacement: '/api/patients/:id' },
    { pattern: /^\/api\/patients$/, replacement: '/api/patients' },
    { pattern: /^\/api\/templates\/[\w-]+$/, replacement: '/api/templates/:id' },
    { pattern: /^\/api\/templates$/, replacement: '/api/templates' },
    { pattern: /^\/api\/metrics\/\w+$/, replacement: '/api/metrics/:type' },
    { pattern: /^\/api\/performance\/\w+$/, replacement: '/api/performance/:type' }
  ]
  
  for (const { pattern, replacement } of patterns) {
    if (pattern.test(path)) {
      return replacement
    }
  }
  
  // Default: remove IDs and common dynamic segments
  return path
    .replace(/\/[a-f0-9-]{36}/g, '/:uuid')  // UUIDs
    .replace(/\/\d+/g, '/:id')               // Numeric IDs
    .replace(/\/[\w-]{10,}/g, '/:id')        // Long alphanumeric IDs
}

// Database instrumentation wrapper
export function instrumentDatabase<T extends (...args: any[]) => Promise<any>>(
  operation: string,
  table: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    const timerKey = `db_${operation}_${table}_${Date.now()}`
    MetricsTracker.startTimer(timerKey)
    
    try {
      const result = await fn(...args)
      const duration = MetricsTracker.endTimer(timerKey)
      MetricsTracker.trackDatabaseQuery(operation, table, duration, true)
      return result
    } catch (error) {
      const duration = MetricsTracker.endTimer(timerKey)
      MetricsTracker.trackDatabaseQuery(operation, table, duration, false)
      MetricsTracker.trackError('database_error', 'high', 'database')
      throw error
    }
  }) as T
}

// Cache instrumentation wrapper
export function instrumentCache<T extends (...args: any[]) => Promise<any>>(
  operation: 'get' | 'set' | 'del',
  fn: T
): T {
  return (async (...args: any[]) => {
    try {
      const result = await fn(...args)
      
      if (operation === 'get') {
        // For get operations, null/undefined result means cache miss
        const hit = result !== null && result !== undefined
        MetricsTracker.trackCacheOperation(operation, hit)
      } else {
        // For set/del operations, success if no error thrown
        MetricsTracker.trackCacheOperation(operation, true)
      }
      
      return result
    } catch (error) {
      MetricsTracker.trackCacheOperation(operation, false)
      MetricsTracker.trackError('cache_error', 'medium', 'cache')
      throw error
    }
  }) as T
}

// PDF generation instrumentation wrapper
export function instrumentPdfGeneration<T extends (...args: any[]) => Promise<any>>(
  templateId: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    const timerKey = `pdf_${templateId}_${Date.now()}`
    MetricsTracker.startTimer(timerKey)
    
    try {
      const result = await fn(...args)
      const duration = MetricsTracker.endTimer(timerKey)
      MetricsTracker.trackPdfGeneration(templateId, duration, true)
      return result
    } catch (error) {
      const duration = MetricsTracker.endTimer(timerKey)
      MetricsTracker.trackPdfGeneration(templateId, duration, false)
      MetricsTracker.trackError('pdf_generation_error', 'medium', 'pdf')
      throw error
    }
  }) as T
}

// Document signing instrumentation wrapper
export function instrumentDocumentSigning<T extends (...args: any[]) => Promise<any>>(
  provider: string,
  templateId: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    const timerKey = `sign_${provider}_${Date.now()}`
    MetricsTracker.startTimer(timerKey)
    
    try {
      const result = await fn(...args)
      const duration = MetricsTracker.endTimer(timerKey)
      MetricsTracker.trackDocumentSigned(provider, templateId, duration)
      return result
    } catch (error) {
      MetricsTracker.endTimer(timerKey)
      MetricsTracker.trackError('signing_error', 'high', 'signature')
      throw error
    }
  }) as T
}

// Authentication instrumentation wrapper
export function instrumentAuthentication<T extends (...args: any[]) => Promise<any>>(
  method: string,
  fn: T
): T {
  return (async (...args: any[]) => {
    const timerKey = `auth_${method}_${Date.now()}`
    MetricsTracker.startTimer(timerKey)
    
    try {
      const result = await fn(...args)
      const duration = MetricsTracker.endTimer(timerKey)
      MetricsTracker.trackAuthentication(method, duration, true)
      return result
    } catch (error) {
      const duration = MetricsTracker.endTimer(timerKey)
      MetricsTracker.trackAuthentication(method, duration, false)
      MetricsTracker.trackError('authentication_error', 'high', 'auth')
      throw error
    }
  }) as T
}

// Business metrics update function (called periodically)
export async function updateBusinessMetrics(dependencies: {
  database: any
  cache: any
}) {
  try {
    const timerKey = `business_metrics_${Date.now()}`
    MetricsTracker.startTimer(timerKey)
    
    // Query current counts from database
    const [documentsResult, patientsResult] = await Promise.allSettled([
      dependencies.database?.query('SELECT COUNT(*) as count FROM documents'),
      dependencies.database?.query('SELECT COUNT(*) as count FROM patients')
    ])
    
    const documentsCount = documentsResult.status === 'fulfilled' 
      ? parseInt(documentsResult.value?.rows?.[0]?.count || '0')
      : 0
    
    const patientsCount = patientsResult.status === 'fulfilled'
      ? parseInt(patientsResult.value?.rows?.[0]?.count || '0') 
      : 0
    
    // Get cache stats if available
    let cacheStats = { keys: 0, hitRatio: 0 }
    try {
      cacheStats = await dependencies.cache?.getStats() || cacheStats
    } catch (error) {
      // Cache stats not available
    }
    
    // Update metrics
    MetricsTracker.updateBusinessMetrics({
      documents: documentsCount,
      patients: patientsCount,
      cacheKeys: cacheStats.keys,
      cacheHitRatio: cacheStats.hitRatio
    })
    
    const duration = MetricsTracker.endTimer(timerKey)
    
    // Track the metrics update itself
    if (duration < 1) {
      // Successful if under 1 second
      MetricsTracker.trackHealthCheck('metrics_update', duration, true)
    }
    
  } catch (error) {
    MetricsTracker.trackError('metrics_update_error', 'medium', 'metrics')
  }
}
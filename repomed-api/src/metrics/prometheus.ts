import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client'

// Enable default Node.js metrics collection
collectDefaultMetrics({ register })

// Business Metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
})

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
})

// Document Metrics
export const documentsTotal = new Gauge({
  name: 'documents_total',
  help: 'Total number of documents in the system',
  registers: [register]
})

export const documentsCreated = new Counter({
  name: 'documents_created_total',
  help: 'Total number of documents created',
  labelNames: ['template_id', 'status'],
  registers: [register]
})

export const documentsSigned = new Counter({
  name: 'documents_signed_total',
  help: 'Total number of documents signed',
  labelNames: ['provider', 'template_id'],
  registers: [register]
})

export const documentsSigningDuration = new Histogram({
  name: 'documents_signing_duration_seconds',
  help: 'Time taken to sign documents',
  labelNames: ['provider'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [register]
})

// PDF Generation Metrics
export const pdfGenerationTotal = new Counter({
  name: 'pdf_generation_total',
  help: 'Total number of PDFs generated',
  labelNames: ['template_id', 'status'],
  registers: [register]
})

export const pdfGenerationDuration = new Histogram({
  name: 'pdf_generation_duration_seconds',
  help: 'Time taken to generate PDFs',
  labelNames: ['template_id'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register]
})

// Database Metrics  
export const databaseConnectionsActive = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
  registers: [register]
})

export const databaseQueriesTotal = new Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status'],
  registers: [register]
})

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Database query execution time',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2],
  registers: [register]
})

// Cache Metrics
export const cacheOperationsTotal = new Counter({
  name: 'cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'status'],
  registers: [register]
})

export const cacheHitRatio = new Gauge({
  name: 'cache_hit_ratio',
  help: 'Cache hit ratio (0-1)',
  registers: [register]
})

export const cacheKeysTotal = new Gauge({
  name: 'cache_keys_total',
  help: 'Total number of keys in cache',
  registers: [register]
})

// Authentication Metrics
export const authenticationAttempts = new Counter({
  name: 'authentication_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['method', 'status'],
  registers: [register]
})

export const authenticationDuration = new Histogram({
  name: 'authentication_duration_seconds',
  help: 'Time taken for authentication',
  labelNames: ['method'],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register]
})

// API Health Metrics
export const healthCheckStatus = new Gauge({
  name: 'health_check_status',
  help: 'Health check status (1 = healthy, 0 = unhealthy)',
  labelNames: ['service'],
  registers: [register]
})

export const healthCheckDuration = new Histogram({
  name: 'health_check_duration_seconds',
  help: 'Time taken for health checks',
  labelNames: ['service'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.5, 1],
  registers: [register]
})

// Error Metrics
export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity', 'component'],
  registers: [register]
})

// Business Logic Metrics
export const patientsTotal = new Gauge({
  name: 'patients_total',
  help: 'Total number of patients',
  registers: [register]
})

export const templatesUsage = new Counter({
  name: 'templates_usage_total',
  help: 'Usage count of templates',
  labelNames: ['template_id', 'template_name'],
  registers: [register]
})

// Performance tracking utilities
export class MetricsTracker {
  private static timers = new Map<string, number>()
  
  static startTimer(key: string): void {
    this.timers.set(key, Date.now())
  }
  
  static endTimer(key: string): number {
    const start = this.timers.get(key)
    if (!start) return 0
    
    const duration = (Date.now() - start) / 1000
    this.timers.delete(key)
    return duration
  }
  
  static trackHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    httpRequestsTotal.labels(method, route, statusCode.toString()).inc()
    httpRequestDuration.labels(method, route, statusCode.toString()).observe(duration)
  }
  
  static trackDocumentCreated(templateId: string, status: string): void {
    documentsCreated.labels(templateId, status).inc()
  }
  
  static trackDocumentSigned(provider: string, templateId: string, duration: number): void {
    documentsSigned.labels(provider, templateId).inc()
    documentsSigningDuration.labels(provider).observe(duration)
  }
  
  static trackPdfGeneration(templateId: string, duration: number, success: boolean): void {
    const status = success ? 'success' : 'error'
    pdfGenerationTotal.labels(templateId, status).inc()
    if (success) {
      pdfGenerationDuration.labels(templateId).observe(duration)
    }
  }
  
  static trackDatabaseQuery(operation: string, table: string, duration: number, success: boolean): void {
    const status = success ? 'success' : 'error'
    databaseQueriesTotal.labels(operation, table, status).inc()
    if (success) {
      databaseQueryDuration.labels(operation, table).observe(duration)
    }
  }
  
  static trackCacheOperation(operation: string, success: boolean): void {
    const status = success ? 'hit' : 'miss'
    cacheOperationsTotal.labels(operation, status).inc()
  }
  
  static trackAuthentication(method: string, duration: number, success: boolean): void {
    const status = success ? 'success' : 'failure'
    authenticationAttempts.labels(method, status).inc()
    authenticationDuration.labels(method).observe(duration)
  }
  
  static trackError(type: string, severity: 'low' | 'medium' | 'high' | 'critical', component: string): void {
    errorsTotal.labels(type, severity, component).inc()
  }
  
  static updateBusinessMetrics(counts: {
    documents?: number
    patients?: number
    activeConnections?: number
    cacheKeys?: number
    cacheHitRatio?: number
  }): void {
    if (counts.documents !== undefined) {
      documentsTotal.set(counts.documents)
    }
    if (counts.patients !== undefined) {
      patientsTotal.set(counts.patients)
    }
    if (counts.activeConnections !== undefined) {
      databaseConnectionsActive.set(counts.activeConnections)
    }
    if (counts.cacheKeys !== undefined) {
      cacheKeysTotal.set(counts.cacheKeys)
    }
    if (counts.cacheHitRatio !== undefined) {
      cacheHitRatio.set(counts.cacheHitRatio)
    }
  }
  
  static trackHealthCheck(service: string, duration: number, healthy: boolean): void {
    healthCheckStatus.labels(service).set(healthy ? 1 : 0)
    healthCheckDuration.labels(service).observe(duration)
  }
}

// Export the registry for metrics endpoint
export { register as metricsRegistry }
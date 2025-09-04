import { FastifyRequest, FastifyReply } from 'fastify'
import { cacheService } from './cache.service'

// ⚡ Serviço de otimização de performance

interface PerformanceMetrics {
  requestCount: number
  averageResponseTime: number
  slowQueries: Array<{
    query: string
    duration: number
    timestamp: number
  }>
  cacheHitRate: number
  errorRate: number
}

interface QueryOptimization {
  query: string
  optimizations: string[]
  estimatedImprovement: string
}

/**
 * Serviço de monitoramento e otimização de performance
 */
export class PerformanceService {
  private metrics: Map<string, any> = new Map()
  private slowQueryThreshold: number
  private metricsRetention: number

  constructor() {
    this.slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000') // 1s
    this.metricsRetention = parseInt(process.env.METRICS_RETENTION || '86400') // 24h
  }

  /**
   * Middleware para medir performance de requests
   */
  createPerformanceMiddleware() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const startTime = Date.now()
      const route = `${request.method}:${request.routerPath || request.url}`

      // Hook para capturar tempo de resposta
      reply.raw.once('finish', async () => {
        const duration = Date.now() - startTime
        await this.recordRequestMetrics(route, duration, reply.statusCode)

        // Log de queries lentas
        if (duration > this.slowQueryThreshold) {
          console.warn(`🐌 Slow request: ${route} took ${duration}ms`)
        }
      })
    }
  }

  /**
   * Registra métricas de request
   */
  private async recordRequestMetrics(
    route: string, 
    duration: number, 
    statusCode: number
  ): Promise<void> {
    try {
      const key = `metrics:requests:${route}`
      const existing = await cacheService.get<any>(key) || {
        count: 0,
        totalTime: 0,
        errors: 0,
        slowQueries: []
      }

      existing.count++
      existing.totalTime += duration
      
      if (statusCode >= 400) {
        existing.errors++
      }

      if (duration > this.slowQueryThreshold) {
        existing.slowQueries.push({
          query: route,
          duration,
          timestamp: Date.now()
        })

        // Manter apenas os últimos 10 queries lentas
        existing.slowQueries = existing.slowQueries
          .sort((a: any, b: any) => b.timestamp - a.timestamp)
          .slice(0, 10)
      }

      await cacheService.set(key, existing, 'medium')
    } catch (error) {
      console.warn('Failed to record request metrics:', error)
    }
  }

  /**
   * Otimizador de queries de banco
   */
  analyzeQuery(query: string): QueryOptimization {
    const optimizations: string[] = []
    let estimatedImprovement = '0%'

    // Análise básica de patterns comuns
    if (query.includes('SELECT *')) {
      optimizations.push('Evitar SELECT *, especificar colunas necessárias')
      estimatedImprovement = '15-30%'
    }

    if (query.includes('ORDER BY') && !query.includes('LIMIT')) {
      optimizations.push('Adicionar LIMIT para evitar ordenação de todo dataset')
      estimatedImprovement = '20-50%'
    }

    if (!query.includes('WHERE') && !query.includes('LIMIT')) {
      optimizations.push('Adicionar WHERE clause para filtrar dados desnecessários')
      estimatedImprovement = '40-80%'
    }

    if (query.match(/JOIN.*JOIN.*JOIN/)) {
      optimizations.push('Considerar denormalização para reduzir múltiplos JOINs')
      estimatedImprovement = '25-60%'
    }

    if (query.includes('LIKE \'%')) {
      optimizations.push('Usar índices full-text ao invés de LIKE com % no início')
      estimatedImprovement = '300-1000%'
    }

    return {
      query,
      optimizations,
      estimatedImprovement: optimizations.length > 0 ? estimatedImprovement : '0%'
    }
  }

  /**
   * Cache inteligente para diferentes tipos de dados
   */
  async cacheStrategy<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      type: 'static' | 'dynamic' | 'user-specific' | 'realtime'
      invalidateOn?: string[]
    }
  ): Promise<T> {
    let ttlType: 'short' | 'medium' | 'long' = 'medium'

    // Estratégia de TTL baseada no tipo de dado
    switch (options.type) {
      case 'static':
        ttlType = 'long' // 1 hora - dados que raramente mudam
        break
      case 'dynamic':
        ttlType = 'medium' // 15 min - dados que mudam ocasionalmente
        break
      case 'user-specific':
        ttlType = 'short' // 1 min - dados específicos do usuário
        break
      case 'realtime':
        // Não usar cache para dados em tempo real
        return await fetcher()
    }

    return await cacheService.wrap(key, fetcher, ttlType)
  }

  /**
   * Invalidação inteligente de cache
   */
  async invalidateRelated(patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
      await cacheService.delPattern(pattern)
    }
  }

  /**
   * Compressão automática de responses grandes
   */
  shouldCompress(data: any): boolean {
    const jsonSize = JSON.stringify(data).length
    return jsonSize > 1024 // Comprimir se > 1KB
  }

  /**
   * Paginação otimizada
   */
  optimizePagination(
    page: number, 
    limit: number, 
    totalCount?: number
  ): {
    offset: number
    limit: number
    warnings: string[]
  } {
    const warnings: string[] = []
    let optimizedLimit = limit

    // Limitar página máxima baseada em performance
    if (limit > 100) {
      optimizedLimit = 100
      warnings.push('Limit reduzido para 100 por questões de performance')
    }

    // Alertar sobre offset muito alto
    const offset = (page - 1) * optimizedLimit
    if (offset > 10000) {
      warnings.push('Offset muito alto pode impactar performance, considere cursor-based pagination')
    }

    return {
      offset,
      limit: optimizedLimit,
      warnings
    }
  }

  /**
   * Monitoramento de conexões de banco
   */
  async monitorDatabaseConnections(): Promise<{
    activeConnections: number
    maxConnections: number
    usage: number
    warnings: string[]
  }> {
    // Mock implementation - seria integrado com o pool do Drizzle
    const activeConnections = 5
    const maxConnections = 20
    const usage = (activeConnections / maxConnections) * 100

    const warnings: string[] = []
    if (usage > 80) {
      warnings.push('Alto uso de conexões de banco de dados')
    }

    return {
      activeConnections,
      maxConnections,
      usage,
      warnings
    }
  }

  /**
   * Otimizador de índices de banco
   */
  suggestDatabaseIndexes(queries: string[]): Array<{
    table: string
    columns: string[]
    type: 'btree' | 'hash' | 'gin' | 'gist'
    impact: 'high' | 'medium' | 'low'
  }> {
    const suggestions: Array<{
      table: string
      columns: string[]
      type: 'btree' | 'hash' | 'gin' | 'gist'
      impact: 'high' | 'medium' | 'low'
    }> = []

    // Analisar queries para sugerir índices
    for (const query of queries) {
      const lowerQuery = query.toLowerCase()
      
      // Detectar WHERE clauses comuns
      if (lowerQuery.includes('where') && lowerQuery.includes('documents')) {
        const whereMatch = lowerQuery.match(/where\s+(\w+)\s*=/)
        if (whereMatch) {
          suggestions.push({
            table: 'documents',
            columns: [whereMatch[1]],
            type: 'btree',
            impact: 'high'
          })
        }
      }

      // Detectar ORDER BY sem índice
      if (lowerQuery.includes('order by')) {
        const orderMatch = lowerQuery.match(/order\s+by\s+(\w+)/)
        if (orderMatch) {
          suggestions.push({
            table: 'extracted_table',
            columns: [orderMatch[1]],
            type: 'btree',
            impact: 'medium'
          })
        }
      }

      // Detectar text search
      if (lowerQuery.includes('like') || lowerQuery.includes('ilike')) {
        suggestions.push({
          table: 'extracted_table',
          columns: ['extracted_column'],
          type: 'gin',
          impact: 'high'
        })
      }
    }

    // Remover duplicatas
    return suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => 
        s.table === suggestion.table && 
        s.columns.join(',') === suggestion.columns.join(',')
      )
    )
  }

  /**
   * Relatório de performance geral
   */
  async generatePerformanceReport(): Promise<{
    summary: {
      totalRequests: number
      averageResponseTime: number
      slowestRoutes: Array<{ route: string; avgTime: number }>
      errorRate: number
    }
    cache: {
      hitRate: number
      totalKeys: number
      memoryUsed: string
    }
    database: {
      connectionUsage: number
      slowQueries: number
    }
    recommendations: string[]
  }> {
    try {
      // Coletar métricas de cache
      const cacheStats = await cacheService.stats()
      
      // Mock para outras métricas - seria integrado com métricas reais
      const recommendations: string[] = []

      if (cacheStats.totalKeys < 10) {
        recommendations.push('Implementar mais cache para reduzir carga no banco')
      }

      return {
        summary: {
          totalRequests: 1000,
          averageResponseTime: 250,
          slowestRoutes: [
            { route: 'GET:/api/documents', avgTime: 450 },
            { route: 'POST:/api/documents', avgTime: 380 }
          ],
          errorRate: 0.02
        },
        cache: {
          hitRate: 0.75,
          totalKeys: cacheStats.totalKeys,
          memoryUsed: cacheStats.memoryUsed
        },
        database: {
          connectionUsage: 0.25,
          slowQueries: 3
        },
        recommendations
      }
    } catch (error) {
      console.error('Failed to generate performance report:', error)
      throw new Error('Performance report generation failed')
    }
  }

  /**
   * Auto-scaling suggestions baseado em métricas
   */
  suggestScaling(): {
    cpu: 'scale_up' | 'scale_down' | 'maintain'
    memory: 'scale_up' | 'scale_down' | 'maintain'
    database: 'scale_up' | 'scale_down' | 'maintain'
    reasoning: string[]
  } {
    const reasoning: string[] = []

    // Mock logic - seria baseado em métricas reais
    const cpuUsage = 0.45 // 45%
    const memoryUsage = 0.62 // 62%
    const dbConnUsage = 0.25 // 25%

    let cpu: 'scale_up' | 'scale_down' | 'maintain' = 'maintain'
    let memory: 'scale_up' | 'scale_down' | 'maintain' = 'maintain'
    let database: 'scale_up' | 'scale_down' | 'maintain' = 'maintain'

    if (cpuUsage > 0.8) {
      cpu = 'scale_up'
      reasoning.push('CPU usage above 80%')
    }

    if (memoryUsage > 0.85) {
      memory = 'scale_up'
      reasoning.push('Memory usage above 85%')
    }

    if (dbConnUsage > 0.8) {
      database = 'scale_up'
      reasoning.push('Database connection usage above 80%')
    }

    if (reasoning.length === 0) {
      reasoning.push('All metrics within acceptable ranges')
    }

    return {
      cpu,
      memory,
      database,
      reasoning
    }
  }
}

// Export singleton instance
export const performanceService = new PerformanceService()
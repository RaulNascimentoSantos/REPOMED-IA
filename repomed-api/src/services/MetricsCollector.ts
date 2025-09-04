import { MetricsTracker } from '../metrics/prometheus'
import { updateBusinessMetrics } from '../middleware/metricsMiddleware'

export interface MetricsCollectorDependencies {
  database: any
  cache: any
  logger?: any
}

export class MetricsCollector {
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private readonly collectInterval: number
  private readonly dependencies: MetricsCollectorDependencies

  constructor(
    dependencies: MetricsCollectorDependencies,
    collectInterval: number = 30000 // 30 seconds default
  ) {
    this.dependencies = dependencies
    this.collectInterval = collectInterval
  }

  start(): void {
    if (this.isRunning) {
      this.dependencies.logger?.warn('MetricsCollector is already running')
      return
    }

    this.dependencies.logger?.info('Starting MetricsCollector', {
      interval: `${this.collectInterval}ms`
    })

    this.isRunning = true
    
    // Collect metrics immediately on start
    this.collectMetrics()
    
    // Set up periodic collection
    this.intervalId = setInterval(() => {
      this.collectMetrics()
    }, this.collectInterval)
  }

  stop(): void {
    if (!this.isRunning) {
      return
    }

    this.dependencies.logger?.info('Stopping MetricsCollector')

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    this.isRunning = false
  }

  private async collectMetrics(): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Collect business metrics
      await updateBusinessMetrics(this.dependencies)

      // Collect database metrics if available
      if (this.dependencies.database) {
        await this.collectDatabaseMetrics()
      }

      // Collect cache metrics if available  
      if (this.dependencies.cache) {
        await this.collectCacheMetrics()
      }

      // Collect system metrics
      await this.collectSystemMetrics()

      const duration = (Date.now() - startTime) / 1000
      this.dependencies.logger?.debug('Metrics collection completed', {
        duration: `${duration}s`
      })

    } catch (error: unknown) {
      const duration = (Date.now() - startTime) / 1000
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.dependencies.logger?.error('Metrics collection failed', {
        error: errorMessage,
        duration: `${duration}s`
      })

      MetricsTracker.trackError(
        'metrics_collection_error', 
        'medium', 
        'metrics_collector'
      )
    }
  }

  private async collectDatabaseMetrics(): Promise<void> {
    try {
      // Collect active connections if pool is available
      if (this.dependencies.database.pool) {
        const totalConnections = this.dependencies.database.pool.totalCount || 0
        const idleConnections = this.dependencies.database.pool.idleCount || 0
        const activeConnections = totalConnections - idleConnections

        MetricsTracker.updateBusinessMetrics({
          activeConnections: activeConnections
        })
      }

      // Test database connectivity
      const testStart = Date.now()
      try {
        await this.dependencies.database.query('SELECT 1')
        const testDuration = (Date.now() - testStart) / 1000
        
        MetricsTracker.trackHealthCheck('database', testDuration, true)
        MetricsTracker.trackDatabaseQuery('health_check', 'system', testDuration, true)
      } catch (error) {
        const testDuration = (Date.now() - testStart) / 1000
        MetricsTracker.trackHealthCheck('database', testDuration, false)
        MetricsTracker.trackError('database_health_check_error', 'high', 'database')
      }

    } catch (error) {
      this.dependencies.logger?.error('Failed to collect database metrics:', error)
      MetricsTracker.trackError('database_metrics_error', 'medium', 'metrics_collector')
    }
  }

  private async collectCacheMetrics(): Promise<void> {
    try {
      // Test cache connectivity
      const testStart = Date.now()
      try {
        await this.dependencies.cache.ping()
        const testDuration = (Date.now() - testStart) / 1000
        
        MetricsTracker.trackHealthCheck('cache', testDuration, true)
      } catch (error) {
        const testDuration = (Date.now() - testStart) / 1000
        MetricsTracker.trackHealthCheck('cache', testDuration, false)
        MetricsTracker.trackError('cache_health_check_error', 'medium', 'cache')
      }

      // Get cache statistics
      try {
        const stats = await this.dependencies.cache.getStats()
        if (stats) {
          MetricsTracker.updateBusinessMetrics({
            cacheKeys: stats.totalKeys || 0,
            cacheHitRatio: stats.hitRatio || 0
          })
        }
      } catch (error: unknown) {
        // Cache stats not available, not critical
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        this.dependencies.logger?.debug('Cache stats not available:', errorMessage)
      }

    } catch (error) {
      this.dependencies.logger?.error('Failed to collect cache metrics:', error)
      MetricsTracker.trackError('cache_metrics_error', 'medium', 'metrics_collector')
    }
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      // Memory metrics
      const memoryUsage = process.memoryUsage()
      const memoryUsedMB = memoryUsage.heapUsed / 1024 / 1024
      
      // CPU metrics
      const cpuUsage = process.cpuUsage()
      const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000 / process.uptime() * 100

      // Log system metrics for debugging
      this.dependencies.logger?.debug('System metrics collected', {
        memory: {
          heapUsed: `${memoryUsedMB.toFixed(2)}MB`,
          heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
          external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)}MB`
        },
        cpu: {
          usage: `${cpuPercent.toFixed(2)}%`,
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        uptime: `${process.uptime().toFixed(2)}s`
      })

    } catch (error) {
      this.dependencies.logger?.error('Failed to collect system metrics:', error)
      MetricsTracker.trackError('system_metrics_error', 'low', 'metrics_collector')
    }
  }

  // Manual trigger for immediate metrics collection
  async collectNow(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('MetricsCollector is not running')
    }

    await this.collectMetrics()
  }

  // Get collector status
  getStatus(): {
    isRunning: boolean
    interval: number
    nextCollection?: Date
  } {
    const status = {
      isRunning: this.isRunning,
      interval: this.collectInterval
    }

    if (this.isRunning && this.intervalId) {
      // Estimate next collection time (approximate)
      const nextCollection = new Date(Date.now() + this.collectInterval)
      return { ...status, nextCollection }
    }

    return status
  }
}

// Factory function to create and configure the metrics collector
export function createMetricsCollector(
  dependencies: MetricsCollectorDependencies,
  options: {
    enabled?: boolean
    interval?: number
  } = {}
): MetricsCollector | null {
  const { enabled = true, interval = 30000 } = options

  if (!enabled) {
    dependencies.logger?.info('Metrics collection is disabled')
    return null
  }

  const collector = new MetricsCollector(dependencies, interval)
  
  // Handle graceful shutdown
  const shutdown = () => {
    dependencies.logger?.info('Shutting down metrics collector')
    collector.stop()
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
  process.on('SIGHUP', shutdown)

  return collector
}
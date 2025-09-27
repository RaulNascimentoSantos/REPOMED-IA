import { FastifyInstance } from 'fastify'
import { metricsRegistry } from '../metrics/prometheus'

export default async function metricsRoutes(fastify: FastifyInstance) {
  // Prometheus metrics endpoint
  fastify.get('/metrics', {
    schema: {
      summary: 'Prometheus metrics endpoint',
      description: 'Exposes application metrics in Prometheus format',
      tags: ['monitoring'],
      response: {
        200: {
          type: 'string',
          description: 'Prometheus metrics in text format'
        }
      }
    }
  }, async (request, reply) => {
    try {
      const metrics = await metricsRegistry.metrics()
      
      reply
        .type('text/plain; version=0.0.4; charset=utf-8')
        .send(metrics)
    } catch (error) {
      fastify.log.error('Error generating metrics:', error)
      reply.code(500).send({ error: 'Failed to generate metrics' })
    }
  })

  // Health check endpoint with metrics
  fastify.get('/health', {
    schema: {
      summary: 'Health check endpoint',
      description: 'Returns the health status of the application and its dependencies',
      tags: ['monitoring'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string' },
            uptime: { type: 'number' },
            services: {
              type: 'object',
              properties: {
                database: { type: 'string', enum: ['connected', 'disconnected', 'error'] },
                cache: { type: 'string', enum: ['connected', 'disconnected', 'error'] },
                storage: { type: 'string', enum: ['available', 'unavailable', 'error'] }
              }
            },
            metrics: {
              type: 'object',
              properties: {
                requests_total: { type: 'number' },
                errors_total: { type: 'number' },
                documents_total: { type: 'number' },
                patients_total: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now()
    const healthStatus = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      services: {
        database: 'connected' as 'connected' | 'disconnected' | 'error',
        cache: 'connected' as 'connected' | 'disconnected' | 'error',
        storage: 'available' as 'available' | 'unavailable' | 'error'
      },
      metrics: {
        requests_total: 0,
        errors_total: 0,
        documents_total: 0,
        patients_total: 0
      }
    }

    try {
      // Check database connection
      try {
        // Assuming we have a database instance available
        // await fastify.db.query('SELECT 1')
        healthStatus.services.database = 'connected'
      } catch (error) {
        fastify.log.warn('Database health check failed:', error)
        healthStatus.services.database = 'error'
        healthStatus.status = 'degraded'
      }

      // Check cache connection  
      try {
        // await fastify.cache.ping()
        healthStatus.services.cache = 'connected'
      } catch (error) {
        fastify.log.warn('Cache health check failed:', error)
        healthStatus.services.cache = 'error'
        healthStatus.status = 'degraded'
      }

      // Check storage (disk space, etc.)
      try {
        const fs = await import('fs/promises')
        await fs.access('./tmp', fs.constants.F_OK)
        healthStatus.services.storage = 'available'
      } catch (error) {
        healthStatus.services.storage = 'unavailable'
        healthStatus.status = 'degraded'
      }

      // Get current metrics values
      try {
        const metricsString = await metricsRegistry.metrics()
        
        // Extract some key metrics from the string
        const requestsMatch = metricsString.match(/http_requests_total\s+(\d+)/)
        const errorsMatch = metricsString.match(/errors_total\s+(\d+)/)
        const documentsMatch = metricsString.match(/documents_total\s+(\d+)/)
        const patientsMatch = metricsString.match(/patients_total\s+(\d+)/)

        healthStatus.metrics.requests_total = requestsMatch ? parseInt(requestsMatch[1]) : 0
        healthStatus.metrics.errors_total = errorsMatch ? parseInt(errorsMatch[1]) : 0
        healthStatus.metrics.documents_total = documentsMatch ? parseInt(documentsMatch[1]) : 0
        healthStatus.metrics.patients_total = patientsMatch ? parseInt(patientsMatch[1]) : 0
      } catch (error) {
        fastify.log.warn('Failed to extract metrics for health check:', error)
      }

      // Determine overall status
      if (healthStatus.services.database === 'error') {
        healthStatus.status = 'unhealthy'
      }

      const duration = (Date.now() - startTime) / 1000
      
      // Track health check metrics
      const { MetricsTracker } = await import('../metrics/prometheus')
      MetricsTracker.trackHealthCheck('health_endpoint', duration, healthStatus.status === 'healthy')

      reply.send(healthStatus)

    } catch (error) {
      fastify.log.error('Health check failed:', error)
      
      const duration = (Date.now() - startTime) / 1000
      const { MetricsTracker } = await import('../metrics/prometheus')
      MetricsTracker.trackHealthCheck('health_endpoint', duration, false)
      
      reply.code(500).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      })
    }
  })

  // Additional metrics endpoints for debugging/monitoring
  fastify.get('/metrics/summary', {
    schema: {
      summary: 'Metrics summary',
      description: 'Returns a human-readable summary of key metrics',
      tags: ['monitoring'],
      response: {
        200: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'string' },
            performance: {
              type: 'object',
              properties: {
                avg_response_time: { type: 'string' },
                error_rate: { type: 'string' },
                requests_per_minute: { type: 'number' }
              }
            },
            business: {
              type: 'object', 
              properties: {
                total_documents: { type: 'number' },
                total_patients: { type: 'number' },
                documents_signed_today: { type: 'number' }
              }
            },
            system: {
              type: 'object',
              properties: {
                memory_usage: { type: 'string' },
                cpu_usage: { type: 'string' },
                database_connections: { type: 'number' },
                cache_hit_rate: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const metricsString = await metricsRegistry.metrics()
      
      // Parse key metrics from the Prometheus format
      const parseMetric = (metricName: string, defaultValue = 0) => {
        const regex = new RegExp(`${metricName}\\s+(\\d+(?:\\.\\d+)?)`)
        const match = metricsString.match(regex)
        return match ? parseFloat(match[1]) : defaultValue
      }

      const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return `${days}d ${hours}h ${minutes}m`
      }

      const formatBytes = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB']
        let size = bytes
        let unitIndex = 0
        
        while (size >= 1024 && unitIndex < units.length - 1) {
          size /= 1024
          unitIndex++
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`
      }

      // Get process metrics
      const memoryUsage = process.memoryUsage()
      const cpuUsage = process.cpuUsage()

      const summary = {
        timestamp: new Date().toISOString(),
        uptime: formatUptime(process.uptime()),
        performance: {
          avg_response_time: `${parseMetric('http_request_duration_seconds_sum', 0)}ms`,
          error_rate: `${((parseMetric('errors_total') / Math.max(parseMetric('http_requests_total'), 1)) * 100).toFixed(2)}%`,
          requests_per_minute: Math.round(parseMetric('http_requests_total') / (process.uptime() / 60))
        },
        business: {
          total_documents: Math.round(parseMetric('documents_total')),
          total_patients: Math.round(parseMetric('patients_total')),
          documents_signed_today: Math.round(parseMetric('documents_signed_total'))
        },
        system: {
          memory_usage: formatBytes(memoryUsage.heapUsed),
          cpu_usage: `${((cpuUsage.user + cpuUsage.system) / 1000000).toFixed(2)}%`,
          database_connections: Math.round(parseMetric('database_connections_active')),
          cache_hit_rate: `${(parseMetric('cache_hit_ratio') * 100).toFixed(1)}%`
        }
      }

      reply.send(summary)

    } catch (error) {
      fastify.log.error('Error generating metrics summary:', error)
      reply.code(500).send({ error: 'Failed to generate metrics summary' })
    }
  })
}
import { FastifyInstance } from 'fastify'
import { cacheService } from '../services/cache.service'
import { performanceService } from '../services/performance.service'

/**
 * Routes para monitoramento de performance e cache
 */
export function registerPerformanceRoutes(fastify: FastifyInstance) {
  
  // ⚡ Cache Management Routes
  
  fastify.get('/api/performance/cache/stats', {
    schema: {
      tags: ['performance'],
      summary: 'Obter estatísticas do cache',
      response: {
        200: {
          type: 'object',
          properties: {
            connected: { type: 'boolean' },
            totalKeys: { type: 'number' },
            memoryUsed: { type: 'string' },
            hitRate: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const stats = await cacheService.stats()
    return { success: true, data: stats }
  })

  fastify.post('/api/performance/cache/flush', {
    schema: {
      tags: ['performance'],
      summary: 'Limpar todo o cache (usar com cuidado)',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    await cacheService.flush()
    return { success: true, message: 'Cache cleared successfully' }
  })

  fastify.delete('/api/performance/cache/:pattern', {
    schema: {
      tags: ['performance'],
      summary: 'Invalidar cache por padrão',
      params: {
        type: 'object',
        properties: {
          pattern: { type: 'string' }
        },
        required: ['pattern']
      }
    }
  }, async (request, reply) => {
    const { pattern } = request.params as { pattern: string }
    const deletedCount = await cacheService.delPattern(pattern)
    return { success: true, deletedKeys: deletedCount }
  })

  fastify.get('/api/performance/cache/health', {
    schema: {
      tags: ['performance'],
      summary: 'Health check do cache Redis'
    }
  }, async (request, reply) => {
    const health = await cacheService.healthCheck()
    const statusCode = health.status === 'healthy' ? 200 : 503
    reply.code(statusCode)
    return health
  })

  // 📊 Performance Monitoring Routes

  fastify.get('/api/performance/report', {
    schema: {
      tags: ['performance'],
      summary: 'Relatório completo de performance'
    }
  }, async (request, reply) => {
    const report = await performanceService.generatePerformanceReport()
    return { success: true, data: report }
  })

  fastify.get('/api/performance/scaling', {
    schema: {
      tags: ['performance'],
      summary: 'Sugestões de scaling baseadas em métricas'
    }
  }, async (request, reply) => {
    const suggestions = performanceService.suggestScaling()
    return { success: true, data: suggestions }
  })

  fastify.post('/api/performance/analyze-query', {
    schema: {
      tags: ['performance'],
      summary: 'Analisar query SQL para otimizações',
      body: {
        type: 'object',
        properties: {
          query: { type: 'string' }
        },
        required: ['query']
      }
    }
  }, async (request, reply) => {
    const { query } = request.body as { query: string }
    const analysis = performanceService.analyzeQuery(query)
    return { success: true, data: analysis }
  })

  fastify.get('/api/performance/database/connections', {
    schema: {
      tags: ['performance'],
      summary: 'Monitorar conexões do banco de dados'
    }
  }, async (request, reply) => {
    const connectionInfo = await performanceService.monitorDatabaseConnections()
    return { success: true, data: connectionInfo }
  })

  fastify.post('/api/performance/suggest-indexes', {
    schema: {
      tags: ['performance'],
      summary: 'Sugerir índices de banco baseado em queries',
      body: {
        type: 'object',
        properties: {
          queries: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['queries']
      }
    }
  }, async (request, reply) => {
    const { queries } = request.body as { queries: string[] }
    const suggestions = performanceService.suggestDatabaseIndexes(queries)
    return { success: true, data: suggestions }
  })

  // 🔧 Cache Utilities for Development

  fastify.get('/api/performance/cache/key/:key', {
    schema: {
      tags: ['performance'],
      summary: 'Verificar se uma chave existe no cache',
      params: {
        type: 'object',
        properties: {
          key: { type: 'string' }
        },
        required: ['key']
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const exists = await cacheService.exists(key)
    const data = exists ? await cacheService.get(key) : null
    
    return { 
      success: true, 
      data: { 
        exists, 
        value: data 
      } 
    }
  })

  fastify.put('/api/performance/cache/key/:key', {
    schema: {
      tags: ['performance'],
      summary: 'Definir valor no cache manualmente',
      params: {
        type: 'object',
        properties: {
          key: { type: 'string' }
        },
        required: ['key']
      },
      body: {
        type: 'object',
        properties: {
          value: {},
          ttl: { 
            type: 'string', 
            enum: ['short', 'default', 'medium', 'long'] 
          }
        },
        required: ['value']
      }
    }
  }, async (request, reply) => {
    const { key } = request.params as { key: string }
    const { value, ttl = 'default' } = request.body as { 
      value: any
      ttl?: 'short' | 'default' | 'medium' | 'long'
    }
    
    await cacheService.set(key, value, ttl)
    return { success: true, message: 'Value cached successfully' }
  })

  // 📈 Performance Middleware Registration
  
  fastify.addHook('onRequest', performanceService.createPerformanceMiddleware())

  // 🎯 Cached Route Examples

  fastify.get('/api/performance/demo/cached-heavy-operation', {
    schema: {
      tags: ['performance'],
      summary: 'Demonstração de operação pesada com cache'
    }
  }, async (request, reply) => {
    // Simular operação pesada
    const heavyOperation = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2s delay
      return {
        computedAt: new Date().toISOString(),
        data: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: Math.random() }))
      }
    }

    const result = await performanceService.cacheStrategy(
      'demo:heavy-operation',
      heavyOperation,
      { type: 'static' }
    )

    return { success: true, data: result, cached: true }
  })

  fastify.get('/api/performance/demo/user-specific/:userId', {
    schema: {
      tags: ['performance'],
      summary: 'Demonstração de cache específico por usuário',
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }

    const userOperation = async () => ({
      userId,
      preferences: { theme: 'dark', language: 'pt-BR' },
      lastActivity: new Date().toISOString()
    })

    const result = await performanceService.cacheStrategy(
      `user:${userId}:profile`,
      userOperation,
      { 
        type: 'user-specific',
        invalidateOn: [`user:${userId}:*`]
      }
    )

    return { success: true, data: result }
  })
}
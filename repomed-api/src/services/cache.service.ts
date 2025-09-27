import Redis from 'ioredis'
import crypto from 'crypto'

// ⚡ Serviço de Cache com Redis

interface CacheConfig {
  ttl: {
    default: number
    short: number
    medium: number
    long: number
  }
  keyPrefix: string
  maxRetries: number
  retryDelayOnFailover: number
}

interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
  version: string
}

/**
 * Serviço de cache centralizado com Redis
 * Suporta TTL configurável, invalidação inteligente e compressão
 */
export class CacheService {
  private redis: Redis
  private readonly config: CacheConfig
  private readonly version: string

  constructor() {
    this.version = process.env.CACHE_VERSION || '1.0'
    
    this.config = {
      ttl: {
        default: parseInt(process.env.CACHE_TTL_DEFAULT || '300'), // 5 min
        short: parseInt(process.env.CACHE_TTL_SHORT || '60'), // 1 min
        medium: parseInt(process.env.CACHE_TTL_MEDIUM || '900'), // 15 min
        long: parseInt(process.env.CACHE_TTL_LONG || '3600') // 1 hour
      },
      keyPrefix: process.env.CACHE_KEY_PREFIX || 'repomed:',
      maxRetries: parseInt(process.env.CACHE_MAX_RETRIES || '3'),
      retryDelayOnFailover: parseInt(process.env.CACHE_RETRY_DELAY || '100')
    }

    // Configurar Redis
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: this.config.maxRetries,
      retryDelayOnFailover: this.config.retryDelayOnFailover,
      enableReadyCheck: true,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      // Configurações de conexão
      family: 4,
      // Configurações de performance
      maxLoadingTimeout: 10000
    })

    this.setupEventHandlers()
  }

  /**
   * Configura event handlers do Redis
   */
  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      console.log('✅ Redis cache connected successfully')
    })

    this.redis.on('error', (error) => {
      console.error('❌ Redis cache error:', error.message)
    })

    this.redis.on('close', () => {
      console.warn('⚠️ Redis cache connection closed')
    })

    this.redis.on('reconnecting', () => {
      console.log('🔄 Redis cache reconnecting...')
    })
  }

  /**
   * Gera chave de cache padronizada
   */
  private generateKey(...parts: string[]): string {
    const key = parts.join(':')
    return `${this.config.keyPrefix}${key}`
  }

  /**
   * Gera hash de chave para chaves muito longas
   */
  private hashKey(key: string): string {
    if (key.length <= 250) return key
    const hash = crypto.createHash('sha256').update(key).digest('hex').substring(0, 32)
    return `${key.substring(0, 200)}:${hash}`
  }

  /**
   * Conecta ao Redis se necessário
   */
  private async ensureConnection(): Promise<void> {
    if (this.redis.status !== 'ready') {
      try {
        await this.redis.connect()
      } catch (error) {
        console.error('Failed to connect to Redis:', error)
        throw new Error('Cache service unavailable')
      }
    }
  }

  /**
   * Serializa dados para armazenamento
   */
  private serialize<T>(data: T, ttl: number): string {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: this.version
    }
    return JSON.stringify(item)
  }

  /**
   * Deserializa dados do cache
   */
  private deserialize<T>(serialized: string): CacheItem<T> | null {
    try {
      const item = JSON.parse(serialized) as CacheItem<T>
      
      // Verificar versão do cache
      if (item.version !== this.version) {
        return null
      }
      
      // Verificar se não expirou manualmente
      const age = Date.now() - item.timestamp
      if (age > item.ttl * 1000) {
        return null
      }
      
      return item
    } catch {
      return null
    }
  }

  /**
   * Armazena item no cache
   */
  async set<T>(
    key: string, 
    data: T, 
    ttlType: keyof CacheConfig['ttl'] = 'default'
  ): Promise<void> {
    try {
      await this.ensureConnection()
      
      const ttl = this.config.ttl[ttlType]
      const cacheKey = this.hashKey(this.generateKey(key))
      const serialized = this.serialize(data, ttl)
      
      await this.redis.setex(cacheKey, ttl, serialized)
    } catch (error) {
      console.warn('Cache set failed:', error)
      // Não falhar se cache não estiver disponível
    }
  }

  /**
   * Recupera item do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      await this.ensureConnection()
      
      const cacheKey = this.hashKey(this.generateKey(key))
      const serialized = await this.redis.get(cacheKey)
      
      if (!serialized) return null
      
      const item = this.deserialize<T>(serialized)
      return item ? item.data : null
    } catch (error) {
      console.warn('Cache get failed:', error)
      return null
    }
  }

  /**
   * Remove item do cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.ensureConnection()
      
      const cacheKey = this.hashKey(this.generateKey(key))
      await this.redis.del(cacheKey)
    } catch (error) {
      console.warn('Cache delete failed:', error)
    }
  }

  /**
   * Remove múltiplos itens por padrão
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      await this.ensureConnection()
      
      const searchPattern = this.generateKey(pattern)
      const keys = await this.redis.keys(searchPattern)
      
      if (keys.length === 0) return 0
      
      await this.redis.del(...keys)
      return keys.length
    } catch (error) {
      console.warn('Cache pattern delete failed:', error)
      return 0
    }
  }

  /**
   * Verifica se existe no cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      await this.ensureConnection()
      
      const cacheKey = this.hashKey(this.generateKey(key))
      const exists = await this.redis.exists(cacheKey)
      return exists === 1
    } catch (error) {
      console.warn('Cache exists check failed:', error)
      return false
    }
  }

  /**
   * Define TTL de um item existente
   */
  async expire(key: string, ttlType: keyof CacheConfig['ttl']): Promise<void> {
    try {
      await this.ensureConnection()
      
      const cacheKey = this.hashKey(this.generateKey(key))
      const ttl = this.config.ttl[ttlType]
      await this.redis.expire(cacheKey, ttl)
    } catch (error) {
      console.warn('Cache expire failed:', error)
    }
  }

  /**
   * Wrapper para cache automático de funções
   */
  async wrap<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlType: keyof CacheConfig['ttl'] = 'default'
  ): Promise<T> {
    // Tentar buscar do cache primeiro
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Se não encontrou, executar função e cachear resultado
    try {
      const data = await fetcher()
      await this.set(key, data, ttlType)
      return data
    } catch (error) {
      // Se fetcher falhar, ainda assim remover cache inválido
      await this.del(key)
      throw error
    }
  }

  /**
   * Limpa todo o cache (usar com cuidado)
   */
  async flush(): Promise<void> {
    try {
      await this.ensureConnection()
      
      const keys = await this.redis.keys(`${this.config.keyPrefix}*`)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
      
      console.log(`🧹 Cache cleared: ${keys.length} keys removed`)
    } catch (error) {
      console.error('Cache flush failed:', error)
    }
  }

  /**
   * Estatísticas do cache
   */
  async stats(): Promise<{
    connected: boolean
    totalKeys: number
    memoryUsed: string
    hitRate?: number
  }> {
    try {
      await this.ensureConnection()
      
      const info = await this.redis.info('memory')
      const keys = await this.redis.keys(`${this.config.keyPrefix}*`)
      
      const memoryMatch = info.match(/used_memory_human:(.+?)\\r\\n/)
      const memoryUsed = memoryMatch ? memoryMatch[1] : 'Unknown'
      
      return {
        connected: this.redis.status === 'ready',
        totalKeys: keys.length,
        memoryUsed
      }
    } catch (error) {
      return {
        connected: false,
        totalKeys: 0,
        memoryUsed: 'Unknown'
      }
    }
  }

  /**
   * Fecha conexão com Redis
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit()
      console.log('📴 Redis cache disconnected')
    } catch (error) {
      console.warn('Error disconnecting from Redis:', error)
    }
  }

  /**
   * Health check do cache
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    latency?: number
    error?: string
  }> {
    try {
      const start = Date.now()
      await this.redis.ping()
      const latency = Date.now() - start
      
      return {
        status: 'healthy',
        latency
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService()
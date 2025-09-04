import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CacheService } from '../../src/services/CacheService'

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  ttl: vi.fn(),
  keys: vi.fn(),
  flushall: vi.fn(),
  info: vi.fn().mockResolvedValue('# Memory\r\nused_memory_human:1.2M\r\n'),
  dbsize: vi.fn().mockResolvedValue(42),
  ping: vi.fn().mockResolvedValue('PONG')
}

vi.mock('ioredis', () => ({
  default: vi.fn(() => mockRedis)
}))

describe('CacheService', () => {
  let cacheService: CacheService

  beforeEach(() => {
    cacheService = new CacheService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('get', () => {
    it('should get value from cache', async () => {
      const testData = { id: '123', name: 'Test' }
      mockRedis.get.mockResolvedValue(JSON.stringify(testData))

      const result = await cacheService.get('test:key')

      expect(mockRedis.get).toHaveBeenCalledWith('test:key')
      expect(result).toEqual(testData)
    })

    it('should return null for non-existent key', async () => {
      mockRedis.get.mockResolvedValue(null)

      const result = await cacheService.get('non-existent')

      expect(result).toBeNull()
    })

    it('should handle JSON parse errors gracefully', async () => {
      mockRedis.get.mockResolvedValue('invalid-json')

      const result = await cacheService.get('invalid-key')

      expect(result).toBeNull()
    })
  })

  describe('set', () => {
    it('should set value in cache with default TTL', async () => {
      const testData = { id: '123', name: 'Test' }
      mockRedis.set.mockResolvedValue('OK')

      await cacheService.set('test:key', testData)

      expect(mockRedis.set).toHaveBeenCalledWith(
        'test:key',
        JSON.stringify(testData),
        'EX',
        3600 // default TTL
      )
    })

    it('should set value in cache with custom TTL', async () => {
      const testData = { id: '123', name: 'Test' }
      const customTTL = 1800
      mockRedis.set.mockResolvedValue('OK')

      await cacheService.set('test:key', testData, customTTL)

      expect(mockRedis.set).toHaveBeenCalledWith(
        'test:key',
        JSON.stringify(testData),
        'EX',
        customTTL
      )
    })

    it('should handle set errors gracefully', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis error'))

      await expect(cacheService.set('test:key', { data: 'test' }))
        .rejects.toThrow('Redis error')
    })
  })

  describe('del', () => {
    it('should delete single key', async () => {
      mockRedis.del.mockResolvedValue(1)

      const result = await cacheService.del('test:key')

      expect(mockRedis.del).toHaveBeenCalledWith('test:key')
      expect(result).toBe(1)
    })

    it('should delete multiple keys', async () => {
      mockRedis.del.mockResolvedValue(2)

      const result = await cacheService.del(['key1', 'key2'])

      expect(mockRedis.del).toHaveBeenCalledWith(['key1', 'key2'])
      expect(result).toBe(2)
    })
  })

  describe('exists', () => {
    it('should check if key exists', async () => {
      mockRedis.exists.mockResolvedValue(1)

      const result = await cacheService.exists('test:key')

      expect(mockRedis.exists).toHaveBeenCalledWith('test:key')
      expect(result).toBe(true)
    })

    it('should return false for non-existent key', async () => {
      mockRedis.exists.mockResolvedValue(0)

      const result = await cacheService.exists('non-existent')

      expect(result).toBe(false)
    })
  })

  describe('invalidatePattern', () => {
    it('should invalidate keys matching pattern', async () => {
      mockRedis.keys.mockResolvedValue(['documents:123', 'documents:456'])
      mockRedis.del.mockResolvedValue(2)

      const result = await cacheService.invalidatePattern('documents:*')

      expect(mockRedis.keys).toHaveBeenCalledWith('documents:*')
      expect(mockRedis.del).toHaveBeenCalledWith(['documents:123', 'documents:456'])
      expect(result).toBe(2)
    })

    it('should handle empty pattern match', async () => {
      mockRedis.keys.mockResolvedValue([])

      const result = await cacheService.invalidatePattern('empty:*')

      expect(mockRedis.keys).toHaveBeenCalledWith('empty:*')
      expect(mockRedis.del).not.toHaveBeenCalled()
      expect(result).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const stats = await cacheService.getStats()

      expect(mockRedis.info).toHaveBeenCalledWith('memory')
      expect(mockRedis.dbsize).toHaveBeenCalled()
      expect(mockRedis.ping).toHaveBeenCalled()
      
      expect(stats).toEqual({
        connected: true,
        totalKeys: 42,
        memoryUsed: '1.2M'
      })
    })

    it('should handle connection errors in stats', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'))

      const stats = await cacheService.getStats()

      expect(stats.connected).toBe(false)
    })
  })

  describe('memoize', () => {
    it('should cache function result', async () => {
      const expensiveFunction = vi.fn().mockResolvedValue({ result: 'computed' })
      mockRedis.get.mockResolvedValue(null) // Cache miss
      mockRedis.set.mockResolvedValue('OK')

      const memoized = cacheService.memoize('test:fn', expensiveFunction)
      const result = await memoized('arg1', 'arg2')

      expect(expensiveFunction).toHaveBeenCalledWith('arg1', 'arg2')
      expect(mockRedis.set).toHaveBeenCalled()
      expect(result).toEqual({ result: 'computed' })
    })

    it('should return cached result on cache hit', async () => {
      const expensiveFunction = vi.fn()
      const cachedResult = { result: 'cached' }
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedResult))

      const memoized = cacheService.memoize('test:fn', expensiveFunction)
      const result = await memoized('arg1', 'arg2')

      expect(expensiveFunction).not.toHaveBeenCalled()
      expect(result).toEqual(cachedResult)
    })

    it('should generate consistent cache keys', async () => {
      const expensiveFunction = vi.fn().mockResolvedValue({ result: 'test' })
      mockRedis.get.mockResolvedValue(null)
      mockRedis.set.mockResolvedValue('OK')

      const memoized = cacheService.memoize('test:fn', expensiveFunction)
      await memoized('arg1', 'arg2')
      await memoized('arg1', 'arg2')

      // Should use same cache key for same arguments
      expect(mockRedis.get).toHaveBeenCalledTimes(2)
      expect(mockRedis.get).toHaveBeenNthCalledWith(1, 'test:fn:hash')
      expect(mockRedis.get).toHaveBeenNthCalledWith(2, 'test:fn:hash')
    })
  })
})
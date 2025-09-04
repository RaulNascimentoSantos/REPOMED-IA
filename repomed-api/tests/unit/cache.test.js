"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const CacheService_1 = require("../../src/services/CacheService");
// Mock Redis
const mockRedis = {
    get: vitest_1.vi.fn(),
    set: vitest_1.vi.fn(),
    del: vitest_1.vi.fn(),
    exists: vitest_1.vi.fn(),
    ttl: vitest_1.vi.fn(),
    keys: vitest_1.vi.fn(),
    flushall: vitest_1.vi.fn(),
    info: vitest_1.vi.fn().mockResolvedValue('# Memory\r\nused_memory_human:1.2M\r\n'),
    dbsize: vitest_1.vi.fn().mockResolvedValue(42),
    ping: vitest_1.vi.fn().mockResolvedValue('PONG')
};
vitest_1.vi.mock('ioredis', () => ({
    default: vitest_1.vi.fn(() => mockRedis)
}));
(0, vitest_1.describe)('CacheService', () => {
    let cacheService;
    (0, vitest_1.beforeEach)(() => {
        cacheService = new CacheService_1.CacheService();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.resetAllMocks();
    });
    (0, vitest_1.describe)('get', () => {
        (0, vitest_1.it)('should get value from cache', async () => {
            const testData = { id: '123', name: 'Test' };
            mockRedis.get.mockResolvedValue(JSON.stringify(testData));
            const result = await cacheService.get('test:key');
            (0, vitest_1.expect)(mockRedis.get).toHaveBeenCalledWith('test:key');
            (0, vitest_1.expect)(result).toEqual(testData);
        });
        (0, vitest_1.it)('should return null for non-existent key', async () => {
            mockRedis.get.mockResolvedValue(null);
            const result = await cacheService.get('non-existent');
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('should handle JSON parse errors gracefully', async () => {
            mockRedis.get.mockResolvedValue('invalid-json');
            const result = await cacheService.get('invalid-key');
            (0, vitest_1.expect)(result).toBeNull();
        });
    });
    (0, vitest_1.describe)('set', () => {
        (0, vitest_1.it)('should set value in cache with default TTL', async () => {
            const testData = { id: '123', name: 'Test' };
            mockRedis.set.mockResolvedValue('OK');
            await cacheService.set('test:key', testData);
            (0, vitest_1.expect)(mockRedis.set).toHaveBeenCalledWith('test:key', JSON.stringify(testData), 'EX', 3600 // default TTL
            );
        });
        (0, vitest_1.it)('should set value in cache with custom TTL', async () => {
            const testData = { id: '123', name: 'Test' };
            const customTTL = 1800;
            mockRedis.set.mockResolvedValue('OK');
            await cacheService.set('test:key', testData, customTTL);
            (0, vitest_1.expect)(mockRedis.set).toHaveBeenCalledWith('test:key', JSON.stringify(testData), 'EX', customTTL);
        });
        (0, vitest_1.it)('should handle set errors gracefully', async () => {
            mockRedis.set.mockRejectedValue(new Error('Redis error'));
            await (0, vitest_1.expect)(cacheService.set('test:key', { data: 'test' }))
                .rejects.toThrow('Redis error');
        });
    });
    (0, vitest_1.describe)('del', () => {
        (0, vitest_1.it)('should delete single key', async () => {
            mockRedis.del.mockResolvedValue(1);
            const result = await cacheService.del('test:key');
            (0, vitest_1.expect)(mockRedis.del).toHaveBeenCalledWith('test:key');
            (0, vitest_1.expect)(result).toBe(1);
        });
        (0, vitest_1.it)('should delete multiple keys', async () => {
            mockRedis.del.mockResolvedValue(2);
            const result = await cacheService.del(['key1', 'key2']);
            (0, vitest_1.expect)(mockRedis.del).toHaveBeenCalledWith(['key1', 'key2']);
            (0, vitest_1.expect)(result).toBe(2);
        });
    });
    (0, vitest_1.describe)('exists', () => {
        (0, vitest_1.it)('should check if key exists', async () => {
            mockRedis.exists.mockResolvedValue(1);
            const result = await cacheService.exists('test:key');
            (0, vitest_1.expect)(mockRedis.exists).toHaveBeenCalledWith('test:key');
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should return false for non-existent key', async () => {
            mockRedis.exists.mockResolvedValue(0);
            const result = await cacheService.exists('non-existent');
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
    (0, vitest_1.describe)('invalidatePattern', () => {
        (0, vitest_1.it)('should invalidate keys matching pattern', async () => {
            mockRedis.keys.mockResolvedValue(['documents:123', 'documents:456']);
            mockRedis.del.mockResolvedValue(2);
            const result = await cacheService.invalidatePattern('documents:*');
            (0, vitest_1.expect)(mockRedis.keys).toHaveBeenCalledWith('documents:*');
            (0, vitest_1.expect)(mockRedis.del).toHaveBeenCalledWith(['documents:123', 'documents:456']);
            (0, vitest_1.expect)(result).toBe(2);
        });
        (0, vitest_1.it)('should handle empty pattern match', async () => {
            mockRedis.keys.mockResolvedValue([]);
            const result = await cacheService.invalidatePattern('empty:*');
            (0, vitest_1.expect)(mockRedis.keys).toHaveBeenCalledWith('empty:*');
            (0, vitest_1.expect)(mockRedis.del).not.toHaveBeenCalled();
            (0, vitest_1.expect)(result).toBe(0);
        });
    });
    (0, vitest_1.describe)('getStats', () => {
        (0, vitest_1.it)('should return cache statistics', async () => {
            const stats = await cacheService.getStats();
            (0, vitest_1.expect)(mockRedis.info).toHaveBeenCalledWith('memory');
            (0, vitest_1.expect)(mockRedis.dbsize).toHaveBeenCalled();
            (0, vitest_1.expect)(mockRedis.ping).toHaveBeenCalled();
            (0, vitest_1.expect)(stats).toEqual({
                connected: true,
                totalKeys: 42,
                memoryUsed: '1.2M'
            });
        });
        (0, vitest_1.it)('should handle connection errors in stats', async () => {
            mockRedis.ping.mockRejectedValue(new Error('Connection failed'));
            const stats = await cacheService.getStats();
            (0, vitest_1.expect)(stats.connected).toBe(false);
        });
    });
    (0, vitest_1.describe)('memoize', () => {
        (0, vitest_1.it)('should cache function result', async () => {
            const expensiveFunction = vitest_1.vi.fn().mockResolvedValue({ result: 'computed' });
            mockRedis.get.mockResolvedValue(null); // Cache miss
            mockRedis.set.mockResolvedValue('OK');
            const memoized = cacheService.memoize('test:fn', expensiveFunction);
            const result = await memoized('arg1', 'arg2');
            (0, vitest_1.expect)(expensiveFunction).toHaveBeenCalledWith('arg1', 'arg2');
            (0, vitest_1.expect)(mockRedis.set).toHaveBeenCalled();
            (0, vitest_1.expect)(result).toEqual({ result: 'computed' });
        });
        (0, vitest_1.it)('should return cached result on cache hit', async () => {
            const expensiveFunction = vitest_1.vi.fn();
            const cachedResult = { result: 'cached' };
            mockRedis.get.mockResolvedValue(JSON.stringify(cachedResult));
            const memoized = cacheService.memoize('test:fn', expensiveFunction);
            const result = await memoized('arg1', 'arg2');
            (0, vitest_1.expect)(expensiveFunction).not.toHaveBeenCalled();
            (0, vitest_1.expect)(result).toEqual(cachedResult);
        });
        (0, vitest_1.it)('should generate consistent cache keys', async () => {
            const expensiveFunction = vitest_1.vi.fn().mockResolvedValue({ result: 'test' });
            mockRedis.get.mockResolvedValue(null);
            mockRedis.set.mockResolvedValue('OK');
            const memoized = cacheService.memoize('test:fn', expensiveFunction);
            await memoized('arg1', 'arg2');
            await memoized('arg1', 'arg2');
            // Should use same cache key for same arguments
            (0, vitest_1.expect)(mockRedis.get).toHaveBeenCalledTimes(2);
            (0, vitest_1.expect)(mockRedis.get).toHaveBeenNthCalledWith(1, 'test:fn:hash');
            (0, vitest_1.expect)(mockRedis.get).toHaveBeenNthCalledWith(2, 'test:fn:hash');
        });
    });
});

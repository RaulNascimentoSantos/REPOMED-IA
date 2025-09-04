import { FastifyRequest, FastifyReply } from 'fastify';

let requestCount = 0;
let requestDurations: number[] = [];

export const metricsCollector = async (request: FastifyRequest, reply: FastifyReply) => {
  requestCount++;
  
  const duration = Date.now() - (request as any).startTime;
  requestDurations.push(duration);
  
  // Keep only last 1000 requests for memory efficiency
  if (requestDurations.length > 1000) {
    requestDurations = requestDurations.slice(-1000);
  }
};

export const getMetrics = () => {
  const avgDuration = requestDurations.length > 0 
    ? requestDurations.reduce((a, b) => a + b, 0) / requestDurations.length 
    : 0;
    
  return {
    totalRequests: requestCount,
    averageResponseTime: Math.round(avgDuration),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
};
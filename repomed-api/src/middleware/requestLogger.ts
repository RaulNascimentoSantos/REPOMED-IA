import { FastifyRequest, FastifyReply } from 'fastify';

export const requestLogger = async (request: FastifyRequest, reply: FastifyReply) => {
  const startTime = Date.now();
  (request as any).startTime = startTime;
  
  request.log.info({
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
    ip: request.ip
  });
};
import { FastifyInstance } from 'fastify';

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
  
  fastify.get('/api/auth/me', { preHandler: [fastify.authenticate] }, async () => {
    return { error: 'Not implemented yet' };
  });
  
  fastify.post('/api/auth/validate-crm', async () => {
    return { error: 'Not implemented yet' };
  });
  
  fastify.get('/api/cid10', async () => {
    return [];
  });
  
  fastify.get('/api/medications', async () => {
    return [];
  });
  
  fastify.post('/api/medications/interactions', async () => {
    return [];
  });
  
  fastify.get('/api/reports/analytics', { preHandler: [fastify.authenticate] }, async () => {
    return { error: 'Not implemented yet' };
  });
}
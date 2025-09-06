import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate('authenticate', async function(request: FastifyRequest, reply: FastifyReply) {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return reply.code(401).send({ error: 'No token provided' });
      }
      
      const decoded = await fastify.jwt.verify(token);
      request.user = decoded as any;
    } catch (err) {
      reply.code(401).send({ error: 'Invalid token' });
    }
  });
}

export default fp(authPlugin);
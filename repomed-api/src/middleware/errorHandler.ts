import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export const errorHandler = (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
  const { validation, validationContext } = error;

  // Validation errors
  if (validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: validation,
      context: validationContext
    });
  }

  // JWT errors
  if (error.code === 'FST_JWT_BAD_REQUEST') {
    return reply.status(401).send({
      error: 'Authentication Error',
      message: 'Invalid or missing token'
    });
  }

  // Rate limit errors
  if (error.statusCode === 429) {
    return reply.status(429).send({
      error: 'Rate Limit Exceeded',
      message: 'Too many requests, please try again later'
    });
  }

  // Database errors
  if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
    return reply.status(409).send({
      error: 'Conflict Error',
      message: 'Resource already exists'
    });
  }

  // Generic server errors
  request.log.error(error);
  
  return reply.status(error.statusCode || 500).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};
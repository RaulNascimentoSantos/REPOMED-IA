import '@fastify/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      tenantId?: string
      role?: string
    }
  }
  
  interface FastifyInstance {
    authenticate: any
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string
      email: string
      tenantId?: string
      role?: string
    }
  }
}
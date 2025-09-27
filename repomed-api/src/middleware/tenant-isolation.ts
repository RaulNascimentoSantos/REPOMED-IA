import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { db } from '../db';

// Routes that don't require tenant isolation
const PUBLIC_ROUTES = [
  '/health',
  '/metrics',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/share',
  '/api/verify'
];

interface TenantRequest extends FastifyRequest {
  organizationId?: string;
  user?: {
    id: string;
    email: string;
    organizationId: string;
    role: string;
  };
}

export const tenantIsolation = async (request: TenantRequest, reply: FastifyReply) => {
  // Skip tenant isolation for public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    request.url.startsWith(route)
  );

  if (isPublicRoute) {
    return;
  }

  // Extract user from JWT token (set by authentication middleware)
  const user = request.user;

  if (!user) {
    return reply.status(401).send({
      type: '/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Authentication required',
      instance: request.url,
      traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  }

  if (!user.organizationId) {
    return reply.status(403).send({
      type: '/errors/no-organization',
      title: 'No Organization',
      status: 403,
      detail: 'User is not associated with any organization',
      instance: request.url,
      traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  }

  // Set organization context for the request
  request.organizationId = user.organizationId;

  // Set PostgreSQL session variable for Row Level Security
  try {
    await db.execute(`SET LOCAL app.current_organization_id = '${user.organizationId}'`);
    await db.execute(`SET LOCAL app.current_user_id = '${user.id}'`);
  } catch (error) {
    console.error('Failed to set tenant context:', error);
    return reply.status(500).send({
      type: '/errors/tenant-context',
      title: 'Tenant Context Error',
      status: 500,
      detail: 'Failed to establish tenant context',
      instance: request.url,
      traceId: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  }
};

// Helper function to filter query results by organization
export const filterByOrganization = (organizationId: string) => {
  return { organization_id: organizationId };
};

// Helper function to add organization ID to insert/update data
export const addOrganizationId = (data: any, organizationId: string) => {
  return {
    ...data,
    organization_id: organizationId
  };
};

// Register tenant isolation as a global hook
export const registerTenantIsolation = (fastify: FastifyInstance) => {
  fastify.addHook('preHandler', tenantIsolation);
};
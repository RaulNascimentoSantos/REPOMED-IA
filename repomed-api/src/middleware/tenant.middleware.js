// MIDDLEWARE CORRIGIDO COM SET_CONFIG POR TRANSAÇÃO
// Data: 31/08/2025 - Prioridade: P0

import pg from 'pg'
const { Pool } = pg

// Usar pool do server principal - vai ser injetado
let pool = null

export function setPool(dbPool) {
  pool = dbPool
}

export async function tenantMiddleware(req, reply) {
  // Extrair tenant de múltiplas fontes
  const tenantId = 
    req.headers['x-tenant-id'] ||
    req.user?.tenantId ||
    req.query?.tenantId
  
  if (!tenantId) {
    return reply.code(400).send({ 
      error: 'Tenant ID is required',
      code: 'MISSING_TENANT'
    })
  }
  
  // Validar formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(tenantId)) {
    return reply.code(400).send({
      error: 'Invalid tenant ID format',
      code: 'INVALID_TENANT_FORMAT'
    })
  }
  
  try {
    if (!pool) {
      throw new Error('Database pool not initialized')
    }
    
    // Validar tenant existe e está ativo
    const result = await pool.query(
      'SELECT id, is_active, name, plan FROM tenants WHERE id = $1',
      [tenantId]
    )
    
    if (!result.rows[0]) {
      return reply.code(404).send({
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      })
    }
    
    const tenant = result.rows[0]
    
    if (!tenant.is_active) {
      return reply.code(403).send({
        error: 'Tenant is inactive',
        code: 'TENANT_INACTIVE'
      })
    }
    
    // CRÍTICO: Setar tenant no contexto PostgreSQL para RLS
    await pool.query(
      "SELECT set_config('app.current_tenant_id', $1, true)",
      [tenantId]
    )
    
    // Adicionar ao request para uso posterior
    req.tenantId = tenantId
    req.tenant = tenant
    
  } catch (error) {
    req.log.error({ error, tenantId }, 'Tenant middleware error')
    return reply.code(500).send({
      error: 'Internal server error',
      code: 'TENANT_MIDDLEWARE_ERROR'
    })
  }
}

// Aplicar em todas as rotas protegidas
export function registerTenantMiddleware(fastify) {
  // Excluir rotas públicas
  const publicRoutes = [
    '/health',
    '/metrics',
    '/docs',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password'
  ]
  
  fastify.addHook('preHandler', async (req, reply) => {
    // Skip para rotas públicas
    if (publicRoutes.some(route => req.url.startsWith(route))) {
      return
    }
    
    await tenantMiddleware(req, reply)
  })
}

// IMPORTANTE: Para workers/jobs BullMQ
export async function setTenantContext(tenantId) {
  if (!pool) {
    throw new Error('Database pool not initialized')
  }
  
  await pool.query(
    "SELECT set_config('app.current_tenant_id', $1, true)",
    [tenantId]
  )
}
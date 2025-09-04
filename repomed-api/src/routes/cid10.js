// Usar a conexão do fastify.db que já existe no servidor

export function registerCid10Routes(fastify) {
  // Buscar CID-10 por termo
  fastify.get('/api/cid10/search', {
    schema: {
      tags: ['CID-10'],
      description: 'Buscar diagnósticos CID-10',
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 2 },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        },
        required: ['q']
      }
    }
  }, async (request, reply) => {
    const { q, limit = 20 } = request.query;
    
    try {
      const results = await fastify.db.query(`
        SELECT code, description, category
        FROM cid10 
        WHERE code ILIKE $1
           OR description ILIKE $2
        ORDER BY 
          LENGTH(code),
          code
        LIMIT $3
      `, [`%${q}%`, `%${q}%`, limit]);
      
      return {
        success: true,
        data: results.rows
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: 'Erro na busca de CID-10'
      };
    }
  });

  // Obter CID-10 por código
  fastify.get('/api/cid10/:code', {
    schema: {
      tags: ['CID-10'],
      description: 'Obter CID-10 por código',
      params: {
        type: 'object',
        properties: {
          code: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { code } = request.params;
    
    try {
      const result = await fastify.db.query(`
        SELECT code, description, category 
        FROM cid10 
        WHERE code = $1
      `, [code]);
      
      if (result.rows.length === 0) {
        reply.code(404);
        return {
          success: false,
          error: 'CID-10 não encontrado'
        };
      }
      
      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: 'Erro ao buscar CID-10'
      };
    }
  });

  // Listar categorias CID-10
  fastify.get('/api/cid10/categories', {
    schema: {
      tags: ['CID-10'],
      description: 'Listar categorias de CID-10'
    }
  }, async (request, reply) => {
    try {
      const result = await fastify.db.query(`
        SELECT category, COUNT(*) as count
        FROM cid10 
        WHERE category IS NOT NULL
        GROUP BY category
        ORDER BY category
      `);
      
      return {
        success: true,
        data: result.rows
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: 'Erro ao buscar categorias'
      };
    }
  });
}

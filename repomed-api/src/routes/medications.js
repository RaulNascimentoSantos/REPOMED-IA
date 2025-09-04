// Usar a conexão do fastify.db que já existe no servidor

export function registerMedicationsRoutes(fastify) {
  // Buscar medicamentos
  fastify.get('/api/medications/search', {
    schema: {
      tags: ['Medications'],
      description: 'Buscar medicamentos',
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 2 },
          controlled: { type: 'boolean' },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
        },
        required: ['q']
      }
    }
  }, async (request, reply) => {
    const { q, controlled, limit = 20 } = request.query;
    
    try {
      let query = `
        SELECT id, name, active_ingredient, presentation, controlled, control_type
        FROM medications 
        WHERE searchable @@ websearch_to_tsquery('portuguese', $1)
           OR name ILIKE $2
           OR active_ingredient ILIKE $3
      `;
      
      const params = [q, `%${q}%`, `%${q}%`];
      
      if (controlled !== undefined) {
        query += ` AND controlled = $${params.length + 1}`;
        params.push(controlled);
      }
      
      query += `
        ORDER BY 
          ts_rank(searchable, websearch_to_tsquery('portuguese', $1)) DESC,
          name
        LIMIT $${params.length + 1}
      `;
      params.push(limit);
      
      const results = await fastify.db.query(query, params);
      
      return {
        success: true,
        data: results.rows
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: 'Erro na busca de medicamentos'
      };
    }
  });

  // Obter medicamento por ID
  fastify.get('/api/medications/:id', {
    schema: {
      tags: ['Medications'],
      description: 'Obter medicamento por ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    
    try {
      const result = await fastify.db.query(`
        SELECT id, name, active_ingredient, manufacturer, presentation, 
               dosage, controlled, control_type, max_dosage, pediatric_dosage,
               contraindications, interactions, side_effects
        FROM medications 
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        reply.code(404);
        return {
          success: false,
          error: 'Medicamento não encontrado'
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
        error: 'Erro ao buscar medicamento'
      };
    }
  });

  // Verificar interações medicamentosas
  fastify.post('/api/medications/interactions', {
    schema: {
      tags: ['Medications'],
      description: 'Verificar interações entre medicamentos',
      body: {
        type: 'object',
        properties: {
          medicationIds: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2
          }
        },
        required: ['medicationIds']
      }
    }
  }, async (request, reply) => {
    const { medicationIds } = request.body;
    
    try {
      const result = await fastify.db.query(`
        SELECT 
          di.severity,
          di.description,
          di.recommendation,
          m1.name as medication1,
          m2.name as medication2
        FROM drug_interactions di
        JOIN medications m1 ON di.drug1_id = m1.id
        JOIN medications m2 ON di.drug2_id = m2.id
        WHERE (di.drug1_id = ANY($1) AND di.drug2_id = ANY($1))
           OR (di.drug2_id = ANY($1) AND di.drug1_id = ANY($1))
        ORDER BY 
          CASE di.severity
            WHEN 'CONTRAINDICATED' THEN 1
            WHEN 'MAJOR' THEN 2
            WHEN 'MODERATE' THEN 3
            WHEN 'MINOR' THEN 4
          END
      `, [medicationIds]);
      
      return {
        success: true,
        data: result.rows
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return {
        success: false,
        error: 'Erro ao verificar interações'
      };
    }
  });

  // Listar medicamentos controlados
  fastify.get('/api/medications/controlled', {
    schema: {
      tags: ['Medications'],
      description: 'Listar medicamentos controlados'
    }
  }, async (request, reply) => {
    try {
      const result = await fastify.db.query(`
        SELECT id, name, active_ingredient, control_type, presentation
        FROM medications 
        WHERE controlled = true
        ORDER BY control_type, name
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
        error: 'Erro ao buscar medicamentos controlados'
      };
    }
  });
}

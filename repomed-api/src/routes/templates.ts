import { FastifyInstance } from 'fastify';
import { medicalTemplates } from '../templates/medical-templates';

export function registerTemplateRoutes(fastify: FastifyInstance) {
  // Listar todos os templates
  fastify.get('/api/templates', {
    schema: {
      tags: ['Templates'],
      description: 'Lista todos os templates médicos disponíveis',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  category: { type: 'string' },
                  specialty: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            total: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { category, specialty } = request.query as any;
    
    let filteredTemplates = medicalTemplates;
    
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    
    if (specialty) {
      filteredTemplates = filteredTemplates.filter(t => t.specialty.toLowerCase().includes(specialty.toLowerCase()));
    }
    
    // Retornar apenas metadados na lista
    const templates = filteredTemplates.map(template => ({
      id: template.id,
      name: template.name,
      category: template.category,
      specialty: template.specialty,
      description: template.description
    }));
    
    return {
      success: true,
      data: templates,
      total: templates.length
    };
  });

  // Obter template específico com campos
  fastify.get('/api/templates/:id', {
    schema: {
      tags: ['Templates'],
      description: 'Obter detalhes completos de um template específico',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                category: { type: 'string' },
                specialty: { type: 'string' },
                description: { type: 'string' },
                fields: { type: 'array' },
                template: { type: 'string' }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any;
    
    const template = medicalTemplates.find(t => t.id === id);
    
    if (!template) {
      reply.code(404);
      return {
        success: false,
        error: 'Template não encontrado'
      };
    }
    
    return {
      success: true,
      data: template
    };
  });

  // Listar categorias disponíveis
  fastify.get('/api/templates/categories', {
    schema: {
      tags: ['Templates'],
      description: 'Lista todas as categorias de templates disponíveis',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  count: { type: 'number' },
                  templates: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const categories: any = {};
    
    medicalTemplates.forEach(template => {
      if (!categories[template.category]) {
        categories[template.category] = {
          category: template.category,
          count: 0,
          templates: []
        };
      }
      categories[template.category].count++;
      categories[template.category].templates.push(template.name);
    });
    
    return {
      success: true,
      data: Object.values(categories)
    };
  });

  // Preview de template com dados mockados
  fastify.post('/api/templates/:id/preview', {
    schema: {
      tags: ['Templates'],
      description: 'Gerar preview de um template com dados de exemplo',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          data: { type: 'object' },
          doctor: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              crm: { type: 'string' },
              specialty: { type: 'string' }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            preview: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any;
    const { data = {}, doctor = {} } = request.body as any;
    
    const template = medicalTemplates.find(t => t.id === id);
    
    if (!template) {
      reply.code(404);
      return {
        success: false,
        error: 'Template não encontrado'
      };
    }
    
    // Dados mockados para preview
    const mockData = {
      current_date: new Date().toLocaleDateString('pt-BR'),
      current_city: 'São Paulo',
      doctor_name: doctor.name || 'Dr. João Silva',
      doctor_crm: doctor.crm || '123456/SP',
      doctor_specialty: doctor.specialty || 'Clínica Geral',
      patient_name: data.patient_name || 'Maria Silva Santos',
      patient_cpf: data.patient_cpf || '123.456.789-00',
      ...data
    };
    
    // Simple template replacement (Handlebars seria melhor para produção)
    let preview = template.template;
    
    Object.entries(mockData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    });
    
    // Handle arrays (medications, exams, etc.)
    if (data.medications && Array.isArray(data.medications)) {
      let medicationsText = '';
      data.medications.forEach((med: any) => {
        medicationsText += `• ${med.name || 'Nome do medicamento'} - ${med.dosage || 'Dosagem'}\n`;
        medicationsText += `  Posologia: ${med.frequency || 'Frequência'} - ${med.duration || 'Duração'}\n`;
        if (med.instructions) {
          medicationsText += `  Obs: ${med.instructions}\n`;
        }
      });
      preview = preview.replace(/{{#medications}}.*?{{\/medications}}/s, medicationsText);
    }
    
    // Clean up any remaining template syntax
    preview = preview.replace(/{{#\w+}}.*?{{\/\w+}}/gs, '');
    preview = preview.replace(/{{\w+}}/g, '[Campo não preenchido]');
    
    return {
      success: true,
      preview: preview.trim()
    };
  });
}
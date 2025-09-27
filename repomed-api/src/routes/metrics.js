// Sistema de métricas em tempo real para dashboard
const metricsData = {
  daily: [],
  monthly: [],
  realtime: {
    activeUsers: 0,
    documentsToday: 0,
    templatesUsed: 0,
    patientsRegistered: 0
  }
};

// Função para gerar dados mockados de métricas
function generateMockMetrics() {
  const now = new Date();
  
  // Dados dos últimos 30 dias
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    metricsData.daily.push({
      date: date.toISOString().split('T')[0],
      documents: Math.floor(Math.random() * 50) + 10,
      patients: Math.floor(Math.random() * 20) + 5,
      templates: Math.floor(Math.random() * 15) + 3,
      signatures: Math.floor(Math.random() * 30) + 8
    });
  }
  
  // Dados dos últimos 12 meses
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    metricsData.monthly.push({
      month: date.toISOString().substr(0, 7), // YYYY-MM
      documents: Math.floor(Math.random() * 800) + 200,
      patients: Math.floor(Math.random() * 300) + 100,
      templates: Math.floor(Math.random() * 200) + 50,
      signatures: Math.floor(Math.random() * 600) + 150
    });
  }
  
  // Atualizar métricas em tempo real
  setInterval(() => {
    metricsData.realtime = {
      activeUsers: Math.floor(Math.random() * 25) + 5,
      documentsToday: Math.floor(Math.random() * 100) + 20,
      templatesUsed: Math.floor(Math.random() * 15) + 5,
      patientsRegistered: Math.floor(Math.random() * 50) + 10
    };
  }, 5000); // Atualizar a cada 5 segundos
}

// Inicializar dados mock
generateMockMetrics();

export function registerMetricsRoutes(fastify) {
  
  // Dashboard principal - métricas resumidas
  fastify.get('/api/metrics/dashboard', {
    schema: {
      tags: ['Metrics'],
      description: 'Métricas principais do dashboard',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                summary: {
                  type: 'object',
                  properties: {
                    totalDocuments: { type: 'number' },
                    totalPatients: { type: 'number' },
                    totalTemplates: { type: 'number' },
                    totalSignatures: { type: 'number' }
                  }
                },
                today: {
                  type: 'object',
                  properties: {
                    documents: { type: 'number' },
                    patients: { type: 'number' },
                    templates: { type: 'number' },
                    signatures: { type: 'number' }
                  }
                },
                growth: {
                  type: 'object',
                  properties: {
                    documents: { type: 'number' },
                    patients: { type: 'number' },
                    templates: { type: 'number' },
                    signatures: { type: 'number' }
                  }
                },
                realtime: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const currentMonth = metricsData.monthly[metricsData.monthly.length - 1];
    const previousMonth = metricsData.monthly[metricsData.monthly.length - 2];
    const today = metricsData.daily[metricsData.daily.length - 1];
    
    return {
      success: true,
      data: {
        summary: {
          totalDocuments: metricsData.monthly.reduce((sum, m) => sum + m.documents, 0),
          totalPatients: metricsData.monthly.reduce((sum, m) => sum + m.patients, 0),
          totalTemplates: 25, // Templates disponíveis
          totalSignatures: metricsData.monthly.reduce((sum, m) => sum + m.signatures, 0)
        },
        today: {
          documents: today.documents,
          patients: today.patients,
          templates: today.templates,
          signatures: today.signatures
        },
        growth: {
          documents: ((currentMonth.documents - previousMonth.documents) / previousMonth.documents * 100).toFixed(1),
          patients: ((currentMonth.patients - previousMonth.patients) / previousMonth.patients * 100).toFixed(1),
          templates: ((currentMonth.templates - previousMonth.templates) / previousMonth.templates * 100).toFixed(1),
          signatures: ((currentMonth.signatures - previousMonth.signatures) / previousMonth.signatures * 100).toFixed(1)
        },
        realtime: metricsData.realtime
      }
    };
  });

  // Métricas diárias (últimos 30 dias)
  fastify.get('/api/metrics/daily', {
    schema: {
      tags: ['Metrics'],
      description: 'Métricas diárias dos últimos 30 dias',
      querystring: {
        type: 'object',
        properties: {
          days: { type: 'number', minimum: 1, maximum: 90, default: 30 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { days = 30 } = request.query;
    const data = metricsData.daily.slice(-days);
    
    return {
      success: true,
      data
    };
  });

  // Métricas mensais (últimos 12 meses)
  fastify.get('/api/metrics/monthly', {
    schema: {
      tags: ['Metrics'],
      description: 'Métricas mensais dos últimos 12 meses',
      querystring: {
        type: 'object',
        properties: {
          months: { type: 'number', minimum: 1, maximum: 24, default: 12 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { months = 12 } = request.query;
    const data = metricsData.monthly.slice(-months);
    
    return {
      success: true,
      data
    };
  });

  // Métricas por especialidade médica
  fastify.get('/api/metrics/specialties', {
    schema: {
      tags: ['Metrics'],
      description: 'Métricas por especialidade médica',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const specialties = [
      { name: 'Clínica Geral', documents: 245, percentage: 35.2 },
      { name: 'Cardiologia', documents: 156, percentage: 22.4 },
      { name: 'Pediatria', documents: 98, percentage: 14.1 },
      { name: 'Ortopedia', documents: 87, percentage: 12.5 },
      { name: 'Dermatologia', documents: 67, percentage: 9.6 },
      { name: 'Outras', documents: 43, percentage: 6.2 }
    ];
    
    return {
      success: true,
      data: specialties
    };
  });

  // Métricas por tipo de documento
  fastify.get('/api/metrics/document-types', {
    schema: {
      tags: ['Metrics'],
      description: 'Métricas por tipo de documento',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const documentTypes = [
      { type: 'Receitas', count: 412, percentage: 42.1, color: '#6366f1' },
      { type: 'Atestados', count: 298, percentage: 30.4, color: '#10b981' },
      { type: 'Exames', count: 156, percentage: 15.9, color: '#f59e0b' },
      { type: 'Encaminhamentos', count: 89, percentage: 9.1, color: '#ef4444' },
      { type: 'Relatórios', count: 25, percentage: 2.5, color: '#8b5cf6' }
    ];
    
    return {
      success: true,
      data: documentTypes
    };
  });

  // Status do sistema e performance
  fastify.get('/api/metrics/system', {
    schema: {
      tags: ['Metrics'],
      description: 'Métricas de sistema e performance',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                uptime: { type: 'number' },
                memory: { type: 'object' },
                cpu: { type: 'object' },
                api: { type: 'object' },
                database: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const memUsage = process.memoryUsage();
    
    return {
      success: true,
      data: {
        uptime: Math.floor(process.uptime()),
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
          rss: Math.round(memUsage.rss / 1024 / 1024)
        },
        cpu: {
          usage: (Math.random() * 30 + 5).toFixed(1), // Mock CPU usage
          load: [0.2, 0.15, 0.1] // Mock load average
        },
        api: {
          requestsToday: Math.floor(Math.random() * 1000) + 500,
          avgResponseTime: (Math.random() * 100 + 50).toFixed(0),
          errorRate: (Math.random() * 2).toFixed(2),
          status: 'healthy'
        },
        database: {
          connections: Math.floor(Math.random() * 10) + 5,
          avgQueryTime: (Math.random() * 50 + 10).toFixed(0),
          status: 'mock'
        }
      }
    };
  });

  // Métricas em tempo real via WebSocket (simulated with HTTP)
  fastify.get('/api/metrics/realtime', {
    schema: {
      tags: ['Metrics'],
      description: 'Métricas em tempo real',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    return {
      success: true,
      data: metricsData.realtime,
      timestamp: new Date().toISOString()
    };
  });

  // Relatório de uso por médico
  fastify.get('/api/metrics/doctors', {
    schema: {
      tags: ['Metrics'],
      description: 'Métricas de uso por médico',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const doctors = [
      { name: 'Dr. João Silva', crm: '123456/SP', documents: 89, patients: 156, lastActivity: '2024-01-15T14:30:00Z' },
      { name: 'Dra. Maria Santos', crm: '789012/RJ', documents: 67, patients: 134, lastActivity: '2024-01-15T16:45:00Z' },
      { name: 'Dr. Carlos Oliveira', crm: '345678/MG', documents: 45, patients: 98, lastActivity: '2024-01-15T11:20:00Z' },
      { name: 'Dra. Ana Costa', crm: '901234/SP', documents: 78, patients: 187, lastActivity: '2024-01-15T13:15:00Z' }
    ];
    
    return {
      success: true,
      data: doctors
    };
  });

  // Métricas de segurança e auditoria
  fastify.get('/api/metrics/security', {
    schema: {
      tags: ['Metrics'],
      description: 'Métricas de segurança e auditoria',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                loginAttempts: { type: 'object' },
                documentAccess: { type: 'object' },
                signatures: { type: 'object' },
                alerts: { type: 'array' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    return {
      success: true,
      data: {
        loginAttempts: {
          successful: 245,
          failed: 12,
          blocked: 3,
          lastFailed: '2024-01-15T12:34:00Z'
        },
        documentAccess: {
          views: 1456,
          downloads: 234,
          shares: 45,
          verifications: 67
        },
        signatures: {
          valid: 298,
          pending: 12,
          expired: 5,
          revoked: 0
        },
        alerts: [
          { type: 'info', message: 'Sistema funcionando normalmente', timestamp: '2024-01-15T16:00:00Z' },
          { type: 'warning', message: 'Backup agendado para hoje às 23:00', timestamp: '2024-01-15T15:30:00Z' }
        ]
      }
    };
  });
}
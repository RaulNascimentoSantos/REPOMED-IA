// Sistema completo de gerenciamento de pacientes
const patients = []; // Mock database - substitua por banco real

export function registerPatientRoutes(fastify) {
  
  // Listar todos os pacientes
  fastify.get('/api/patients', {
    schema: {
      tags: ['Patients'],
      description: 'Lista todos os pacientes cadastrados',
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Buscar por nome, CPF ou email' },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                pages: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { search = '', page = 1, limit = 20 } = request.query;
    
    let filteredPatients = [...patients];
    
    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPatients = filteredPatients.filter(patient => 
        patient.name.toLowerCase().includes(searchLower) ||
        patient.cpf.includes(search) ||
        patient.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Paginação
    const total = filteredPatients.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedPatients = filteredPatients.slice(offset, offset + limit);
    
    return {
      success: true,
      data: paginatedPatients,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    };
  });

  // Obter paciente específico
  fastify.get('/api/patients/:id', {
    schema: {
      tags: ['Patients'],
      description: 'Obter detalhes de um paciente específico',
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
            data: { type: 'object' }
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
    const { id } = request.params;
    
    const patient = patients.find(p => p.id === id);
    
    if (!patient) {
      reply.code(404);
      return {
        success: false,
        error: 'Paciente não encontrado'
      };
    }
    
    return {
      success: true,
      data: patient
    };
  });

  // Criar novo paciente
  fastify.post('/api/patients', {
    schema: {
      tags: ['Patients'],
      description: 'Cadastrar novo paciente',
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 255 },
          cpf: { type: 'string', pattern: '^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}$' },
          rg: { type: 'string', maxLength: 20 },
          birthDate: { type: 'string', format: 'date' },
          phone: { type: 'string', maxLength: 20 },
          email: { type: 'string', format: 'email' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              number: { type: 'string' },
              complement: { type: 'string' },
              neighborhood: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string', maxLength: 2 },
              zipCode: { type: 'string', pattern: '^[0-9]{5}-[0-9]{3}$' }
            }
          },
          emergencyContact: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              relationship: { type: 'string' },
              phone: { type: 'string' }
            }
          },
          medicalInfo: {
            type: 'object',
            properties: {
              bloodType: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
              allergies: { type: 'array', items: { type: 'string' } },
              medications: { type: 'array', items: { type: 'string' } },
              conditions: { type: 'array', items: { type: 'string' } },
              notes: { type: 'string' }
            }
          }
        },
        required: ['name', 'cpf']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const patientData = request.body;
    
    // Verificar se CPF já existe
    const existingPatient = patients.find(p => p.cpf === patientData.cpf);
    if (existingPatient) {
      reply.code(400);
      return {
        success: false,
        error: 'Já existe um paciente cadastrado com este CPF'
      };
    }
    
    // Criar novo paciente
    const newPatient = {
      id: `pat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(patientData.name)}&background=6366f1&color=fff&size=128`
    };
    
    patients.push(newPatient);
    
    reply.code(201);
    return {
      success: true,
      data: newPatient
    };
  });

  // Atualizar paciente
  fastify.put('/api/patients/:id', {
    schema: {
      tags: ['Patients'],
      description: 'Atualizar dados de um paciente',
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
          name: { type: 'string', minLength: 2, maxLength: 255 },
          cpf: { type: 'string', pattern: '^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}$' },
          rg: { type: 'string', maxLength: 20 },
          birthDate: { type: 'string', format: 'date' },
          phone: { type: 'string', maxLength: 20 },
          email: { type: 'string', format: 'email' },
          address: { type: 'object' },
          emergencyContact: { type: 'object' },
          medicalInfo: { type: 'object' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
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
    const { id } = request.params;
    const updateData = request.body;
    
    const patientIndex = patients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      reply.code(404);
      return {
        success: false,
        error: 'Paciente não encontrado'
      };
    }
    
    // Verificar CPF duplicado (exceto o próprio paciente)
    if (updateData.cpf) {
      const existingPatient = patients.find(p => p.cpf === updateData.cpf && p.id !== id);
      if (existingPatient) {
        reply.code(400);
        return {
          success: false,
          error: 'Já existe outro paciente cadastrado com este CPF'
        };
      }
    }
    
    // Atualizar paciente
    patients[patientIndex] = {
      ...patients[patientIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return {
      success: true,
      data: patients[patientIndex]
    };
  });

  // Excluir paciente
  fastify.delete('/api/patients/:id', {
    schema: {
      tags: ['Patients'],
      description: 'Excluir um paciente',
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
            message: { type: 'string' }
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
    const { id } = request.params;
    
    const patientIndex = patients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      reply.code(404);
      return {
        success: false,
        error: 'Paciente não encontrado'
      };
    }
    
    patients.splice(patientIndex, 1);
    
    return {
      success: true,
      message: 'Paciente excluído com sucesso'
    };
  });

  // Buscar pacientes por nome (autocomplete)
  fastify.get('/api/patients/search/:query', {
    schema: {
      tags: ['Patients'],
      description: 'Buscar pacientes por nome para autocomplete',
      params: {
        type: 'object',
        properties: {
          query: { type: 'string', minLength: 2 }
        },
        required: ['query']
      },
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
                  cpf: { type: 'string' },
                  avatar: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { query } = request.params;
    const searchLower = query.toLowerCase();
    
    const results = patients
      .filter(patient => 
        patient.name.toLowerCase().includes(searchLower) ||
        patient.cpf.includes(query)
      )
      .slice(0, 10) // Limitar a 10 resultados
      .map(patient => ({
        id: patient.id,
        name: patient.name,
        cpf: patient.cpf,
        avatar: patient.avatar
      }));
    
    return {
      success: true,
      data: results
    };
  });

  // Adicionar alguns pacientes de exemplo
  if (patients.length === 0) {
    const examplePatients = [
      {
        id: 'pat_example_1',
        name: 'Maria Silva Santos',
        cpf: '123.456.789-00',
        rg: 'MG-12.345.678',
        birthDate: '1985-03-15',
        phone: '(31) 99999-0001',
        email: 'maria.silva@email.com',
        address: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 45',
          neighborhood: 'Centro',
          city: 'Belo Horizonte',
          state: 'MG',
          zipCode: '30000-123'
        },
        emergencyContact: {
          name: 'João Silva Santos',
          relationship: 'Esposo',
          phone: '(31) 99999-0002'
        },
        medicalInfo: {
          bloodType: 'O+',
          allergies: ['Penicilina', 'Dipirona'],
          medications: ['Losartana 50mg'],
          conditions: ['Hipertensão'],
          notes: 'Paciente alérgica a anti-inflamatórios. Histórico familiar de diabetes.'
        },
        avatar: 'https://ui-avatars.com/api/?name=Maria+Silva+Santos&background=6366f1&color=fff&size=128',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'pat_example_2',
        name: 'Carlos Eduardo Oliveira',
        cpf: '987.654.321-00',
        rg: 'SP-98.765.432',
        birthDate: '1970-08-22',
        phone: '(11) 98888-0001',
        email: 'carlos.oliveira@email.com',
        address: {
          street: 'Av. Paulista',
          number: '1500',
          complement: '',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100'
        },
        emergencyContact: {
          name: 'Ana Oliveira',
          relationship: 'Esposa',
          phone: '(11) 98888-0002'
        },
        medicalInfo: {
          bloodType: 'A+',
          allergies: [],
          medications: ['Metformina 850mg'],
          conditions: ['Diabetes Tipo 2'],
          notes: 'Diabético controlado com dieta e medicação. Pratica exercícios regularmente.'
        },
        avatar: 'https://ui-avatars.com/api/?name=Carlos+Eduardo+Oliveira&background=ef4444&color=fff&size=128',
        createdAt: '2024-01-10T14:20:00Z',
        updatedAt: '2024-01-10T14:20:00Z'
      },
      {
        id: 'pat_example_3',
        name: 'Ana Beatriz Costa',
        cpf: '456.789.123-00',
        rg: 'RJ-45.678.912',
        birthDate: '1992-12-03',
        phone: '(21) 97777-0001',
        email: 'ana.costa@email.com',
        address: {
          street: 'Rua Copacabana',
          number: '789',
          complement: 'Cobertura',
          neighborhood: 'Copacabana',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipCode: '22070-001'
        },
        emergencyContact: {
          name: 'Beatriz Costa',
          relationship: 'Mãe',
          phone: '(21) 97777-0002'
        },
        medicalInfo: {
          bloodType: 'B-',
          allergies: ['Látex'],
          medications: [],
          conditions: [],
          notes: 'Jovem, saudável. Alergia ao látex identificada em procedimento odontológico.'
        },
        avatar: 'https://ui-avatars.com/api/?name=Ana+Beatriz+Costa&background=10b981&color=fff&size=128',
        createdAt: '2024-01-20T09:15:00Z',
        updatedAt: '2024-01-20T09:15:00Z'
      }
    ];

    patients.push(...examplePatients);
  }
}
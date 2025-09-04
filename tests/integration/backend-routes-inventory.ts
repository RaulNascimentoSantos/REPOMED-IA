// 🔌 Backend Routes Inventory - RepoMed IA
// Generated for Integration Testing

export const BACKEND_ROUTES_INVENTORY = {
  // ====== AUTHENTICATION ROUTES ======
  auth: {
    login: {
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'string', password: 'string' },
      response: { token: 'string', user: 'object' },
      status: 200
    },
    register: {
      method: 'POST', 
      path: '/api/auth/register',
      body: { name: 'string', email: 'string', password: 'string', crm: 'string?' },
      response: { user: 'object', token: 'string' },
      status: 201
    },
    me: {
      method: 'GET',
      path: '/api/auth/me', 
      headers: { authorization: 'Bearer token' },
      response: { user: 'object' },
      status: 200
    },
    refresh: {
      method: 'POST',
      path: '/api/auth/refresh',
      body: { refreshToken: 'string' },
      response: { token: 'string' },
      status: 200  
    },
    logout: {
      method: 'POST',
      path: '/api/auth/logout',
      headers: { authorization: 'Bearer token' },
      response: { message: 'string' },
      status: 200
    }
  },

  // ====== PATIENTS ROUTES ======
  patients: {
    list: {
      method: 'GET',
      path: '/api/patients',
      query: { page: 'number?', limit: 'number?', search: 'string?', gender: 'string?', ageRange: 'string?' },
      response: { data: 'array', total: 'number', page: 'number', limit: 'number' },
      status: 200
    },
    get: {
      method: 'GET', 
      path: '/api/patients/:id',
      params: { id: 'string' },
      response: { patient: 'object' },
      status: 200
    },
    create: {
      method: 'POST',
      path: '/api/patients',
      body: { name: 'string', cpf: 'string', email: 'string?', phone: 'string?', birthDate: 'string?', gender: 'string?', address: 'object?' },
      response: { patient: 'object' },
      status: 201
    },
    update: {
      method: 'PUT',
      path: '/api/patients/:id',
      params: { id: 'string' },
      body: { name: 'string?', email: 'string?', phone: 'string?', address: 'object?' },
      response: { patient: 'object' },
      status: 200
    },
    delete: {
      method: 'DELETE',
      path: '/api/patients/:id',
      params: { id: 'string' },
      response: { message: 'string' },
      status: 200
    },
    search: {
      method: 'GET',
      path: '/api/patients/search',
      query: { q: 'string', limit: 'number?' },
      response: { patients: 'array' },
      status: 200
    }
  },

  // ====== TEMPLATES ROUTES ======
  templates: {
    list: {
      method: 'GET',
      path: '/api/templates',
      query: { category: 'string?', active: 'boolean?', search: 'string?' },
      response: { templates: 'array', total: 'number' },
      status: 200
    },
    get: {
      method: 'GET',
      path: '/api/templates/:id',
      params: { id: 'string' },
      response: { template: 'object' },
      status: 200
    },
    create: {
      method: 'POST',
      path: '/api/templates',
      body: { name: 'string', description: 'string?', category: 'string', fields: 'object', active: 'boolean?' },
      response: { template: 'object' },
      status: 201
    },
    update: {
      method: 'PUT',
      path: '/api/templates/:id',
      params: { id: 'string' },
      body: { name: 'string?', description: 'string?', category: 'string?', fields: 'object?', active: 'boolean?' },
      response: { template: 'object' },
      status: 200
    },
    delete: {
      method: 'DELETE',
      path: '/api/templates/:id',
      params: { id: 'string' },
      response: { message: 'string' },
      status: 200
    },
    categories: {
      method: 'GET',
      path: '/api/templates/categories',
      response: { categories: 'array' },
      status: 200
    }
  },

  // ====== DOCUMENTS ROUTES ======
  documents: {
    list: {
      method: 'GET',
      path: '/api/documents',
      query: { status: 'string?', patientId: 'string?', templateId: 'string?', page: 'number?', limit: 'number?', search: 'string?' },
      response: { documents: 'array', total: 'number', page: 'number', limit: 'number' },
      status: 200
    },
    get: {
      method: 'GET',
      path: '/api/documents/:id',
      params: { id: 'string' },
      response: { document: 'object' },
      status: 200
    },
    create: {
      method: 'POST',
      path: '/api/documents',
      body: { templateId: 'string', patientId: 'string', title: 'string?', content: 'object', metadata: 'object?' },
      response: { document: 'object' },
      status: 201
    },
    update: {
      method: 'PUT',
      path: '/api/documents/:id',
      params: { id: 'string' },
      body: { title: 'string?', content: 'object?', status: 'string?', metadata: 'object?' },
      response: { document: 'object' },
      status: 200
    },
    delete: {
      method: 'DELETE', 
      path: '/api/documents/:id',
      params: { id: 'string' },
      response: { message: 'string' },
      status: 200
    },
    sign: {
      method: 'POST',
      path: '/api/documents/:id/sign',
      params: { id: 'string' },
      body: { password: 'string?', reason: 'string?', location: 'string?' },
      response: { document: 'object', signature: 'object' },
      status: 200
    },
    pdf: {
      method: 'GET',
      path: '/api/documents/:id/pdf',
      params: { id: 'string' },
      response: 'PDF Binary',
      headers: { 'content-type': 'application/pdf' },
      status: 200
    },
    share: {
      method: 'POST',
      path: '/api/documents/:id/share', 
      params: { id: 'string' },
      body: { expiresIn: 'string?', password: 'string?', allowDownload: 'boolean?' },
      response: { shareUrl: 'string', shareToken: 'string', expiresAt: 'string' },
      status: 201
    },
    verify: {
      method: 'GET',
      path: '/api/documents/verify/:hash',
      params: { hash: 'string' },
      response: { document: 'object', signature: 'object', valid: 'boolean' },
      status: 200
    },
    audit: {
      method: 'GET',
      path: '/api/audit/:documentId',
      params: { documentId: 'string' },
      response: { auditLog: 'array' },
      status: 200
    }
  },

  // ====== PRESCRIPTIONS ROUTES ======
  prescriptions: {
    list: {
      method: 'GET',
      path: '/api/prescriptions',
      query: { patientId: 'string?', status: 'string?', page: 'number?', limit: 'number?' },
      response: { prescriptions: 'array', total: 'number' },
      status: 200
    },
    get: {
      method: 'GET',
      path: '/api/prescriptions/:id',
      params: { id: 'string' },
      response: { prescription: 'object' },
      status: 200
    },
    create: {
      method: 'POST',
      path: '/api/prescriptions',
      body: { patientId: 'string', medications: 'array', instructions: 'string?', validUntil: 'string?' },
      response: { prescription: 'object' },
      status: 201
    },
    update: {
      method: 'PUT',
      path: '/api/prescriptions/:id',
      params: { id: 'string' },
      body: { medications: 'array?', instructions: 'string?', status: 'string?' },
      response: { prescription: 'object' },
      status: 200
    },
    delete: {
      method: 'DELETE',
      path: '/api/prescriptions/:id', 
      params: { id: 'string' },
      response: { message: 'string' },
      status: 200
    }
  },

  // ====== SIGNATURES ROUTES ======
  signatures: {
    request: {
      method: 'POST',
      path: '/api/signatures/request',
      body: { documentId: 'string', signerEmail: 'string?', reason: 'string?', location: 'string?' },
      response: { requestId: 'string', status: 'string' },
      status: 201
    },
    verify: {
      method: 'POST',
      path: '/api/signatures/verify',
      body: { token: 'string', documentHash: 'string?' },
      response: { valid: 'boolean', signature: 'object' },
      status: 200
    },
    sign: {
      method: 'POST',
      path: '/api/signatures/sign',
      body: { requestId: 'string', password: 'string', certificate: 'string?' },
      response: { signature: 'object', documentHash: 'string' },
      status: 200
    },
    status: {
      method: 'GET',
      path: '/api/signatures/status/:requestId',
      params: { requestId: 'string' },
      response: { status: 'string', signedAt: 'string?', signer: 'object?' },
      status: 200
    }
  },

  // ====== METRICS ROUTES ======
  metrics: {
    dashboard: {
      method: 'GET',
      path: '/api/metrics/dashboard',
      response: { 
        totalPatients: 'number', 
        totalDocuments: 'number', 
        totalTemplates: 'number',
        recentActivity: 'array',
        documentsPerMonth: 'array',
        topTemplates: 'array'
      },
      status: 200
    },
    performance: {
      method: 'GET', 
      path: '/api/metrics/performance',
      query: { period: 'string?', metric: 'string?' },
      response: { 
        responseTime: 'object',
        throughput: 'object', 
        errorRate: 'object',
        uptime: 'number'
      },
      status: 200
    },
    cache: {
      method: 'GET',
      path: '/api/metrics/cache',
      response: { 
        hitRate: 'number',
        missRate: 'number',
        totalKeys: 'number',
        memoryUsage: 'object'
      },
      status: 200
    },
    health: {
      method: 'GET',
      path: '/api/health',
      response: { 
        status: 'string',
        timestamp: 'string',
        services: 'object',
        uptime: 'number'
      },
      status: 200
    }
  },

  // ====== UPLOAD ROUTES ======
  upload: {
    file: {
      method: 'POST',
      path: '/api/upload',
      body: 'FormData',
      headers: { 'content-type': 'multipart/form-data' },
      response: { 
        url: 'string',
        filename: 'string', 
        size: 'number',
        mimetype: 'string'
      },
      status: 200
    },
    multiple: {
      method: 'POST',
      path: '/api/upload/multiple',
      body: 'FormData',
      headers: { 'content-type': 'multipart/form-data' },
      response: { files: 'array' },
      status: 200
    }
  },

  // ====== PUBLIC SHARES ROUTES ======  
  public: {
    share: {
      method: 'GET',
      path: '/api/documents/share/:token',
      params: { token: 'string' },
      query: { password: 'string?' },
      response: { document: 'object', allowDownload: 'boolean' },
      status: 200
    },
    verify: {
      method: 'GET',
      path: '/api/documents/verify/:hash',
      params: { hash: 'string' },
      response: { document: 'object', signature: 'object', valid: 'boolean' },
      status: 200
    }
  },

  // ====== PERFORMANCE ROUTES ======
  performance: {
    metrics: {
      method: 'GET',
      path: '/api/performance/metrics',
      response: { 
        requestMetrics: 'array',
        systemMetrics: 'object',
        cacheMetrics: 'object'
      },
      status: 200
    },
    report: {
      method: 'GET',
      path: '/api/performance/report',
      query: { startDate: 'string?', endDate: 'string?', format: 'string?' },
      response: { 
        summary: 'object',
        details: 'array',
        recommendations: 'array'
      },
      status: 200
    }
  }
}

// Total de endpoints identificados
export const TOTAL_ENDPOINTS = Object.values(BACKEND_ROUTES_INVENTORY)
  .reduce((total, routes) => total + Object.keys(routes).length, 0);

console.log(`🔍 Backend Routes Inventory: ${TOTAL_ENDPOINTS} endpoints mapeados`);
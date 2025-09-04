// 🖥️ Frontend API Calls Inventory - RepoMed IA
// Generated for Integration Testing

export const FRONTEND_API_CALLS_INVENTORY = {
  
  // ====== AUTHENTICATION CALLS ======
  useAuth: {
    login: {
      hook: 'useAuth',
      endpoint: 'POST /api/auth/login',
      file: 'src/hooks/useAuth.ts',
      payload: { email: 'string', password: 'string' },
      response: { token: 'string', user: 'object' },
      usedIn: ['LoginPage.jsx', 'AuthRegisterPage.jsx']
    },
    register: {
      hook: 'useAuth', 
      endpoint: 'POST /api/auth/register',
      file: 'src/hooks/useAuth.ts',
      payload: { name: 'string', email: 'string', password: 'string', crm: 'string?' },
      response: { user: 'object', token: 'string' },
      usedIn: ['AuthRegisterPage.jsx']
    },
    me: {
      hook: 'useAuth',
      endpoint: 'GET /api/auth/me',
      file: 'src/hooks/useAuth.ts', 
      headers: { authorization: 'Bearer token' },
      response: { user: 'object' },
      usedIn: ['App.jsx', 'Layout.jsx', 'Header.jsx']
    },
    logout: {
      hook: 'useAuth',
      endpoint: 'POST /api/auth/logout',
      file: 'src/hooks/useAuth.ts',
      headers: { authorization: 'Bearer token' },
      response: { message: 'string' },
      usedIn: ['Header.jsx', 'Navigation.jsx']
    }
  },

  // ====== DOCUMENTS CALLS ======
  useDocuments: {
    list: {
      hook: 'useDocuments',
      endpoint: 'GET /api/documents',
      file: 'src/hooks/useApi.js:47',
      query: { status: 'string?', patientId: 'string?', templateId: 'string?', page: 'number?', limit: 'number?', search: 'string?' },
      response: { documents: 'array', total: 'number', page: 'number', limit: 'number' },
      usedIn: ['DocumentsPage.jsx', 'DocumentsListPage.jsx', 'HomePage.jsx']
    },
    get: {
      hook: 'useDocument', 
      endpoint: 'GET /api/documents/:id',
      file: 'src/hooks/useApi.js:65',
      params: { id: 'string' },
      response: { document: 'object' },
      usedIn: ['DocumentDetailPage.jsx', 'DocumentSigningPage.jsx']
    },
    create: {
      hook: 'useCreateDocument',
      endpoint: 'POST /api/documents', 
      file: 'src/hooks/useApi.js:94',
      payload: { templateId: 'string', patientId: 'string', title: 'string?', content: 'object', metadata: 'object?' },
      response: { document: 'object' },
      usedIn: ['CreateDocumentPage.jsx', 'CreateDocument.jsx']
    },
    sign: {
      hook: 'useSignDocument',
      endpoint: 'POST /api/documents/:id/sign',
      file: 'src/hooks/useApi.js:110',
      params: { id: 'string' },
      payload: { password: 'string?', reason: 'string?', location: 'string?' },
      response: { document: 'object', signature: 'object' },
      usedIn: ['DocumentSigningPage.jsx']
    },
    pdf: {
      hook: 'useDocumentPDF',
      endpoint: 'GET /api/documents/:id/pdf',
      file: 'src/hooks/useApi.js:130',
      params: { id: 'string' },
      response: 'PDF Binary',
      headers: { 'content-type': 'application/pdf' },
      usedIn: ['DocumentDetailPage.jsx', 'SharePage.jsx']
    },
    infiniteScroll: {
      hook: 'useInfiniteDocuments',
      endpoint: 'GET /api/documents',
      file: 'src/hooks/useApi.js:75',
      query: { page: 'number', limit: 'number', ...filters },
      response: { documents: 'array', hasMore: 'boolean' },
      usedIn: ['DocumentsOptimizedPage.jsx']
    }
  },

  // ====== PATIENTS CALLS ======
  usePatients: {
    list: {
      hook: 'usePatients',
      endpoint: 'GET /api/patients',
      file: 'src/hooks/useApi.js:146',
      query: { page: 'number?', limit: 'number?', search: 'string?', gender: 'string?', ageRange: 'string?' },
      response: { data: 'array', total: 'number', page: 'number', limit: 'number' },
      usedIn: ['PatientsPage.jsx', 'HomePage.jsx']
    },
    get: {
      hook: 'usePatient',
      endpoint: 'GET /api/patients/:id',
      file: 'src/hooks/useApi.js:157',
      params: { id: 'string' },
      response: { patient: 'object' },
      usedIn: ['PatientDetailPage.jsx', 'PatientEditPage.jsx']
    },
    create: {
      hook: 'useCreatePatient',
      endpoint: 'POST /api/patients',
      file: 'src/hooks/useApi.js:182',
      payload: { name: 'string', cpf: 'string', email: 'string?', phone: 'string?', birthDate: 'string?', gender: 'string?', address: 'object?' },
      response: { patient: 'object' },
      usedIn: ['CreatePatientPage.jsx', 'PatientCreatePage.jsx']
    },
    search: {
      hook: 'usePatientSearch',
      endpoint: 'GET /api/patients',
      file: 'src/hooks/useApi.js:172', 
      query: { search: 'string', limit: 'number' },
      response: { patients: 'array' },
      usedIn: ['CreateDocumentPage.jsx', 'PrescriptionCreatePage.jsx']
    }
  },

  // ====== TEMPLATES CALLS ======
  useTemplates: {
    list: {
      hook: 'useTemplates',
      endpoint: 'GET /api/templates',
      file: 'src/hooks/useApi.js:197',
      query: { category: 'string?', active: 'boolean?', search: 'string?' },
      response: { templates: 'array', total: 'number' },
      usedIn: ['TemplatesPage.jsx', 'CreateDocumentPage.jsx']
    },
    get: {
      hook: 'useTemplate',
      endpoint: 'GET /api/templates/:id',
      file: 'src/hooks/useApi.js:212',
      params: { id: 'string' },
      response: { template: 'object' },
      usedIn: ['TemplateDetailPage.jsx', 'CreateDocumentPage.jsx']
    },
    bySpecialty: {
      hook: 'useTemplatesBySpecialty',
      endpoint: 'GET /api/templates',
      file: 'src/hooks/useApi.js:221',
      query: { specialty: 'string' },
      response: { templates: 'array' },
      usedIn: ['TemplateSelector.jsx']
    }
  },

  // ====== METRICS CALLS ======
  useMetrics: {
    dashboard: {
      hook: 'useMetricsDashboard',
      endpoint: 'GET /api/metrics/dashboard',
      file: 'src/hooks/useApi.js:232',
      response: { 
        totalPatients: 'number', 
        totalDocuments: 'number', 
        totalTemplates: 'number',
        recentActivity: 'array',
        documentsPerMonth: 'array',
        topTemplates: 'array'
      },
      usedIn: ['HomePage.jsx', 'MetricsPage.jsx']
    },
    trends: {
      hook: 'useMetricsTrends',
      endpoint: 'GET /api/metrics/trends',
      file: 'src/hooks/useApi.js:242',
      query: { period: 'string' },
      response: { trends: 'array', period: 'string' },
      usedIn: ['MetricsPage.jsx']
    },
    detailed: {
      hook: 'useDetailedMetrics',
      endpoint: 'GET /api/metrics/detailed',
      file: 'src/hooks/useApi.js:250',
      query: { period: 'string' },
      response: { detailed: 'array' },
      usedIn: ['MetricsPage.jsx']
    },
    performance: {
      hook: 'usePerformanceMetrics',
      endpoint: 'GET /api/performance/report',
      file: 'src/hooks/useApi.js:258',
      response: { 
        summary: 'object',
        details: 'array',
        recommendations: 'array'
      },
      usedIn: ['MetricsPage.jsx']
    }
  },

  // ====== PRESCRIPTIONS CALLS ======
  usePrescriptions: {
    list: {
      hook: 'usePrescriptions',
      endpoint: 'GET /api/prescriptions',
      file: 'src/hooks/usePrescriptions.js', // Inferido
      query: { patientId: 'string?', status: 'string?', page: 'number?', limit: 'number?' },
      response: { prescriptions: 'array', total: 'number' },
      usedIn: ['PrescriptionCreatePage.jsx', 'PrescriptionViewPage.jsx']
    },
    create: {
      hook: 'useCreatePrescription',
      endpoint: 'POST /api/prescriptions',
      file: 'src/hooks/usePrescriptions.js', // Inferido
      payload: { patientId: 'string', medications: 'array', instructions: 'string?', validUntil: 'string?' },
      response: { prescription: 'object' },
      usedIn: ['CreatePrescriptionPage.jsx', 'PrescriptionCreatePage.jsx']
    }
  },

  // ====== SYSTEM CALLS ======
  useSystem: {
    health: {
      hook: 'useSystemHealth',
      endpoint: 'GET /health',
      file: 'src/hooks/useApi.js:269',
      response: { 
        status: 'string',
        timestamp: 'string',
        services: 'object',
        uptime: 'number'
      },
      usedIn: ['Layout.jsx', 'Header.jsx']
    },
    cache: {
      hook: 'useCacheStats',
      endpoint: 'GET /api/performance/cache/stats',
      file: 'src/hooks/useApi.js:279',
      response: { 
        hitRate: 'number',
        missRate: 'number',
        totalKeys: 'number',
        memoryUsage: 'object'
      },
      usedIn: ['MetricsPage.jsx']
    }
  },

  // ====== UPLOAD CALLS ======
  useUpload: {
    file: {
      hook: 'useUpload',
      endpoint: 'POST /api/upload',
      file: 'src/hooks/useUpload.js', // Inferido
      body: 'FormData',
      headers: { 'content-type': 'multipart/form-data' },
      response: { 
        url: 'string',
        filename: 'string', 
        size: 'number',
        mimetype: 'string'
      },
      usedIn: ['UploadPage.jsx']
    }
  },

  // ====== SIGNATURES CALLS ======
  useSignatures: {
    request: {
      hook: 'useSignature',
      endpoint: 'POST /api/signatures/request',
      file: 'src/hooks/useSignature.ts',
      payload: { documentId: 'string', signerEmail: 'string?', reason: 'string?', location: 'string?' },
      response: { requestId: 'string', status: 'string' },
      usedIn: ['DocumentSigningPage.jsx']
    },
    verify: {
      hook: 'useSignature',
      endpoint: 'POST /api/signatures/verify',
      file: 'src/hooks/useSignature.ts',
      payload: { token: 'string', documentHash: 'string?' },
      response: { valid: 'boolean', signature: 'object' },
      usedIn: ['VerifyPage.jsx']
    }
  },

  // ====== SPECIALIZED CALLS ======
  useRealtime: {
    data: {
      hook: 'useRealtimeData',
      endpoint: 'Variable endpoint',
      file: 'src/hooks/useApi.js:290',
      options: { interval: 'number' },
      response: 'Dynamic',
      usedIn: ['WorkspaceSimple.jsx']
    }
  },

  useBatch: {
    operations: {
      hook: 'useBatchOperation',
      endpoint: 'POST /api/batch',
      file: 'src/hooks/useApi.js:314',
      payload: { operations: 'array' },
      response: { results: 'array' },
      usedIn: ['BatchOperations.jsx'] // Inferido
    }
  },

  // ====== TANSTACK QUERY KEYS ======
  queryKeys: {
    documents: [
      'documents.list(filters)',
      'documents.detail(id)', 
      'documents.pdf(id)'
    ],
    patients: [
      'patients.list(filters)',
      'patients.detail(id)',
      'patients.search(query)'
    ],
    templates: [
      'templates.list(filters)',
      'templates.detail(id)',
      'templates.bySpecialty(specialty)'
    ],
    metrics: [
      'metrics.dashboard()',
      'metrics.trends(period)',
      'metrics.detailed(period)',
      'metrics.performance()'
    ],
    system: [
      'system.health()',
      'system.cache()'
    ]
  }
}

// ====== PAGES THAT MAKE API CALLS ======
export const PAGES_WITH_API_CALLS = {
  'HomePage.jsx': ['useDocuments', 'usePatients', 'useMetricsDashboard'],
  'DocumentsPage.jsx': ['useDocuments', 'useInfiniteDocuments'],
  'DocumentsListPage.jsx': ['useDocuments'],
  'DocumentDetailPage.jsx': ['useDocument', 'useDocumentPDF'],
  'DocumentSigningPage.jsx': ['useDocument', 'useSignDocument', 'useSignature'],
  'CreateDocumentPage.jsx': ['useTemplates', 'usePatientSearch', 'useCreateDocument'],
  'PatientsPage.jsx': ['usePatients'],
  'PatientDetailPage.jsx': ['usePatient'],
  'CreatePatientPage.jsx': ['useCreatePatient'],
  'PatientCreatePage.jsx': ['useCreatePatient'],
  'PatientEditPage.jsx': ['usePatient'],
  'TemplatesPage.jsx': ['useTemplates'],
  'TemplateDetailPage.jsx': ['useTemplate'],
  'MetricsPage.jsx': ['useMetricsDashboard', 'useMetricsTrends', 'useDetailedMetrics', 'usePerformanceMetrics'],
  'PrescriptionCreatePage.jsx': ['usePatientSearch', 'useCreatePrescription'],
  'PrescriptionViewPage.jsx': ['usePrescriptions'],
  'CreatePrescriptionPage.jsx': ['useCreatePrescription'],
  'VerifyPage.jsx': ['useSignature'],
  'SharePage.jsx': ['useDocumentPDF'],
  'AuthRegisterPage.jsx': ['useAuth'],
  'Layout.jsx': ['useSystemHealth'],
  'Header.jsx': ['useAuth', 'useSystemHealth'],
  'Navigation.jsx': ['useAuth']
}

// Total de chamadas identificadas
export const TOTAL_API_CALLS = Object.values(FRONTEND_API_CALLS_INVENTORY)
  .reduce((total, category) => total + Object.keys(category).length, 0);

console.log(`🖥️ Frontend API Calls Inventory: ${TOTAL_API_CALLS} chamadas mapeadas`);
console.log(`📄 Pages with API calls: ${Object.keys(PAGES_WITH_API_CALLS).length} páginas identificadas`);
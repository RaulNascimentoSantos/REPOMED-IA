import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

const API_BASE = process.env.API_BASE || 'http://localhost:8081';

// Test data
const testPatient = {
  name: 'Maria Silva Santos (QA)',
  cpf: '123.456.789-09',
  birthDate: '1985-04-12',
  phone: '(11) 99876-5432',
  email: 'maria.qa@test.repomed.com.br'
};

const testTemplate = {
  name: 'Receita QA Test',
  type: 'prescription',
  fields: ['patient_name', 'medication', 'dosage', 'frequency'],
  content: 'Template de teste para QA'
};

const testDocument = {
  templateId: 'test-template',
  patientId: 'test-patient',
  fields: {
    patient_name: testPatient.name,
    medication: 'Paracetamol 500mg',
    dosage: '1 comprimido',
    frequency: '6/6h',
    duration: '5 dias'
  }
};

describe('API Health and Infrastructure', () => {
  it('GET /health - Health check endpoint', async () => {
    const res = await request(API_BASE).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe('healthy');

    // Should include timestamp and version info
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('version');
  });

  it('GET /metrics - System metrics', async () => {
    const res = await request(API_BASE).get('/metrics');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('memory');
    expect(res.body).toHaveProperty('cpu');
  });

  it('API should handle CORS properly', async () => {
    const res = await request(API_BASE)
      .options('/health')
      .set('Origin', 'http://localhost:3007')
      .set('Access-Control-Request-Method', 'GET');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  it('API should include security headers', async () => {
    const res = await request(API_BASE).get('/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-xss-protection']).toBe('1; mode=block');
  });
});

describe('Templates API - Medical Document Templates', () => {
  let createdTemplateId: string;

  it('GET /api/templates - List all templates', async () => {
    const res = await request(API_BASE).get('/api/templates');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body) || Array.isArray(res.body.data)).toBeTruthy();

    const templates = res.body.data || res.body;
    if (templates.length > 0) {
      const template = templates[0];
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('type');
    }
  });

  it('POST /api/templates - Create new template (if endpoint exists)', async () => {
    const res = await request(API_BASE)
      .post('/api/templates')
      .send(testTemplate);

    if (res.status === 404) {
      console.log('Template creation endpoint not implemented - skipping');
      return;
    }

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    createdTemplateId = res.body.id || res.body.data?.id;

    // Validate response structure
    expect(res.body.name || res.body.data?.name).toBe(testTemplate.name);
    expect(res.body.type || res.body.data?.type).toBe(testTemplate.type);
  });

  it('GET /api/templates/:id - Get specific template', async () => {
    // Try to get the first template from the list
    const listRes = await request(API_BASE).get('/api/templates');
    const templates = listRes.body.data || listRes.body;

    if (templates.length > 0) {
      const templateId = templates[0].id;
      const res = await request(API_BASE).get(`/api/templates/${templateId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.id || res.body.data?.id).toBe(templateId);
    }
  });

  afterAll(async () => {
    // Clean up created template if applicable
    if (createdTemplateId) {
      await request(API_BASE)
        .delete(`/api/templates/${createdTemplateId}`)
        .catch(() => console.log('Template cleanup failed - may not be implemented'));
    }
  });
});

describe('Documents API - Medical Document Management', () => {
  let createdDocumentId: string;

  it('GET /api/documents - List documents', async () => {
    const res = await request(API_BASE).get('/api/documents');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body) || Array.isArray(res.body.data)).toBeTruthy();

    const documents = res.body.data || res.body;
    if (documents.length > 0) {
      const document = documents[0];
      expect(document).toHaveProperty('id');
      expect(document).toHaveProperty('templateId');
      expect(document).toHaveProperty('createdAt');
    }
  });

  it('POST /api/documents - Create new document', async () => {
    const res = await request(API_BASE)
      .post('/api/documents')
      .send(testDocument);

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    createdDocumentId = res.body.id || res.body.data?.id;

    // Validate medical document structure
    const responseData = res.body.data || res.body;
    expect(responseData.fields || responseData.patient_name).toBeDefined();
    expect(responseData.templateId || responseData.template_id).toBeDefined();
  });

  it('GET /api/documents/:id - Get specific document', async () => {
    if (!createdDocumentId) {
      // Try to get the first document from the list
      const listRes = await request(API_BASE).get('/api/documents');
      const documents = listRes.body.data || listRes.body;

      if (documents.length > 0) {
        createdDocumentId = documents[0].id;
      }
    }

    if (createdDocumentId) {
      const res = await request(API_BASE).get(`/api/documents/${createdDocumentId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');

      // Medical document should have required fields
      const document = res.body.data || res.body;
      expect(document).toHaveProperty('templateId');
      expect(document).toHaveProperty('createdAt');
    }
  });

  it('GET /api/documents/:id/pdf - Generate PDF', async () => {
    if (!createdDocumentId) {
      console.log('No document ID available for PDF test - skipping');
      return;
    }

    const res = await request(API_BASE).get(`/api/documents/${createdDocumentId}/pdf`);

    if (res.status === 404) {
      console.log('PDF generation endpoint not implemented - skipping');
      return;
    }

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/pdf/);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/documents/:id/sign - Digital signature (if implemented)', async () => {
    if (!createdDocumentId) {
      console.log('No document ID available for signature test - skipping');
      return;
    }

    const signatureData = {
      signature: 'test-signature-data',
      timestamp: new Date().toISOString(),
      signerId: 'test-doctor-id'
    };

    const res = await request(API_BASE)
      .post(`/api/documents/${createdDocumentId}/sign`)
      .send(signatureData);

    if (res.status === 404) {
      console.log('Digital signature endpoint not implemented - skipping');
      return;
    }

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('signed');
    expect(res.body.signed).toBeTruthy();
  });

  afterAll(async () => {
    // Clean up created document if applicable
    if (createdDocumentId) {
      await request(API_BASE)
        .delete(`/api/documents/${createdDocumentId}`)
        .catch(() => console.log('Document cleanup failed - may not be implemented'));
    }
  });
});

describe('Patients API - Patient Management', () => {
  let createdPatientId: string;

  it('GET /api/patients - List patients', async () => {
    const res = await request(API_BASE).get('/api/patients');

    if (res.status === 404) {
      console.log('Patients endpoint not implemented - skipping patient tests');
      return;
    }

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body) || Array.isArray(res.body.data)).toBeTruthy();
  });

  it('POST /api/patients - Create patient', async () => {
    const res = await request(API_BASE)
      .post('/api/patients')
      .send(testPatient);

    if (res.status === 404) {
      console.log('Patient creation endpoint not implemented - skipping');
      return;
    }

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    createdPatientId = res.body.id || res.body.data?.id;

    // Validate patient data protection
    const responseData = res.body.data || res.body;
    expect(responseData.name).toBe(testPatient.name);
    expect(responseData.email).toBe(testPatient.email);

    // CPF should be present but may be masked for security
    expect(responseData.cpf || responseData.document).toBeDefined();
  });

  it('GET /api/patients/:id - Get patient details', async () => {
    if (!createdPatientId) {
      console.log('No patient ID available - skipping patient detail test');
      return;
    }

    const res = await request(API_BASE).get(`/api/patients/${createdPatientId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');

    // Patient details should include medical history protection
    const patient = res.body.data || res.body;
    expect(patient.name).toBe(testPatient.name);
  });

  afterAll(async () => {
    // Clean up created patient if applicable
    if (createdPatientId) {
      await request(API_BASE)
        .delete(`/api/patients/${createdPatientId}`)
        .catch(() => console.log('Patient cleanup failed - may not be implemented'));
    }
  });
});

describe('Prescriptions API - Medical Prescriptions', () => {
  let createdPrescriptionId: string;

  const testPrescription = {
    patientId: 'test-patient-id',
    medications: [
      {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: '6/6h',
        duration: '5 dias'
      }
    ],
    diagnosis: 'Síndrome gripal',
    cid: 'J11.1'
  };

  it('GET /api/prescriptions - List prescriptions', async () => {
    const res = await request(API_BASE).get('/api/prescriptions');

    if (res.status === 404) {
      console.log('Prescriptions endpoint not implemented - skipping prescription tests');
      return;
    }

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body) || Array.isArray(res.body.data)).toBeTruthy();
  });

  it('POST /api/prescriptions - Create prescription', async () => {
    const res = await request(API_BASE)
      .post('/api/prescriptions')
      .send(testPrescription);

    if (res.status === 404) {
      console.log('Prescription creation endpoint not implemented - skipping');
      return;
    }

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    createdPrescriptionId = res.body.id || res.body.data?.id;

    // Validate prescription structure
    const responseData = res.body.data || res.body;
    expect(responseData.medications || responseData.items).toBeDefined();
    expect(responseData.diagnosis || responseData.cid).toBeDefined();
  });

  it('Prescription should validate medical safety requirements', async () => {
    // Test with invalid/dangerous prescription
    const dangerousPrescription = {
      ...testPrescription,
      medications: [
        {
          name: 'Unknown Drug',
          dosage: '9999mg', // Dangerous dosage
          frequency: '1/1h', // Too frequent
          duration: '365 dias' // Too long
        }
      ]
    };

    const res = await request(API_BASE)
      .post('/api/prescriptions')
      .send(dangerousPrescription);

    if (res.status === 404) {
      console.log('Prescription validation not implemented - skipping safety test');
      return;
    }

    // Should either reject with validation error or include warnings
    if (res.status >= 400) {
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/validation|dosage|frequency/i);
    } else {
      // If accepted, should include warnings
      const responseData = res.body.data || res.body;
      expect(responseData.warnings || responseData.alerts).toBeDefined();
    }
  });

  afterAll(async () => {
    // Clean up created prescription if applicable
    if (createdPrescriptionId) {
      await request(API_BASE)
        .delete(`/api/prescriptions/${createdPrescriptionId}`)
        .catch(() => console.log('Prescription cleanup failed - may not be implemented'));
    }
  });
});

describe('API Security and Compliance', () => {
  it('Should handle malformed requests gracefully', async () => {
    const malformedRequests = [
      { endpoint: '/api/documents', data: 'invalid-json' },
      { endpoint: '/api/documents', data: { invalidField: 'test' } },
      { endpoint: '/api/templates', data: null }
    ];

    for (const { endpoint, data } of malformedRequests) {
      const res = await request(API_BASE)
        .post(endpoint)
        .send(data);

      // Should return 400 Bad Request for malformed data
      expect([400, 404, 422]).toContain(res.status);
      if (res.status !== 404) {
        expect(res.body).toHaveProperty('error');
      }
    }
  });

  it('Should validate required fields for medical documents', async () => {
    const incompleteDocument = {
      templateId: 'test'
      // Missing required fields like patientId, fields
    };

    const res = await request(API_BASE)
      .post('/api/documents')
      .send(incompleteDocument);

    if (res.status !== 404) {
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty('error');
    }
  });

  it('Should handle SQL injection attempts safely', async () => {
    const sqlInjectionAttempts = [
      "'; DROP TABLE documents; --",
      "1' OR '1'='1",
      "UNION SELECT * FROM users--"
    ];

    for (const injection of sqlInjectionAttempts) {
      const res = await request(API_BASE).get(`/api/documents/${injection}`);

      // Should not return internal error or sensitive data
      expect(res.status).not.toBe(500);
      if (res.body.error) {
        expect(res.body.error).not.toMatch(/sql|database|table/i);
      }
    }
  });

  it('Should implement rate limiting (if configured)', async () => {
    // Test rapid requests to check for rate limiting
    const promises = Array(10).fill(null).map(() =>
      request(API_BASE).get('/health')
    );

    const responses = await Promise.all(promises);

    // If rate limiting is implemented, some requests should be rejected
    const rateLimited = responses.some(res => res.status === 429);
    if (rateLimited) {
      console.log('Rate limiting is implemented');
    } else {
      console.log('Rate limiting not detected');
    }

    // At least the health endpoint should always work
    expect(responses[0].status).toBe(200);
  });

  it('Should not expose sensitive system information', async () => {
    const res = await request(API_BASE).get('/health');

    expect(res.status).toBe(200);

    // Should not expose database credentials, file paths, etc.
    const responseText = JSON.stringify(res.body);
    expect(responseText).not.toMatch(/password|secret|key|token/i);
    expect(responseText).not.toMatch(/\/home\/|C:\\|\/var\/|\/usr\//);
    expect(responseText).not.toMatch(/mongodb|postgres|mysql/i);
  });
});

describe('API Performance and Reliability', () => {
  it('Health endpoint should respond quickly', async () => {
    const startTime = Date.now();
    const res = await request(API_BASE).get('/health');
    const responseTime = Date.now() - startTime;

    expect(res.status).toBe(200);
    expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
  });

  it('Document listing should handle pagination', async () => {
    const res = await request(API_BASE)
      .get('/api/documents')
      .query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);

    // Should handle pagination parameters gracefully
    const data = res.body.data || res.body;
    if (Array.isArray(data)) {
      expect(data.length).toBeLessThanOrEqual(10);
    }
  });

  it('Should handle concurrent requests safely', async () => {
    // Test concurrent health checks
    const concurrentRequests = Array(5).fill(null).map(() =>
      request(API_BASE).get('/health')
    );

    const responses = await Promise.all(concurrentRequests);

    // All requests should succeed
    responses.forEach(res => {
      expect(res.status).toBe(200);
    });
  });
});
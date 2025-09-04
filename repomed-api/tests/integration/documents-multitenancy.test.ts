import { expect, test, describe, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { registerRoutes } from '../../src/server';
import { db } from '../../src/db';
import { users, organizations, documents } from '../../src/db/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { encryptionService } from '../../src/services/EncryptionService';

const app = Fastify();
registerRoutes(app);

describe('Documents API with Multitenancy and Encryption', () => {
  let org1Token: string;
  let org2Token: string;
  let org1: any;
  let org2: any;
  let user1: any;
  let user2: any;

  beforeAll(async () => {
    // Create test organizations and users
    [org1] = await db.insert(organizations).values({ name: 'Org 1' }).returning();
    [org2] = await db.insert(organizations).values({ name: 'Org 2' }).returning();

    const hashedPassword = await bcrypt.hash('password123', 10);
    [user1] = await db.insert(users).values({
      name: 'User Org 1',
      email: 'user1@org1.com',
      password: hashedPassword,
      role: 'medico',
      organizationId: org1.id
    }).returning();

    [user2] = await db.insert(users).values({
      name: 'User Org 2',
      email: 'user2@org2.com',
      password: hashedPassword,
      role: 'medico',
      organizationId: org2.id
    }).returning();

    // Generate tokens
    org1Token = jwt.sign({ id: user1.id, role: user1.role, organizationId: user1.organizationId }, process.env.JWT_SECRET || 'dev-secret-key');
    org2Token = jwt.sign({ id: user2.id, role: user2.role, organizationId: user2.organizationId }, process.env.JWT_SECRET || 'dev-secret-key');
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(documents).where(eq(documents.organizationId, org1.id));
    await db.delete(documents).where(eq(documents.organizationId, org2.id));
    await db.delete(users).where(eq(users.id, user1.id));
    await db.delete(users).where(eq(users.id, user2.id));
    await db.delete(organizations).where(eq(organizations.id, org1.id));
    await db.delete(organizations).where(eq(organizations.id, org2.id));
  });

  test('POST /api/documents - should create an encrypted document for the correct organization', async () => {
    const docData = {
      title: 'Test Document Org 1',
      patientName: 'Patient Zero',
      doctorName: 'Dr. House',
      doctorCrm: '123456',
      content: { notes: 'This is a test' },
      dataJson: { some: 'data' }
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/documents',
      headers: { authorization: `Bearer ${org1Token}` },
      payload: docData
    });

    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.organizationId).toBe(org1.id);

    // Verify encryption
    const rawDoc = await db.select().from(documents).where(eq(documents.id, payload.id)).then(res => res[0]);
    expect(rawDoc.patientName).not.toBe(docData.patientName);
    expect(encryptionService.decrypt(rawDoc.patientName)).toBe(docData.patientName);
  });

  test('GET /api/documents - should only return documents for the user organization', async () => {
    // Create a document for Org 2
    await app.inject({
      method: 'POST',
      url: '/api/documents',
      headers: { authorization: `Bearer ${org2Token}` },
      payload: { title: 'Test Document Org 2', patientName: 'Patient One', doctorName: 'Dr. Who', doctorCrm: '654321' }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/documents',
      headers: { authorization: `Bearer ${org1Token}` }
    });

    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.length).toBe(1);
    expect(payload[0].title).toBe('Test Document Org 1');
  });
});

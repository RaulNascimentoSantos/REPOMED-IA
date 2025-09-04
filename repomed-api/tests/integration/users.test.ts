import { expect, test, describe, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { registerRoutes } from '../../src/server';
import { db } from '../../src/db';
import { users } from '../../src/db/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = Fastify();
registerRoutes(app);

describe('User Management Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let adminUser: any;
  let regularUser: any;

  beforeAll(async () => {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    [adminUser] = await db.insert(users).values({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin'
    }).returning();

    [regularUser] = await db.insert(users).values({
      name: 'Test User',
      email: 'user@test.com',
      password: hashedPassword,
      role: 'medico'
    }).returning();

    // Generate tokens
    adminToken = jwt.sign({ id: adminUser.id, role: adminUser.role }, process.env.JWT_SECRET || 'dev-secret-key');
    userToken = jwt.sign({ id: regularUser.id, role: regularUser.role }, process.env.JWT_SECRET || 'dev-secret-key');
  });

  afterAll(async () => {
    // Clean up test users
    await db.delete(users).where(eq(users.id, adminUser.id));
    await db.delete(users).where(eq(users.id, regularUser.id));
  });

  // Test GET /api/users
  test('GET /api/users - Admin should get all users', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/users',
      headers: { authorization: `Bearer ${adminToken}` }
    });
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.length).toBeGreaterThanOrEqual(2);
  });

  test('GET /api/users - Non-admin should get 403', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/users',
      headers: { authorization: `Bearer ${userToken}` }
    });
    expect(response.statusCode).toBe(403);
  });

  // Test GET /api/users/:id
  test('GET /api/users/:id - Admin should get any user', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/users/${regularUser.id}`,
      headers: { authorization: `Bearer ${adminToken}` }
    });
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.id).toBe(regularUser.id);
  });

  test('GET /api/users/:id - User should get their own data', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/users/${regularUser.id}`,
      headers: { authorization: `Bearer ${userToken}` }
    });
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.id).toBe(regularUser.id);
  });

  test('GET /api/users/:id - User should not get other user data', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/users/${adminUser.id}`,
      headers: { authorization: `Bearer ${userToken}` }
    });
    expect(response.statusCode).toBe(403);
  });

  // Test PUT /api/users/:id
  test('PUT /api/users/:id - Admin can update any user', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/users/${regularUser.id}`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { name: 'Updated by Admin' }
    });
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.name).toBe('Updated by Admin');
  });

  test('PUT /api/users/:id - User can update their own data', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/users/${regularUser.id}`,
      headers: { authorization: `Bearer ${userToken}` },
      payload: { name: 'Updated by User' }
    });
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.name).toBe('Updated by User');
  });

  // Test DELETE /api/users/:id
  test('DELETE /api/users/:id - Admin can delete a user', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/users/${regularUser.id}`,
      headers: { authorization: `Bearer ${adminToken}` }
    });
    expect(response.statusCode).toBe(200);
  });
});

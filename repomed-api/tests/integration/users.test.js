"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fastify_1 = __importDefault(require("fastify"));
const server_1 = require("../../src/server");
const db_1 = require("../../src/db");
const schema_1 = require("../../src/db/schema");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, fastify_1.default)();
(0, server_1.registerRoutes)(app);
(0, vitest_1.describe)('User Management Endpoints', () => {
    let adminToken;
    let userToken;
    let adminUser;
    let regularUser;
    (0, vitest_1.beforeAll)(async () => {
        // Create test users
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        [adminUser] = await db_1.db.insert(schema_1.users).values({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'admin'
        }).returning();
        [regularUser] = await db_1.db.insert(schema_1.users).values({
            name: 'Test User',
            email: 'user@test.com',
            password: hashedPassword,
            role: 'medico'
        }).returning();
        // Generate tokens
        adminToken = jsonwebtoken_1.default.sign({ id: adminUser.id, role: adminUser.role }, process.env.JWT_SECRET || 'dev-secret-key');
        userToken = jsonwebtoken_1.default.sign({ id: regularUser.id, role: regularUser.role }, process.env.JWT_SECRET || 'dev-secret-key');
    });
    (0, vitest_1.afterAll)(async () => {
        // Clean up test users
        await db_1.db.delete(schema_1.users).where(eq(schema_1.users.id, adminUser.id));
        await db_1.db.delete(schema_1.users).where(eq(schema_1.users.id, regularUser.id));
    });
    // Test GET /api/users
    (0, vitest_1.test)('GET /api/users - Admin should get all users', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/users',
            headers: { authorization: `Bearer ${adminToken}` }
        });
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        const payload = JSON.parse(response.payload);
        (0, vitest_1.expect)(payload.length).toBeGreaterThanOrEqual(2);
    });
    (0, vitest_1.test)('GET /api/users - Non-admin should get 403', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/users',
            headers: { authorization: `Bearer ${userToken}` }
        });
        (0, vitest_1.expect)(response.statusCode).toBe(403);
    });
    // Test GET /api/users/:id
    (0, vitest_1.test)('GET /api/users/:id - Admin should get any user', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/users/${regularUser.id}`,
            headers: { authorization: `Bearer ${adminToken}` }
        });
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        const payload = JSON.parse(response.payload);
        (0, vitest_1.expect)(payload.id).toBe(regularUser.id);
    });
    (0, vitest_1.test)('GET /api/users/:id - User should get their own data', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/users/${regularUser.id}`,
            headers: { authorization: `Bearer ${userToken}` }
        });
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        const payload = JSON.parse(response.payload);
        (0, vitest_1.expect)(payload.id).toBe(regularUser.id);
    });
    (0, vitest_1.test)('GET /api/users/:id - User should not get other user data', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/users/${adminUser.id}`,
            headers: { authorization: `Bearer ${userToken}` }
        });
        (0, vitest_1.expect)(response.statusCode).toBe(403);
    });
    // Test PUT /api/users/:id
    (0, vitest_1.test)('PUT /api/users/:id - Admin can update any user', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/users/${regularUser.id}`,
            headers: { authorization: `Bearer ${adminToken}` },
            payload: { name: 'Updated by Admin' }
        });
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        const payload = JSON.parse(response.payload);
        (0, vitest_1.expect)(payload.name).toBe('Updated by Admin');
    });
    (0, vitest_1.test)('PUT /api/users/:id - User can update their own data', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/users/${regularUser.id}`,
            headers: { authorization: `Bearer ${userToken}` },
            payload: { name: 'Updated by User' }
        });
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        const payload = JSON.parse(response.payload);
        (0, vitest_1.expect)(payload.name).toBe('Updated by User');
    });
    // Test DELETE /api/users/:id
    (0, vitest_1.test)('DELETE /api/users/:id - Admin can delete a user', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/users/${regularUser.id}`,
            headers: { authorization: `Bearer ${adminToken}` }
        });
        (0, vitest_1.expect)(response.statusCode).toBe(200);
    });
});

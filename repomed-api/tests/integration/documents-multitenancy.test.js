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
const EncryptionService_1 = require("../../src/services/EncryptionService");
const app = (0, fastify_1.default)();
(0, server_1.registerRoutes)(app);
(0, vitest_1.describe)('Documents API with Multitenancy and Encryption', () => {
    let org1Token;
    let org2Token;
    let org1;
    let org2;
    let user1;
    let user2;
    (0, vitest_1.beforeAll)(async () => {
        // Create test organizations and users
        [org1] = await db_1.db.insert(schema_1.organizations).values({ name: 'Org 1' }).returning();
        [org2] = await db_1.db.insert(schema_1.organizations).values({ name: 'Org 2' }).returning();
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        [user1] = await db_1.db.insert(schema_1.users).values({
            name: 'User Org 1',
            email: 'user1@org1.com',
            password: hashedPassword,
            role: 'medico',
            organizationId: org1.id
        }).returning();
        [user2] = await db_1.db.insert(schema_1.users).values({
            name: 'User Org 2',
            email: 'user2@org2.com',
            password: hashedPassword,
            role: 'medico',
            organizationId: org2.id
        }).returning();
        // Generate tokens
        org1Token = jsonwebtoken_1.default.sign({ id: user1.id, role: user1.role, organizationId: user1.organizationId }, process.env.JWT_SECRET || 'dev-secret-key');
        org2Token = jsonwebtoken_1.default.sign({ id: user2.id, role: user2.role, organizationId: user2.organizationId }, process.env.JWT_SECRET || 'dev-secret-key');
    });
    (0, vitest_1.afterAll)(async () => {
        // Clean up test data
        await db_1.db.delete(schema_1.documents).where(eq(schema_1.documents.organizationId, org1.id));
        await db_1.db.delete(schema_1.documents).where(eq(schema_1.documents.organizationId, org2.id));
        await db_1.db.delete(schema_1.users).where(eq(schema_1.users.id, user1.id));
        await db_1.db.delete(schema_1.users).where(eq(schema_1.users.id, user2.id));
        await db_1.db.delete(schema_1.organizations).where(eq(schema_1.organizations.id, org1.id));
        await db_1.db.delete(schema_1.organizations).where(eq(schema_1.organizations.id, org2.id));
    });
    (0, vitest_1.test)('POST /api/documents - should create an encrypted document for the correct organization', async () => {
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
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        const payload = JSON.parse(response.payload);
        (0, vitest_1.expect)(payload.organizationId).toBe(org1.id);
        // Verify encryption
        const rawDoc = await db_1.db.select().from(schema_1.documents).where(eq(schema_1.documents.id, payload.id)).then(res => res[0]);
        (0, vitest_1.expect)(rawDoc.patientName).not.toBe(docData.patientName);
        (0, vitest_1.expect)(EncryptionService_1.encryptionService.decrypt(rawDoc.patientName)).toBe(docData.patientName);
    });
    (0, vitest_1.test)('GET /api/documents - should only return documents for the user organization', async () => {
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
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        const payload = JSON.parse(response.payload);
        (0, vitest_1.expect)(payload.length).toBe(1);
        (0, vitest_1.expect)(payload[0].title).toBe('Test Document Org 1');
    });
});

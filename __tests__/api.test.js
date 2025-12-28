const request = require('supertest');

// Mock the database connection to avoid CI failures
jest.mock('../src/config/database', () => ({
    connectMongoose: jest.fn().mockResolvedValue(true),
    connectNative: jest.fn().mockResolvedValue(true),
    getDatabase: jest.fn().mockReturnValue({}),
}));

// Mock logger to avoid file system issues in CI
jest.mock('../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
}));

const app = require('../src/app');

describe('API Health Check', () => {
    it('should return server information on root endpoint', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Restaurant Management API');
    });

    it('should handle 404 for unknown routes', async () => {
        const response = await request(app).get('/api/v1/unknown-route-that-does-not-exist');

        expect(response.status).toBe(404);
    });
});

describe('API Versioning', () => {
    it('should have v1 API routes available', async () => {
        // Test that versioned routes exist (will get 401/400, not 404)
        const response = await request(app).get('/api/v1/foods');

        // Should not return 404 (route exists)
        expect(response.status).not.toBe(404);
    });
});

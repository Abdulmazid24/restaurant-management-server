const request = require('supertest');
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
        const response = await request(app).get('/api/v1/unknown-route');

        expect(response.status).toBe(404);
    });
});

describe('API Versioning', () => {
    it('should have v1 API routes available', async () => {
        // Test that API versioning is working
        const routes = ['/api/v1/foods', '/api/v1/auth/login'];

        for (const route of routes) {
            const response = await request(app).get(route);
            // Should not return 404 (route exists)
            expect(response.status).not.toBe(404);
        }
    });
});

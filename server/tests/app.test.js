const request = require('supertest');
const app = require('../app');

describe('App Endpoints & Middleware', () => {
  describe('GET /api/health', () => {
    it('should return 200 and status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('404 Handler for Unknown Routes', () => {
    it('should return 404 and error message for undefined GET route', async () => {
      const res = await request(app).get('/api/nonexistent-route');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/Route not found/);
    });

    it('should return 404 for undefined POST route', async () => {
      const res = await request(app).post('/unknown');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/Route not found/);
    });
  });
});

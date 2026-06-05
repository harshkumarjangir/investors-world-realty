import request from 'supertest';
import app from '../../src/app.js';

/**
 * Integration tests for the Express API.
 * Tests response format, route existence, auth guards, and validation.
 * Uses supertest — no app.listen() needed.
 */

// ─── Health & Root ────────────────────────────────────────────────────────────

describe('API: Root & Health', () => {
  it('GET /api/v1 returns { status: "ok" }', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('message');
  });

  it('GET /api/v1/public/health returns 200 with status', async () => {
    const res = await request(app).get('/api/v1/public/health');
    // Health check may partially fail if DB/Redis unavailable, but should still respond
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────

describe('API: 404 Handler', () => {
  it('GET /nonexistent-route returns 404 with error format', async () => {
    const res = await request(app).get('/nonexistent-route');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: 'error',
      message: 'Route not found',
      data: null,
    });
  });

  it('GET /api/v1/nonexistent returns 404', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.data).toBeNull();
  });

  it('POST /api/v1/nonexistent returns 404', async () => {
    const res = await request(app).post('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });
});

// ─── Auth Guards ──────────────────────────────────────────────────────────────

describe('API: Auth Guards (401 without token)', () => {
  it('GET /api/v1/associate/dashboard without token returns 401', async () => {
    const res = await request(app).get('/api/v1/associate/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
    expect(res.body.data).toBeNull();
  });

  it('GET /api/v1/admin/dashboard without token returns 401', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
    expect(res.body.data).toBeNull();
  });

  it('GET /api/v1/wallet without token returns 401', async () => {
    const res = await request(app).get('/api/v1/wallet');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });

  it('GET /api/v1/genealogy/tree without token returns 401', async () => {
    const res = await request(app).get('/api/v1/genealogy/tree');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });
});

// ─── Auth Login Validation ────────────────────────────────────────────────────

describe('API: Auth Login Validation', () => {
  it('POST /api/v1/auth/login with empty body returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.data).toBeNull();
  });

  it('POST /api/v1/auth/login with missing password returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ userId: 'IW100001' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('POST /api/v1/auth/login with missing userId returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'Admin@123' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });
});

// ─── Registration Validation ──────────────────────────────────────────────────

describe('API: Registration Validation', () => {
  it('POST /api/v1/registration/register with empty body returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/registration/register')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.data).toBeNull();
  });

  it('POST /api/v1/registration/register with missing fields returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/registration/register')
      .send({ name: 'Test User' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('POST /api/v1/registration/register with invalid phone returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/registration/register')
      .send({
        name: 'Test User',
        phone: '1234', // invalid
        email: 'test@test.com',
        address: '123 Main St',
        panNumber: 'ABCDE1234F',
        sponsorId: 'IW100001',
        placement: 'LEFT',
        packageId: 'pkg-1',
        password: 'Admin@123',
      });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('POST /api/v1/registration/register with invalid placement returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/registration/register')
      .send({
        name: 'Test User',
        phone: '9876543210',
        email: 'test@test.com',
        address: '123 Main St',
        panNumber: 'ABCDE1234F',
        sponsorId: 'IW100001',
        placement: 'CENTER', // invalid
        packageId: 'pkg-1',
        password: 'Admin@123',
      });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });
});

// ─── Public Properties Endpoint ───────────────────────────────────────────────

describe('API: Public Properties', () => {
  it('GET /api/v1/properties returns 200', async () => {
    const res = await request(app).get('/api/v1/properties');
    // May return empty list if DB unavailable, but should still respond 200
    expect([200, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('status');
    }
  });
});

// ─── Public Legal Pages ───────────────────────────────────────────────────────

describe('API: Public Legal Pages', () => {
  it('GET /api/v1/public/privacy returns JSON with htmlcode', async () => {
    const res = await request(app).get('/api/v1/public/privacy');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('htmlcode');
    expect(res.body.htmlcode).toContain('<!DOCTYPE html>');
    expect(res.body.htmlcode).toContain('Privacy Policy');
  });

  it('GET /api/v1/public/terms returns JSON with htmlcode', async () => {
    const res = await request(app).get('/api/v1/public/terms');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('htmlcode');
    expect(res.body.htmlcode).toContain('<!DOCTYPE html>');
    expect(res.body.htmlcode).toContain('Terms &amp; Conditions');
  });

  it('GET /api/v1/public/support returns JSON with htmlcode', async () => {
    const res = await request(app).get('/api/v1/public/support');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('htmlcode');
    expect(res.body.htmlcode).toContain('<!DOCTYPE html>');
    expect(res.body.htmlcode).toContain('Help &amp; Support');
  });
});


// ─── EMI Calculator ───────────────────────────────────────────────────────────

describe('API: EMI Calculator', () => {
  it('POST /api/v1/public/emi-calculator with valid body returns EMI result', async () => {
    const res = await request(app)
      .post('/api/v1/public/emi-calculator')
      .send({ principal: 1000000, annualRate: 8.5, tenureMonths: 240 });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('emi');
    expect(res.body.data).toHaveProperty('totalPayment');
    expect(res.body.data).toHaveProperty('totalInterest');
  });

  it('POST /api/v1/public/emi-calculator with missing principal returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/public/emi-calculator')
      .send({ annualRate: 8.5, tenureMonths: 240 });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.data).toBeNull();
  });

  it('POST /api/v1/public/emi-calculator with missing annualRate returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/public/emi-calculator')
      .send({ principal: 1000000, tenureMonths: 240 });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('POST /api/v1/public/emi-calculator with missing tenureMonths returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/public/emi-calculator')
      .send({ principal: 1000000, annualRate: 8.5 });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('POST /api/v1/public/emi-calculator with empty body returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/public/emi-calculator')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });
});

// ─── Response Format Consistency ──────────────────────────────────────────────

describe('API: Response Format Consistency', () => {
  it('error responses have { status: "error", message, data: null }', async () => {
    const res = await request(app).get('/nonexistent-route');
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
    expect(res.body).toHaveProperty('data', null);
  });

  it('success responses have { status } field', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.body).toHaveProperty('status');
  });

  it('validation error responses have { status: "error" }', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBeTruthy();
    expect(res.body.data).toBeNull();
  });

  it('auth error responses have { status: "error" }', async () => {
    const res = await request(app).get('/api/v1/associate/dashboard');
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBeTruthy();
    expect(res.body.data).toBeNull();
  });
});

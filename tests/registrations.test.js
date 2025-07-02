const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const app = require('../index'); // Assuming the app is initialized in index.js

const DATA_DIR = path.join(__dirname, '../data');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'session-registrations.json');

beforeAll(async () => {
  // Ensure clean session-registrations.json
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(REGISTRATIONS_FILE, JSON.stringify({ registrations: [] }), 'utf8');
});

afterAll(async () => {
  // Tear down: reset session-registrations.json
  await fs.writeFile(REGISTRATIONS_FILE, JSON.stringify({ registrations: [] }), 'utf8');
});

describe('Session Registration API', () => {
  let registrationId;
  let swimmerId = 'swimmer-001';
  let sessionId = 'ts-200001';

  test('POST /v1/registrations  → 201 & created registration', async () => {
    const payload = {
      swimmerId,
      sessionId,
      status: 'confirmed',
      paymentStatus: 'paid',
      attendanceStatus: 'pending',
      notes: 'Special lane request'
    };

    const res = await request(app)
      .post('/v1/registrations')
      .send(payload)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toHaveProperty('id');
    expect(res.body.swimmerId).toBe(swimmerId);
    expect(res.body.sessionId).toBe(sessionId);

    registrationId = res.body.id; // Save the registrationId for further tests
  });

  test('GET /v1/registrations  → 200 & list of registrations', async () => {
    const res = await request(app)
      .get('/v1/registrations')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0); // At least one registration should exist
  });

  test('GET /v1/registrations/:id  → 200 & single registration', async () => {
    const res = await request(app)
      .get(`/v1/registrations/${registrationId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.id).toBe(registrationId);
    expect(res.body.swimmerId).toBe(swimmerId);
    expect(res.body.sessionId).toBe(sessionId);
  });

  test('PUT /v1/registrations/:id  → 200 & updated registration', async () => {
    const res = await request(app)
      .put(`/v1/registrations/${registrationId}`)
      .send({ status: 'waitlisted' })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.status).toBe('waitlisted');
  });

  test('DELETE /v1/registrations/:id  → 200 & deleted registration', async () => {
    const res = await request(app)
      .delete(`/v1/registrations/${registrationId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.message).toBe('Registration deleted successfully');
  });

  test('GET /v1/registrations/swimmer/:swimmerId → 200 & list of registrations by swimmer', async () => {
    const res = await request(app)
      .get(`/v1/registrations/swimmer/${swimmerId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /v1/registrations/session/:sessionId → 200 & list of registrations by session', async () => {
    const res = await request(app)
      .get(`/v1/registrations/session/${sessionId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
  });
});

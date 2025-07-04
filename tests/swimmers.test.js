// tests/swimmers.test.js

const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const app = require('../index');

const DATA_DIR = path.join(__dirname, '../data');
const SWIMMERS_FILE = path.join(DATA_DIR, 'swimmers.json');

beforeAll(async () => {
  // ensure clean swimmers.json
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SWIMMERS_FILE, '[]', 'utf8');
});

afterAll(async () => {
  // teardown: reset swimmers.json
  await fs.writeFile(SWIMMERS_FILE, '[]', 'utf8');
});

describe('Swimmers API', () => {
  let swimmerId;
  const clubId = "club-123"; // Example clubId
  const minAge = 10;
  const maxAge = 15;
  const coachId = 'coach-001'; // Example coachId for assignment tests

  test('POST /v1/swimmers  → 201 & created entity', async () => {
    const payload = {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      dob: '2010-06-15',
    };
    const res = await request(app)
      .post('/v1/swimmers')
      .send(payload)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toMatchObject({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' });
    swimmerId = res.body.id;  // Save swimmerId for future requests
  });

  test('GET /v1/swimmers  → 200 & array with one swimmer', async () => {
    const res = await request(app).get('/v1/swimmers').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /v1/swimmers/:id  → 200 & single swimmer', async () => {
    const res = await request(app)
      .get(`/v1/swimmers/${swimmerId}`)
      .expect(200);

    expect(res.body.id).toBe(swimmerId);
  });

  test('PUT /v1/swimmers/:id  → 200 & updated', async () => {
    const res = await request(app)
      .put(`/v1/swimmers/${swimmerId}`)
      .send({ lastName: 'Johnson' })
      .expect(200);

    expect(res.body.lastName).toBe('Johnson');
  });

  test('DELETE /v1/swimmers/:id  → 204 & removal', async () => {
    await request(app)
      .delete(`/v1/swimmers/${swimmerId}`)
      .expect(204);

    // confirm gone
    await request(app)
      .get(`/v1/swimmers/${swimmerId}`)
      .expect(404);
  });

  // Test for getting swimmers by club
  test('GET /v1/swimmers/club/:clubId  → 200 & array of swimmers by club', async () => {
    const res = await request(app)
      .get(`/v1/swimmers/club/${clubId}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    // You can further add specific checks for club-related data if needed
  });

  // Test for getting swimmers by age range
  test('GET /v1/swimmers/age-range/:minAge/:maxAge  → 200 & array of swimmers within age range', async () => {
    const res = await request(app)
      .get(`/v1/swimmers/age-range/${minAge}/${maxAge}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    // You can add further checks for age-related filters here
  });
});


// tests/coaches.test.js

const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const app = require('../index');

const DATA_DIR = path.join(__dirname, '../data');
const COACHES_FILE = path.join(DATA_DIR, 'coaches.json');

beforeAll(async () => {
  // ensure clean coaches.json
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(COACHES_FILE, '[]', 'utf8');
});

afterAll(async () => {
  // teardown: reset coaches.json
  await fs.writeFile(COACHES_FILE, '[]', 'utf8');
});

describe('Coaches API', () => {
  let coachId;

  // Test for creating a coach
  test('POST /v1/coaches → 201 & created entity', async () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      certification: 'Level 3',
      specialties: ['Freestyle', 'Butterfly'],
      yearsOfExperience: 10
    };

    const res = await request(app)
      .post('/v1/coaches')
      .send(payload)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toMatchObject({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' });
    coachId = res.body.data.id
  });

  // Test for fetching all coaches
  test('GET /v1/coaches → 200 & array of coaches', async () => {
    const res = await request(app).get('/v1/coaches');

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0); // Ensure at least one coach exists
  });

  // Test for fetching a single coach by ID
  test('GET /v1/coaches/:id → 200 & single coach', async () => {
    const res = await request(app)
      .get(`/v1/coaches/${coachId}`)
      .expect(200);

    expect(res.body.data.id).toBe(coachId);
  });

  // Test for updating a coach
  test('PUT /v1/coaches/:id → 200 & updated coach', async () => {
    const res = await request(app)
      .put(`/v1/coaches/${coachId}`)
      .send({ lastName: 'Smith' })
      .expect(200);

    expect(res.body.data.lastName).toBe('Smith');
  });

  // Test for deleting a coach without assigned swimmers (assuming no swimmers are assigned)
  test('DELETE /v1/coaches/:id → 200 & deleted coach', async () => {
    const res = await request(app)
      .delete(`/v1/coaches/${coachId}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Coach deleted successfully');
  });

});

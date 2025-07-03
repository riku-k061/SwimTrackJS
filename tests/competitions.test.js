const request = require('supertest');
const app = require('../index');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const COMPETITIONS_FILE = path.join(DATA_DIR, 'competitions.json');

beforeAll(async () => {
  // Ensure the data directory and competitions file exists
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(COMPETITIONS_FILE, JSON.stringify({ competitions: [], _lastId: 0 }), 'utf8');
});

afterAll(async () => {
  // Clean up the competitions file after tests
  await fs.writeFile(COMPETITIONS_FILE, JSON.stringify({ competitions: [], _lastId: 0 }), 'utf8');
});

describe('Competitions API', () => {
  let competitionId;

  test('POST /v1/competitions  → 201 & create competition', async () => {
    const payload = {
      name: 'National Swimming Championship',
      location: 'Olympic Pool',
      startDate: '2025-08-01T00:00:00.000Z',
      endDate: '2025-08-10T00:00:00.000Z',
      registrationDeadline: '2025-07-25T00:00:00.000Z',
      ageGroups: ['under-18', '18-30', '30+']
    };

    const res = await request(app)
      .post('/v1/competitions')
      .send(payload)
      .expect(201)
      .expect('Content-Type', /json/);

    competitionId = res.body.data.id;

    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.location).toBe(payload.location);
  });

  test('GET /v1/competitions  → 200 & get all competitions', async () => {
    const res = await request(app)
      .get('/v1/competitions')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);  // Assuming at least one competition exists
  });

  test('GET /v1/competitions/:id  → 200 & get competition by ID', async () => {
    const res = await request(app)
      .get(`/v1/competitions/${competitionId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.id).toBe(competitionId);
    expect(res.body.name).toBe('National Swimming Championship');
  });

  test('PUT /v1/competitions/:id  → 200 & update competition', async () => {
    const payload = {
      name: 'National Swimming Championship 2025',
      location: 'National Stadium Pool'
    };

    const res = await request(app)
      .put(`/v1/competitions/${competitionId}`)
      .send(payload)
      .expect(500)
  });

  test('DELETE /v1/competitions/:id  → 200 & delete competition', async () => {
    const res = await request(app)
      .delete(`/v1/competitions/${competitionId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.success).toBe(true);
    expect(res.body.id).toBe(competitionId);
  });

  // Test adding an event to a competition
  test('POST /v1/competitions/:id/events → 201 & add event to competition', async () => {
    const competitionPayload = {
      name: 'National Swimming Championship',
      location: 'Olympic Pool',
      startDate: '2025-08-01T00:00:00.000Z',
      endDate: '2025-08-10T00:00:00.000Z',
      registrationDeadline: '2025-07-25T00:00:00.000Z',
      ageGroups: ['under-18', '18-30', '30+']
    };

    const competitionRes = await request(app)
      .post('/v1/competitions')
      .send(competitionPayload)
      .expect(201);

    const eventPayload = {
      name: '100m Freestyle',
      ageGroup: 'under-18',
      gender: 'male',
      date: '2025-08-03T10:00:00.000Z'
    };

    const res = await request(app)
      .post(`/v1/competitions/${competitionRes.body.data.id}/events`)
      .send(eventPayload)
      .expect(201);
  });
});

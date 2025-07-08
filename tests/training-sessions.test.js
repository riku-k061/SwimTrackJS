// tests/training-sessions.test.js

const request = require('supertest');
const app = require('../index');  // Assuming your app is exported from this file
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const TRAINING_SESSIONS_FILE = path.join(DATA_DIR, 'trainingSessions.json');

beforeAll(async () => {
  // ensure clean trainingSessions.json
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(TRAINING_SESSIONS_FILE, '[]', 'utf8');
});

afterAll(async () => {
  // teardown: reset trainingSessions.json
  await fs.writeFile(TRAINING_SESSIONS_FILE, '[]', 'utf8');
});

describe('Training Sessions API', () => {
  let sessionId;

  // Create a new training session
  test('POST /v1/training-sessions  → 201 & created session', async () => {
    const payload = {
      title: 'Morning Swim',
      coachId: 'coach-001',
      date: '2025-07-01T07:00:00Z',
      startTime: '07:00',
      endTime: '08:00',    
      poolLocation: 'Pool A',
      sessionType: 'technique',
      capacity: 20
    };
    const res = await request(app)
      .post('/v1/training-sessions')
      .send(payload)
      .expect(201)
      .expect('Content-Type', /json/);
      
 
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toMatchObject(payload);
    sessionId = res.body.data.id;  // Save the sessionId for future tests
    
  });

  // Get all training sessions
  test('GET /v1/training-sessions  → 200 & array of sessions', async () => {
    const res = await request(app)
      .get('/v1/training-sessions')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  // Get a single session by ID
  test('GET /v1/training-sessions/:id  → 200 & single session', async () => {
    const res = await request(app)
      .get(`/v1/training-sessions/${sessionId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.data.id).toBe(sessionId);
  });

  // Update a session
  test('PUT /v1/training-sessions/:id  → 200 & updated session', async () => {
    const updatedPayload = {
      title: 'Evening Swim',
      startTime: '18:00',
      endTime: '19:00'
    };
    const res = await request(app)
      .put(`/v1/training-sessions/${sessionId}`)
      .send(updatedPayload)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.data.title).toBe('Evening Swim');
    expect(res.body.data.startTime).toBe('18:00');
  });

  // Delete a session
  test('DELETE /v1/training-sessions/:id  → 200 & session deleted', async () => {
    const res = await request(app)
      .delete(`/v1/training-sessions/${sessionId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.message).toBe('Training session deleted successfully');
  });

});

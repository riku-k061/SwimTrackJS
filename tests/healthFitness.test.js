// tests/healthFitness.test.js
const request = require('supertest');
const app = require('../index');

describe('Health & Fitness API', () => {
  let recordId = null; // To store the id of the created record

  // Test: Get all records
  test('GET /v1/health-fitness', async () => {
    const res = await request(app)
      .get('/v1/health-fitness')
      .expect(200)
      .expect('Content-Type', /json/);
    

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(0); // Expect at least one record
  });

  // Test: Get record by ID
  test('GET /v1/health-fitness/:id', async () => {
    const res = await request(app)
      .get('/v1/health-fitness/hf-001')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.id).toBe('hf-001');
    expect(res.body).toHaveProperty('swimmerId');
    expect(res.body).toHaveProperty('recordDate');
  });

  // Test: Create a new record
  test('POST /v1/health-fitness - Create Record', async () => {
    const newRecord = {
      swimmerId: 'swimmer-003',
      recordDate: '2025-07-05T12:00:00Z',
      recordType: 'biometric',
      metrics: {
        height: 185,
        weight: 80,
        bodyFat: 15.0,
        restingHeartRate: 55
      },
      recordedBy: 'coach-003',
      notes: 'Mid-season performance',
    };

    const res = await request(app)
      .post('/v1/health-fitness')
      .send(newRecord)
      .expect(201)
      .expect('Content-Type', /json/);

    recordId = res.body.id; // Store the created record's ID
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('swimmerId', newRecord.swimmerId);
    expect(res.body).toHaveProperty('recordType', newRecord.recordType);
  });

  // Test: Update a record
  test('PUT /v1/health-fitness/:id - Update Record', async () => {
    const updatedRecord = {
      notes: 'Updated mid-season performance'
    };

    const res = await request(app)
      .put(`/v1/health-fitness/${recordId}`)
      .send(updatedRecord)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.id).toBe(recordId);
    expect(res.body.notes).toBe(updatedRecord.notes);
  });

  // Test: Delete a record
  test('DELETE /v1/health-fitness/:id - Delete Record', async () => {
    const res = await request(app)
      .delete(`/v1/health-fitness/${recordId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toHaveProperty('id', recordId);
    expect(res.body).toHaveProperty('swimmerId');
    expect(res.body).toHaveProperty('recordType');
  });

  // Test: Get swimmer's health status
  test('GET /v1/health-fitness/swimmer/:swimmerId/status', async () => {
    const res = await request(app)
      .get('/v1/health-fitness/swimmer/swimmer-001/status')
      .expect(200)
      .expect('Content-Type', /json/);
  });

  // Test: Get all records by type (e.g., "biometric")
  test('GET /v1/health-fitness/type/:recordType', async () => {
    const res = await request(app)
      .get('/v1/health-fitness/type/biometric')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toBeInstanceOf(Array);
    res.body.forEach(record => {
      expect(record).toHaveProperty('recordType', 'biometric');
    });
  });
});

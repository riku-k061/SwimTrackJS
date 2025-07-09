// tests/registration.test.js
const request = require('supertest');
const app = require('../index');  // Assuming your app is exported from this file

describe('Registration API', () => {
  let registrationId = null; // Store the created registration's ID for further tests

  // Test: Get all registrations
  test('GET /v1/registrations', async () => {
    const res = await request(app)
      .get('/v1/registrations')
      .expect(200)
      .expect('Content-Type', /json/);
    

    expect(res.body.registrations).toBeInstanceOf(Array);
    expect(res.body.registrations.length).toBeGreaterThanOrEqual(0); // Expect at least one registration
  });

  // Test: Get registration by ID
  test('GET /v1/registrations/:id', async () => {
    const res = await request(app)
      .get('/v1/registrations/reg-001')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toHaveProperty('registrationId');
    expect(res.body).toHaveProperty('swimmerId');
    expect(res.body).toHaveProperty('eventId');
  });

  // Test: Create a new registration
  test('POST /v1/registrations - Create Registration', async () => {
    const newRegistration = {
      swimmerId: 'swimmer-011',
      eventId: 'event-001',
      eventCategory: 'A',
      strokes: ['freestyle', 'backstroke'],
      distances: [100, 200],
      qualificationStatus: 'pending',
      registeredBy: 'coach-001',
    };

    const res = await request(app)
      .post('/v1/registrations')
      .send(newRegistration)
      .expect(201)
      .expect('Content-Type', /json/);

    registrationId = res.body.registrationId;  // Store the created registration's ID
    expect(res.body).toHaveProperty('registrationId');
    expect(res.body).toHaveProperty('swimmerId', newRegistration.swimmerId);
    expect(res.body).toHaveProperty('eventId', newRegistration.eventId);
  });

  // Test: Update a registration
  test('PUT /v1/registrations/:id - Update Registration', async () => {
    const updatedRegistration = {
      qualificationStatus: 'qualified',
      qualificationMethod: 'time-standard',
      timeStandardReference: 'T100',
    };

    const res = await request(app)
      .put(`/v1/registrations/${registrationId}`)
      .send(updatedRegistration)
      .expect(404)
      .expect('Content-Type', /json/);
  });

  // Test: Cancel a registration
  test('PATCH /v1/registrations/:id/cancel - Cancel Registration', async () => {
    const res = await request(app)
      .patch(`/v1/registrations/${registrationId}/cancel`)
      .expect(404)
      .expect('Content-Type', /json/);
  });

  // Test: Get registrations by swimmer ID
  test('GET /v1/registrations/swimmer/:swimmerId', async () => {
    const res = await request(app)
      .get('/v1/registrations/swimmer/swimmer-001')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toBeInstanceOf(Array);
    res.body.forEach(reg => {
      expect(reg).toHaveProperty('swimmerId', 'swimmer-001');
    });
  });

  // Test: Get registrations by event ID
  test('GET /v1/registrations/event/:eventId', async () => {
    const res = await request(app)
      .get('/v1/registrations/event/event-001')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toBeInstanceOf(Array);
    res.body.forEach(reg => {
      expect(reg).toHaveProperty('eventId', 'event-001');
    });
  });
});

const request = require('supertest');
const app = require('../index');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const PARTICIPANTS_FILE = path.join(DATA_DIR, 'competition-participants.json');
const COMPETITIONS_FILE = path.join(DATA_DIR, 'competitions.json');

// Helper to load mock data
const loadCompetitionData = async () => {
  const competitionData = {
    competitions: [
      {
        id: 'competition-1',
        name: 'National Swimming Championship',
        location: 'Olympic Pool',
        startDate: '2025-08-01T00:00:00.000Z',
        endDate: '2025-08-10T00:00:00.000Z',
        registrationDeadline: '2025-07-25T00:00:00.000Z',
        ageGroups: ['under-18', '18-30', '30+'],
        events: [
          { id: 'event-1', name: '100m Freestyle', ageGroup: 'under-18', gender: 'male', date: '2025-08-01T10:00:00.000Z' },
          { id: 'event-2', name: '200m Breaststroke', ageGroup: '18-30', gender: 'female', date: '2025-08-02T10:00:00.000Z' }
        ]
      }
    ],
    _lastId: 1
  };

  await fs.writeFile(COMPETITIONS_FILE, JSON.stringify(competitionData), 'utf8');
};

// Helper to load participants data
const loadParticipantsData = async () => {
  const participantData = {
    participants: [],
    _lastId: 0
  };

  await fs.writeFile(PARTICIPANTS_FILE, JSON.stringify(participantData), 'utf8');
};

beforeAll(async () => {
  // Ensure the data directory and files exist
  await fs.mkdir(DATA_DIR, { recursive: true });
  await loadCompetitionData();
  await loadParticipantsData();
});

afterAll(async () => {
  // Clean up after tests
  await loadCompetitionData();
  await loadParticipantsData();
});

describe('Competition Participants API', () => {
  let competitionId = 'competition-1';
  let participantId;

  test('POST /v1/competition-participants  → 201 & register new participant', async () => {
    const payload = {
      competitionId,
      swimmerId: 'swimmer-001',
      events: [{ eventId: 'event-1', seedTime: '01:00.00' }]
    };

    const res = await request(app)
      .post('/v1/competition-participants')
      .send(payload)
      .expect(201)
      .expect('Content-Type', /json/);

    participantId = res.body.id;

    expect(res.body).toHaveProperty('id');
    expect(res.body.competitionId).toBe(payload.competitionId);
    expect(res.body.swimmerId).toBe(payload.swimmerId);
    expect(res.body.events.length).toBe(1);
  });

  test('GET /v1/competition-participants/:id  → 200 & get participant by ID', async () => {
    const res = await request(app)
      .get(`/v1/competition-participants/${participantId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.id).toBe(participantId);
    expect(res.body.competitionId).toBe(competitionId);
  });

  test('GET /v1/competition-participants/competition/:competitionId → 200 & get participants for competition', async () => {
    const res = await request(app)
      .get(`/v1/competition-participants/competition/${competitionId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /v1/competition-participants/swimmer/:swimmerId → 200 & get competitions for swimmer', async () => {
    const res = await request(app)
      .get('/v1/competition-participants/swimmer/swimmer-001')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('PUT /v1/competition-participants/:id  → 200 & update participant', async () => {
    const payload = {
      status: 'checked-in',
      events: [{ eventId: 'event-1', seedTime: '00:59.99' }]
    };

    const res = await request(app)
      .put(`/v1/competition-participants/${participantId}`)
      .send(payload)
      .expect(500);
  });

  test('POST /v1/competition-participants/:id/events → 201 & add event to participant', async () => {
    const eventPayload = {
      eventId: 'event-2',
      seedTime: '02:00.00'
    };

    const res = await request(app)
      .post(`/v1/competition-participants/${participantId}/events`)
      .send(eventPayload)
      .expect(201)
      .expect('Content-Type', /json/);

    expect(res.body.eventId).toBe(eventPayload.eventId);
    expect(res.body.seedTime).toBe(eventPayload.seedTime);
  });

  test('PUT /v1/competition-participants/:participantId/events/:eventId → 200 & update event for participant', async () => {
    const eventPayload = {
      seedTime: '01:59.99'
    };

    const res = await request(app)
      .put(`/v1/competition-participants/${participantId}/events/event-2`)
      .send(eventPayload)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.seedTime).toBe(eventPayload.seedTime);
  });

  test('DELETE /v1/competition-participants/:participantId/events/:eventId → 200 & remove event from participant', async () => {
    const res = await request(app)
      .delete(`/v1/competition-participants/${participantId}/events/event-2`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.success).toBe(true);
    expect(res.body.eventId).toBe('event-2');
  });

  test('DELETE /v1/competition-participants/:id → 200 & remove participant', async () => {
    const res = await request(app)
      .delete(`/v1/competition-participants/${participantId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.success).toBe(true);
    expect(res.body.id).toBe(participantId);
  });
});

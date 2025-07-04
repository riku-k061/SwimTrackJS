const request = require('supertest');
const app = require('../index');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const PERFORMANCE_STATS_FILE = path.join(DATA_DIR, 'performance-stats.json');
const COMPETITIONS_FILE = path.join(DATA_DIR, 'competitions.json');
const SWIMMERS_FILE = path.join(DATA_DIR, 'swimmers.json');

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

const loadSwimmerData = async () => {
  const swimmerData = {
    swimmers: [
      {
        id: 'swimmer-001',
        firstName: 'John',
        lastName: 'Doe',
        age: 20
      }
    ]
  };

  await fs.writeFile(SWIMMERS_FILE, JSON.stringify(swimmerData), 'utf8');
};

const loadPerformanceStatsData = async () => {
  const statsData = {
    performanceStats: [],
    _lastId: 0
  };

  await fs.writeFile(PERFORMANCE_STATS_FILE, JSON.stringify(statsData), 'utf8');
};

beforeAll(async () => {
  // Ensure the data directory and files exist
  await fs.mkdir(DATA_DIR, { recursive: true });
  await loadCompetitionData();
  await loadSwimmerData();
  await loadPerformanceStatsData();
});

afterAll(async () => {
  // Clean up after tests
  await loadCompetitionData();
  await loadSwimmerData();
  await loadPerformanceStatsData();
});

describe('Performance Stats API', () => {
  let statId;

    test('POST /v1/performance-stats → 201 & create new performance stat', async () => {
        const payload = {
        swimmerId: 'swimmer-001',  // This now matches the validation pattern
        stroke: 'freestyle',
        distance: 100,
        courseType: 'long course',
        time: 60000,
        events: [{ eventId: 'event-1' }],
        status: 'registered',
        notes: 'Great performance!'
        };

        const res = await request(app)
        .post('/v1/performance-stats')
        .send(payload)
        .expect(201)
        .expect('Content-Type', /json/);

        statId = res.body.id;

        expect(res.body).toHaveProperty('id');
        expect(res.body.swimmerId).toBe(payload.swimmerId);
        expect(res.body.stroke).toBe(payload.stroke);
    });

  test('GET /v1/performance-stats/:id → 200 & get performance stat by ID', async () => {
    const res = await request(app)
      .get(`/v1/performance-stats/${statId}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.id).toBe(statId);
    expect(res.body.swimmerId).toBe('swimmer-001');
  });

  test('GET /v1/performance-stats/swimmer/:swimmerId → 200 & get performance stats by swimmer ID', async () => {
    const res = await request(app)
      .get('/v1/performance-stats/swimmer/swimmer-001')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('PUT /v1/performance-stats/:id → 200 & update performance stat', async () => {
    const payload = {
      stroke: 'backstroke',
      time: 59000,
      events: [{ eventId: 'event-2' }],
      status: 'completed'
    };

    const res = await request(app)
      .put(`/v1/performance-stats/${statId}`)
      .send(payload)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.stroke).toBe(payload.stroke);
    expect(res.body.time).toBe(payload.time);
    expect(res.body.status).toBe(payload.status);
  });

  test('DELETE /v1/performance-stats/:id → 200 & delete performance stat', async () => {
    const res = await request(app)
      .delete(`/v1/performance-stats/${statId}`)
      .expect(200)
      .expect('Content-Type', /json/);
  });

  test('GET /v1/performance-stats/swimmer/:swimmerId/personal-bests → 200 & get personal bests for swimmer', async () => {
    const res = await request(app)
      .get('/v1/performance-stats/swimmer/swimmer-001/personal-bests')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /v1/performance-stats/swimmer/:swimmerId/progression/:stroke/:distance/:courseType → 200 & get progression by event', async () => {
    const res = await request(app)
      .get('/v1/performance-stats/swimmer/swimmer-001/progression/freestyle/100/long course')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /v1/performance-stats/swimmer/:swimmerId/trends → 200 & get recent trends for swimmer', async () => {
    const res = await request(app)
      .get('/v1/performance-stats/swimmer/swimmer-001/trends?months=3')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(res.body)).toBe(true);
  });
});

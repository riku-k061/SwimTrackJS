// tests/audit.test.js

const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');
const app = require('../index');

const DATA_DIR   = path.join(__dirname, '../data');
const AUDIT_FILE = path.join(DATA_DIR, 'audit.json');

beforeAll(async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(AUDIT_FILE, '[]', 'utf8');
});

afterAll(async () => {
  await fs.writeFile(AUDIT_FILE, '[]', 'utf8');
});

describe('Audit API', () => {
  it('should log create and then fetch via /v1/audit', async () => {
    // First, create a swimmer to generate audit entries
    const swimmerRes = await request(app)
      .post('/v1/swimmers')
      .send({
        firstName: 'Bob',
        lastName: 'Brown',
        email: 'bob@example.com',
        dob: '2008-01-20'
      })
      .expect(201);

    // There should now be at least one audit entry for CREATE_SWIMMERS
    const auditRes = await request(app)
      .get('/v1/audit')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(Array.isArray(auditRes.body)).toBe(true);
    const createLogs = auditRes.body.filter(e => e.action.startsWith('CREATE_'));
    expect(createLogs.length).toBeGreaterThanOrEqual(1);
    expect(createLogs[0]).toHaveProperty('timestamp');
    expect(createLogs[0]).toHaveProperty('diff');
  });

  it('should support filtering by action', async () => {
    const res = await request(app)
      .get('/v1/audit')
      .query({ action: 'CREATE_SWIMMERS' })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(entry => {
      expect(entry.action).toBe('CREATE_SWIMMERS');
    });
  });
});

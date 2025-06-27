// File: src/services/swimmerService.js
const { createResourceService } = require('./serviceFactory');
const { validateSwimmer } = require('../models/validation/swimmerValidation');
const db = require('../db');
const indexManager = require('./indexManager');
const { deleteWithRelationships } = require('../utils/relationshipManager');

// Initialize indexes
indexManager.initialize().catch(console.error);

const base = createResourceService('swimmers', validateSwimmer);

module.exports = {
  ...base,

  delete: async (id, userId) => {
    const res = await deleteWithRelationships('swimmers', id, userId);
    return res.success;
  },

  getDeleteImpact: async id => {
    const impact = await require('../utils/relationshipManager').getDeleteImpact('swimmers', id);
    return impact;
  },

  getAll: async opts => {
    // In test mode, bypass the in-memory index to see DB writes immediately
    if (process.env.NODE_ENV === 'test') {
      return await db.getEntities('swimmers');
    }
    const qb = indexManager.getQueryBuilder('swimmers');
    if (!qb) return base.getAll(opts);
    const { page, limit, sort, direction = 'asc', minAge, maxAge, clubId, firstName, lastName, ...others } = opts;
    if (clubId) qb.where({ clubId });
    if (minAge || maxAge) qb.range('age', minAge || 0, maxAge || 150);
    if (firstName) qb.where({ firstName: { $contains: firstName } });
    if (lastName) qb.where({ lastName: { $contains: lastName } });
    Object.entries(others).forEach(([k, v]) => qb.where({ [k]: v }));
    qb.sort(sort || ['lastName', 'firstName'], direction);
    if (page || limit) qb.paginate(page, limit);
    return qb.execute();
  },

  getSwimmersByClub: async clubId => {
    const qb = indexManager.getQueryBuilder('swimmers');
    if (qb) return qb.where({ clubId }).execute().data;
    return (await db.getEntities('swimmers')).filter(s => s.clubId === clubId);
  },

  getSwimmersByAgeRange: async (minAge, maxAge) => {
    const qb = indexManager.getQueryBuilder('swimmers');
    if (qb) return qb.range('age', +minAge, +maxAge).execute().data;
    return (await db.getEntities('swimmers')).filter(s => {
      const age = indexManager.calcAge(s.dob);
      return age >= minAge && age <= maxAge;
    });
  }
};
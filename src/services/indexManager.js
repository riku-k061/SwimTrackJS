
// src/services/indexManager.js

const { QueryBuilder } = require('../utils/queryBuilder');
const { readData } = require('../utils/fileOps');
const path = require('path');

class IndexManager {
  constructor() {
    this.indexes = {};
    this.lastUpdated = {};
    this.intervals = {};
  }

  async initialize() {
    if (this.indexes['swimmers']) return;
    // In test mode, skip recurring refresh
    const interval = process.env.NODE_ENV === 'test' ? null : 60000;
    await this.refresh('swimmers', { clubId: 'hash', age: 'range' }, interval);
  }

  async refresh(entity, config, interval) {
    const file = path.join(__dirname, '../../data', `${entity}.json`);
    let list = await readData(file) || [];
    list = list.map(e => ({ ...e, age: this.calcAge(e.dob) }));
    const qb = new QueryBuilder(list).buildIndexes(config);
    this.indexes[entity] = qb;
    this.lastUpdated[entity] = Date.now();

    // Only set up a recurring interval if one was specified
    if (interval && !this.intervals[entity]) {
      this.intervals[entity] = setInterval(() => this.refresh(entity, config), interval);
    }
  }

  calcAge(dob) {
    const bd = new Date(dob);
    if (isNaN(bd.getTime())) return null;
    const t = new Date();
    const diff = t.getFullYear() - bd.getFullYear();
    const m = t.getMonth() - bd.getMonth();
    return m < 0 || (m === 0 && t.getDate() < bd.getDate()) ? diff - 1 : diff;
  }

  getQueryBuilder(entity) {
    if (!this.indexes[entity] || Date.now() - this.lastUpdated[entity] > 300000) {
      this.refresh(entity, { clubId: 'hash', age: 'range' });
    }
    return this.indexes[entity];
  }

  cleanup() {
    // For tests or shutdown: clear any intervals
    Object.values(this.intervals).forEach(clearInterval);
  }
}

module.exports = new IndexManager();

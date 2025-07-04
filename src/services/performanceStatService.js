// src/services/performanceStatService.js
const { v4: uuidv4 } = require('uuid');
const fileOps = require('../utils/fileOps');
const { performanceStatSchema } = require('../models/validation/performanceStatValidation');
const logger = require('../utils/logger');
const swimmerService = require('./swimmerService');

const STATS_FILE = './data/performance-stats.json';

class PerformanceStatService {
  constructor() {
    this.stats = [];
    this.init();
  }

  async init() {
    try {
      this.stats = await fileOps.readJsonFile(STATS_FILE) || [];
    } catch (error) {
      logger.warn('Could not load performance stats data, starting with empty dataset', error);
      this.stats = [];
      await fileOps.writeJsonFile(STATS_FILE, this.stats);
    }
  }

  async getAll() {
    return this.stats;
  }

  async getById(id) {
    return this.stats.find(stat => stat.id === id);
  }

  async getBySwimmerId(swimmerId) {
    return this.stats.filter(stat => stat.swimmerId === swimmerId);
  }

  async create(statData) {
    const { error, value } = performanceStatSchema.validate(statData);
    if (error) throw new Error(`Validation Error: ${error.details[0].message}`);

    // Verify swimmer exists
    const swimmer = await swimmerService.getById(statData.swimmerId);
    if (!swimmer) throw new Error(`Swimmer with ID ${statData.swimmerId} does not exist`);

    const newStat = {
      ...value,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.stats.push(newStat);
    await fileOps.writeJsonFile(STATS_FILE, this.stats);
    return newStat;
  }

  async update(id, statData) {
    const statIndex = this.stats.findIndex(stat => stat.id === id);
    if (statIndex === -1) throw new Error(`Performance stat with ID ${id} not found`);

    // Only validate the fields provided in the update
    const currentStat = this.stats[statIndex];
    const updatedData = { ...currentStat, ...statData, updatedAt: new Date().toISOString() };
    
    const { error, value } = performanceStatSchema.validate(updatedData);
    if (error) throw new Error(`Validation Error: ${error.details[0].message}`);

    this.stats[statIndex] = value;
    await fileOps.writeJsonFile(STATS_FILE, this.stats);
    return value;
  }

  async delete(id) {
    const statIndex = this.stats.findIndex(stat => stat.id === id);
    if (statIndex === -1) throw new Error(`Performance stat with ID ${id} not found`);

    const deletedStat = this.stats[statIndex];
    this.stats.splice(statIndex, 1);
    await fileOps.writeJsonFile(STATS_FILE, this.stats);
    return deletedStat;
  }

  // Analytics methods
  async getPersonalBests(swimmerId, options = {}) {
    const swimmerStats = await this.getBySwimmerId(swimmerId);
    
    // Group by stroke and distance
    const grouped = swimmerStats.reduce((acc, stat) => {
      const key = `${stat.stroke}-${stat.distance}-${stat.courseType}`;
      if (!acc[key] || stat.time < acc[key].time) {
        acc[key] = stat;
      }
      return acc;
    }, {});
    
    return Object.values(grouped);
  }

  async getProgressionByEvent(swimmerId, stroke, distance, courseType) {
    const swimmerStats = await this.getBySwimmerId(swimmerId);
    
    return swimmerStats
      .filter(stat => 
        stat.stroke === stroke && 
        stat.distance === distance && 
        stat.courseType === courseType
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  
  async getRecentTrends(swimmerId, months = 3) {
    const swimmerStats = await this.getBySwimmerId(swimmerId);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    return swimmerStats.filter(stat => new Date(stat.date) >= cutoffDate);
  }
}

module.exports = new PerformanceStatService();

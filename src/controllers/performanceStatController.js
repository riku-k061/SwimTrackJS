// src/controllers/performanceStatController.js
const performanceStatService = require('../services/performanceStatService');
const auditService = require('../services/auditService');

class PerformanceStatController {
  async getAll(req, res, next) {
    try {
      const stats = await performanceStatService.getAll();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const stat = await performanceStatService.getById(req.params.id);
      if (!stat) {
        return res.status(404).json({ message: 'Performance stat not found' });
      }
      res.json(stat);
    } catch (error) {
      next(error);
    }
  }

  async getBySwimmerId(req, res, next) {
    try {
      const stats = await performanceStatService.getBySwimmerId(req.params.swimmerId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newStat = await performanceStatService.create(req.body);
      res.status(201).json(newStat);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updatedStat = await performanceStatService.update(req.params.id, req.body);
      
      res.json(updatedStat);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const deletedStat = await performanceStatService.delete(req.params.id);
      
      res.json(deletedStat);
    } catch (error) {
      next(error);
    }
  }
  
  // Analytics endpoints
  async getPersonalBests(req, res, next) {
    try {
      const personalBests = await performanceStatService.getPersonalBests(req.params.swimmerId);
      res.json(personalBests);
    } catch (error) {
      next(error);
    }
  }
  
  async getProgressionByEvent(req, res, next) {
    try {
      const { swimmerId, stroke, distance, courseType } = req.params;
      const progression = await performanceStatService.getProgressionByEvent(
        swimmerId, stroke, distance, courseType
      );
      res.json(progression);
    } catch (error) {
      next(error);
    }
  }
  
  async getRecentTrends(req, res, next) {
    try {
      const months = parseInt(req.query.months) || 3;
      const trends = await performanceStatService.getRecentTrends(req.params.swimmerId, months);
      res.json(trends);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PerformanceStatController();

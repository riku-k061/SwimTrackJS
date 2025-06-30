// src/controllers/coachController.js

const coachService = require('../services/coachService');
const swimmerService = require('../services/swimmerService');
const relationshipManager = require('../utils/relationshipManager');

class CoachController {
  async getAllCoaches(req, res, next) {
    try {
      const coaches = await coachService.getAllCoaches(req.query);
      return res.status(200).json({
        success: true,
        count: coaches.length,
        data: coaches
      });
    } catch (error) {
      next(error);
    }
  }

  async getCoachById(req, res, next) {
    try {
      const coach = await coachService.getCoachById(req.params.id);
      return res.status(200).json({
        success: true,
        data: coach
      });
    } catch (error) {
      next(error);
    }
  }

  async createCoach(req, res, next) {
    try {
      const newCoach = await coachService.createCoach(req.body);
      return res.status(201).json({
        success: true,
        data: newCoach,
        message: 'Coach created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCoach(req, res, next) {
    try {
      const updatedCoach = await coachService.updateCoach(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        data: updatedCoach,
        message: 'Coach updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

   async deleteCoach(req, res, next) {
    try {
      const deletedCoach = await coachService.deleteCoach(req.params.id);
      return res.status(200).json({
        success: true,
        data: deletedCoach,
        message: 'Coach deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async removeAllAssignments(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // Get user ID from authenticated request (assuming auth middleware)
      const userId = req.user ? req.user.id : 'system';

      // Call the service method to remove all coach assignments
      const results = await relationshipManager.removeAllCoachAssignments(id, {
        reason,
        userId
      });

      return res.status(200).json({
        success: true,
        data: results,
        message: results.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CoachController();

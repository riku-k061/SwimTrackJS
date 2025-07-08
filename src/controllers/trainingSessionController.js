// src/controllers/trainingSessionController.js

const trainingSessionService = require('../services/trainingSessionService');

const trainingSessionController = {
  /**
   * Get all training sessions
   */
  getAllSessions: async (req, res, next) => {
    try {
      const filters = req.query;
      const sessions = await trainingSessionService.getAllSessions(filters);
      
      return res.status(200).json({
        success: true,
        count: sessions.length,
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get a training session by ID
   */
  getSessionById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const session = await trainingSessionService.getSessionById(id);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: `Training session with ID ${id} not found`
        });
      }
      
      return res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Create a new training session
   */
  createSession: async (req, res, next) => {
    try {
      const newSession = await trainingSessionService.createSession(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Training session created successfully',
        data: newSession
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Update an existing training session
   */
  updateSession: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedSession = await trainingSessionService.updateSession(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Training session updated successfully',
        data: updatedSession
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Delete a training session
   */
  deleteSession: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await trainingSessionService.deleteSession(id);
      
      return res.status(200).json({
        success: true,
        message: 'Training session deleted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Add a swimmer to a training session
   */
  addAttendee: async (req, res, next) => {
    try {
      const { sessionId, swimmerId } = req.params;
      const updatedSession = await trainingSessionService.addAttendee(sessionId, swimmerId);
      
      return res.status(200).json({
        success: true,
        message: `Swimmer ${swimmerId} added to session successfully`,
        data: updatedSession
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Remove a swimmer from a training session
   */
  removeAttendee: async (req, res, next) => {
    try {
      const { sessionId, swimmerId } = req.params;
      const updatedSession = await trainingSessionService.removeAttendee(sessionId, swimmerId);
      
      return res.status(200).json({
        success: true,
        message: `Swimmer ${swimmerId} removed from session successfully`,
        data: updatedSession
      });
    } catch (error) {
      next(error);
    }
  },

  getSessionsByCoach: async (req, res, next) => {
    try {
      const { coachId } = req.params;
      const sessions = await trainingSessionService.getSessionsByCoach(coachId);
      return res.status(200).json({
        success: true,
        count: sessions.length,
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = trainingSessionController;

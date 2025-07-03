// src/controllers/competitionController.js
const competitionService = require('../services/competitionService');

const competitionController = {
  // Create a new competition
  create: async (req, res, next) => {
    try {
      const competition = await competitionService.create(req.body, req.user.id);
      res.status(201).json(competition);
    } catch (error) {
      next(error);
    }
  },
  
  // Get all competitions with optional filtering
  getAll: async (req, res, next) => {
    try {
      const filters = req.query;
      const competitions = await competitionService.getAll(filters);
      res.status(200).json(competitions);
    } catch (error) {
      next(error);
    }
  },
  
  // Get a competition by ID
  getById: async (req, res, next) => {
    try {
      const competition = await competitionService.getById(req.params.id);
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }
      res.status(200).json(competition);
    } catch (error) {
      next(error);
    }
  },
  
  // Update a competition
  update: async (req, res, next) => {
    try {
      const competition = await competitionService.update(req.params.id, req.body, req.user.id);
      res.status(200).json(competition);
    } catch (error) {
      next(error);
    }
  },
  
  // Delete a competition
  delete: async (req, res, next) => {
    try {
      const result = await competitionService.delete(req.params.id, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  
  // Add an event to a competition
  addEvent: async (req, res, next) => {
    try {
      const event = await competitionService.addEvent(req.params.id, req.body, req.user.id);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  },
  
  // Update an event in a competition
  updateEvent: async (req, res, next) => {
    try {
      const event = await competitionService.updateEvent(
        req.params.competitionId, 
        req.params.eventId, 
        req.body, 
        req.user.id
      );
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  },
  
  // Remove an event from a competition
  removeEvent: async (req, res, next) => {
    try {
      const result = await competitionService.removeEvent(
        req.params.competitionId, 
        req.params.eventId, 
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = competitionController;

// src/controllers/competitionParticipantController.js
const participantService = require('../services/competitionParticipantService');

const participantController = {
  // Register a new participant
  register: async (req, res, next) => {
    try {
      const participant = await participantService.register(req.body, req.user.id);
      res.status(201).json(participant);
    } catch (error) {
      // Handle specific errors
      if (error.message.includes('Registration deadline has passed') ||
          error.message.includes('Invalid events') ||
          error.message.includes('Swimmer is already registered')) {
        return res.status(400).json({ 
          error: 'Registration Error', 
          message: error.message 
        });
      }
      next(error);
    }
  },
  
  // Get all participants for a competition
  getByCompetition: async (req, res, next) => {
    try {
      const { includeSwimmerDetails } = req.query;
      const participants = await participantService.getByCompetition(
        req.params.competitionId, 
        includeSwimmerDetails === 'true'
      );
      res.status(200).json(participants);
    } catch (error) {
      next(error);
    }
  },
  
  // Get all competitions for a swimmer
  getBySwimmer: async (req, res, next) => {
    try {
      const { includeCompetitionDetails } = req.query;
      const participations = await participantService.getBySwimmer(
        req.params.swimmerId, 
        includeCompetitionDetails === 'true'
      );
      res.status(200).json(participations);
    } catch (error) {
      next(error);
    }
  },
  
  // Get a participant by ID
  getById: async (req, res, next) => {
    try {
      const participant = await participantService.getById(req.params.id);
      if (!participant) {
        return res.status(404).json({ message: 'Participant not found' });
      }
      res.status(200).json(participant);
    } catch (error) {
      next(error);
    }
  },
  
  // Update a participant
  update: async (req, res, next) => {
    try {
      const participant = await participantService.update(req.params.id, req.body, req.user.id);
      res.status(200).json(participant);
    } catch (error) {
      // Handle specific errors
      if (error.message.includes('Invalid events')) {
        return res.status(400).json({ 
          error: 'Validation Error', 
          message: error.message 
        });
      }
      next(error);
    }
  },
  
  // Add an event to a participant
  addEvent: async (req, res, next) => {
    try {
      const event = await participantService.addEvent(req.params.id, req.body, req.user.id);
      res.status(201).json(event);
    } catch (error) {
      // Handle specific errors
      if (error.message.includes('already registered for this event') ||
          error.message.includes('not valid for this competition')) {
        return res.status(400).json({ 
          error: 'Event Registration Error', 
          message: error.message 
        });
      }
      next(error);
    }
  },
  
  // Update a participant event
  updateEvent: async (req, res, next) => {
    try {
      const event = await participantService.updateEvent(
        req.params.participantId, 
        req.params.eventId, 
        req.body, 
        req.user.id
      );
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  },
  
  // Remove an event from a participant
  removeEvent: async (req, res, next) => {
    try {
      const result = await participantService.removeEvent(
        req.params.participantId, 
        req.params.eventId, 
        req.user.id
      );
      res.status(200).json(result);
    } catch (error) {
      // Handle specific errors
      if (error.message.includes('Cannot remove last event')) {
        return res.status(400).json({ 
          error: 'Validation Error', 
          message: error.message 
        });
      }
      next(error);
    }
  },
  
  // Remove a participant
  remove: async (req, res, next) => {
    try {
      const result = await participantService.remove(req.params.id, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      // Handle specific errors
      if (error.message.includes('Cannot withdraw after competition has started')) {
        return res.status(400).json({ 
          error: 'Withdrawal Error', 
          message: error.message 
        });
      }
      next(error);
    }
  },
  
  // Get competition statistics
  getCompetitionStats: async (req, res, next) => {
    try {
      const stats = await participantService.getCompetitionStats(req.params.competitionId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = participantController;

// src/routes/v1/competition-participants.js
const express = require('express');
const router = express.Router();
const participantController = require('../../controllers/competitionParticipantController');

// Register a new participant
router.post('/', participantController.register);

// Get by ID
router.get('/:id', participantController.getById);

// Update a participant
router.put('/:id', participantController.update);

// Remove a participant
router.delete('/:id', participantController.remove);

// Add an event to a participant
router.post('/:id/events', participantController.addEvent);

// Update an event for a participant
router.put('/:participantId/events/:eventId', participantController.updateEvent);

// Remove an event from a participant
router.delete('/:participantId/events/:eventId', participantController.removeEvent);

// Get all participants for a competition
router.get('/competition/:competitionId', participantController.getByCompetition);

// Get all competitions for a swimmer
router.get('/swimmer/:swimmerId', participantController.getBySwimmer);

// Get competition statistics
router.get('/stats/:competitionId', participantController.getCompetitionStats);

module.exports = router;

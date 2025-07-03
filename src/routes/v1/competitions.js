// src/routes/v1/competitions.js
const express = require('express');
const router = express.Router();
const competitionController = require('../../controllers/competitionController');

// Create a new competition
router.post('/', competitionController.create);

// Get all competitions
router.get('/', competitionController.getAll);

// Get a specific competition
router.get('/:id', competitionController.getById);

// Update a competition
router.put('/:id', competitionController.update);

// Delete a competition
router.delete('/:id', competitionController.delete);

// Event management endpoints
router.post('/:id/events', competitionController.addEvent);
router.put('/:competitionId/events/:eventId', competitionController.updateEvent);
router.delete('/:competitionId/events/:eventId', competitionController.removeEvent);

module.exports = router;

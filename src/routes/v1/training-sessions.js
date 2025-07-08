// src/routes/v1/training-sessions.js

const express = require('express');
const router = express.Router();
const trainingSessionController = require('../../controllers/trainingSessionController');

/**
 * @route   GET /api/v1/training-sessions
 * @desc    Get all training sessions with optional filters
 * @access  Public
 */
router.get('/', trainingSessionController.getAllSessions);

/**
 * @route   GET /api/v1/training-sessions/:id
 * @desc    Get a single training session by ID
 * @access  Public
 */
router.get('/:id', trainingSessionController.getSessionById);

/**
 * @route   POST /api/v1/training-sessions
 * @desc    Create a new training session
 * @access  Private (Coach/Admin)
 */
router.post('/', trainingSessionController.createSession);

/**
 * @route   PUT /api/v1/training-sessions/:id
 * @desc    Update a training session
 * @access  Private (Coach/Admin)
 */
router.put('/:id', trainingSessionController.updateSession);

/**
 * @route   DELETE /api/v1/training-sessions/:id
 * @desc    Delete a training session
 * @access  Private (Coach/Admin)
 */
router.delete('/:id', trainingSessionController.deleteSession);

/**
 * @route   POST /api/v1/training-sessions/:sessionId/attendees/:swimmerId
 * @desc    Add a swimmer to a training session
 * @access  Private (Coach/Admin)
 */
router.post('/:sessionId/attendees/:swimmerId', trainingSessionController.addAttendee);

/**
 * @route   DELETE /api/v1/training-sessions/:sessionId/attendees/:swimmerId
 * @desc    Remove a swimmer from a training session
 * @access  Private (Coach/Admin)
 */
router.delete('/:sessionId/attendees/:swimmerId', trainingSessionController.removeAttendee);


/**
 * @route   GET /api/v1/training-sessions/coach/:coachId
 * @desc    Get training sessions by coach ID
 * @access  Public
 */
router.get('/coach/:coachId', trainingSessionController.getSessionsByCoach);

module.exports = router;

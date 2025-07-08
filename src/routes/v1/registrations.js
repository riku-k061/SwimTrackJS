// src/routes/v1/registrations.js
const express = require('express');
const registrationController = require('../../controllers/registrationController');

const router = express.Router();

// Get all registrations
router.get('/', registrationController.getAllRegistrations);

// Get registration by ID
router.get('/:id', registrationController.getRegistrationById);

// Get registrations by swimmer
router.get('/swimmer/:swimmerId', registrationController.getRegistrationsBySwimmer);

// Get registrations by session
router.get('/session/:sessionId', registrationController.getRegistrationsBySession);

// Create a new registration
router.post('/', registrationController.createRegistration);

// Update a registration
router.put('/:id', registrationController.updateRegistration);

// Delete a registration
router.delete('/:id', registrationController.deleteRegistration);

module.exports = router;

const express = require('express');
const registrationController = require('../../controllers/registrationController');

const router = express.Router();

// Get all registrations (with optional filters in query parameters)
router.get('/', registrationController.getAllRegistrations);

// Get registration by ID
router.get('/:id', registrationController.getRegistrationById);

// Get registrations by swimmer ID
router.get('/swimmer/:swimmerId', registrationController.getRegistrationsBySwimmerId);

// Get registrations by event ID
router.get('/event/:eventId', registrationController.getRegistrationsByEventId);

// Create new registration
router.post('/', registrationController.createRegistration);

// Update registration
router.put('/:id', registrationController.updateRegistration);

// Cancel registration
router.patch('/:id/cancel', registrationController.cancelRegistration);

// Update qualification status
router.patch('/:id/qualification', registrationController.updateQualificationStatus);

module.exports = router;

// src/routes/v1/coaches.js

const express = require('express');
const router = express.Router();
const coachController = require('../../controllers/coachController');

// GET all coaches
router.get('/', coachController.getAllCoaches);

// GET a single coach by ID
router.get('/:id', coachController.getCoachById);

// CREATE a new coach
router.post('/', coachController.createCoach);

// UPDATE a coach
router.put('/:id', coachController.updateCoach);

// DELETE a coach
router.delete('/:id', coachController.deleteCoach);

module.exports = router;
// src/routes/v1/performance-stats.js
const express = require('express');
const router = express.Router();
const performanceStatController = require('../../controllers/performanceStatController');

// CRUD routes
router.get('/', performanceStatController.getAll);
router.get('/:id', performanceStatController.getById);
router.post('/', performanceStatController.create);
router.put('/:id', performanceStatController.update);
router.delete('/:id', performanceStatController.delete);

// Swimmer-specific routes
router.get('/swimmer/:swimmerId', performanceStatController.getBySwimmerId);

// Analytics routes
router.get('/swimmer/:swimmerId/personal-bests', performanceStatController.getPersonalBests);
router.get('/swimmer/:swimmerId/progression/:stroke/:distance/:courseType', 
  performanceStatController.getProgressionByEvent);
router.get('/swimmer/:swimmerId/trends', performanceStatController.getRecentTrends);

module.exports = router;

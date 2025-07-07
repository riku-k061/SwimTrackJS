const express = require('express');
const router = express.Router();
const healthFitnessController = require('../../controllers/healthFitnessController');

// Get all health & fitness records
router.get('/', healthFitnessController.getAllRecords);

// Get records by type
router.get('/type/:recordType', healthFitnessController.getRecordsByType);

// Get a specific record by ID
router.get('/:id', healthFitnessController.getRecordById);

// Get all records for a specific swimmer
router.get('/swimmer/:swimmerId', healthFitnessController.getRecordsBySwimmerId);

// Get records of a specific type for a swimmer
router.get('/swimmer/:swimmerId/:recordType', healthFitnessController.getSwimmerRecordsByType);

// Get the current health status summary for a swimmer
router.get('/swimmer/:swimmerId/status', healthFitnessController.getSwimmerHealthStatus);

// Create a new record
router.post('/', healthFitnessController.createRecord);

// Update an existing record
router.put('/:id', healthFitnessController.updateRecord);

// Delete a record
router.delete('/:id', healthFitnessController.deleteRecord);

module.exports = router;

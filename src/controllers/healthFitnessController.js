const healthFitnessService = require('../services/healthFitnessService');

class HealthFitnessController {
  async getAllRecords(req, res, next) {
    try {
      const records = await healthFitnessService.getAllRecords();
      console.log('records--->', records);
      
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async getRecordById(req, res, next) {
    try {
      const { id } = req.params;
      const record = await healthFitnessService.getRecordById(id);
      res.json(record);
    } catch (error) {
      next(error);
    }
  }
  
  async getRecordsBySwimmerId(req, res, next) {
    try {
      const { swimmerId } = req.params;
      const records = await healthFitnessService.getRecordsBySwimmerId(swimmerId);
      res.json(records);
    } catch (error) {
      next(error);
    }
  }
  
  async getSwimmerRecordsByType(req, res, next) {
    try {
      const { swimmerId, recordType } = req.params;
      const records = await healthFitnessService.getSwimmerRecordsByType(swimmerId, recordType);
      res.json(records);
    } catch (error) {
      next(error);
    }
  }
  
  async getRecordsByType(req, res, next) {
    try {
      const { recordType } = req.params;
      const records = await healthFitnessService.getRecordsByType(recordType);
      res.json(records);
    } catch (error) {
      next(error);
    }
  }

  async createRecord(req, res, next) {
    try {
      const recordData = req.body;
      const newRecord = await healthFitnessService.createRecord(recordData);
      res.status(201).json(newRecord);
    } catch (error) {
      next(error);
    }
  }

  async updateRecord(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedRecord = await healthFitnessService.updateRecord(id, updateData);
      res.json(updatedRecord);
    } catch (error) {
      next(error);
    }
  }

  async deleteRecord(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : 'system';
      const deletedRecord = await healthFitnessService.deleteRecord(id, userId);
      res.json(deletedRecord);
    } catch (error) {
      next(error);
    }
  }
  
  async getSwimmerHealthStatus(req, res, next) {
    try {
      const { swimmerId } = req.params;
      const healthStatus = await healthFitnessService.getSwimmerHealthStatus(swimmerId);
      res.json(healthStatus);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HealthFitnessController();

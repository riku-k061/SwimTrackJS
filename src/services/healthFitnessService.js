const { v4: uuidv4 } = require('uuid');
const fileOps = require('../utils/fileOps');
const { validateHealthFitnessRecord } = require('../models/validation/healthFitnessValidation');
const auditService = require('./auditService');

const HEALTH_FITNESS_FILE = 'data/health-fitness.json';

class HealthFitnessService {
  constructor() {
    this.initializeData();
  }

  async initializeData() {
    try {
      this.healthFitnessData = await fileOps.readData(HEALTH_FITNESS_FILE);
    } catch (error) {
      console.error('Error initializing health fitness data:', error);
      this.healthFitnessData = [];
      await fileOps.writeData(HEALTH_FITNESS_FILE, this.healthFitnessData);
    }
  }

  async getAllRecords() {
    const records= await fileOps.readData(HEALTH_FITNESS_FILE);
    return records;
  }
  
  async getRecordById(id) {
    const record = this.healthFitnessData.find(r => r.id === id);
    if (!record) {
      throw new Error(`Health fitness record with ID ${id} not found`);
    }
    return record;
  }

  async getRecordsBySwimmerId(swimmerId) {
    return this.healthFitnessData.filter(r => r.swimmerId === swimmerId);
  }

  async getRecordsByType(recordType) {
    return this.healthFitnessData.filter(r => r.recordType === recordType);
  }
  
  async getSwimmerRecordsByType(swimmerId, recordType) {
    return this.healthFitnessData.filter(
      r => r.swimmerId === swimmerId && r.recordType === recordType
    );
  }

  async createRecord(recordData) {
    // Generate ID if not provided
    const newRecord = {
      ...recordData,
      id: recordData.id || `hf-${uuidv4()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validate record
    const { error } = validateHealthFitnessRecord(newRecord);
    if (error) {
      throw new Error(`Invalid health fitness record: ${error.message}`);
    }

    // Add to data and save
    this.healthFitnessData.push(newRecord);
    await fileOps.writeData(HEALTH_FITNESS_FILE, this.healthFitnessData);
    
    return newRecord;
  }

  async updateRecord(id, updateData) {
    const index = this.healthFitnessData.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Health fitness record with ID ${id} not found`);
    }

    // Merge existing record with updates
    const updatedRecord = {
      ...this.healthFitnessData[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Validate the updated record
    const { error } = validateHealthFitnessRecord(updatedRecord);
    if (error) {
      throw new Error(`Invalid health fitness record update: ${error.message}`);
    }

    // Save the updated record
    this.healthFitnessData[index] = updatedRecord;
    await fileOps.writeData(HEALTH_FITNESS_FILE, this.healthFitnessData);
    
    return updatedRecord;
  }

  async deleteRecord(id, userId) {
    const index = this.healthFitnessData.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Health fitness record with ID ${id} not found`);
    }

    const deletedRecord = this.healthFitnessData[index];
    
    // Remove the record
    this.healthFitnessData.splice(index, 1);
    await fileOps.writeData(HEALTH_FITNESS_FILE, this.healthFitnessData);
    
    return deletedRecord;
  }
  
  async getSwimmerHealthStatus(swimmerId) {
    // Get the latest health record
    const healthRecords = await this.getSwimmerRecordsByType(swimmerId, 'health');
    const latestHealthRecord = healthRecords.sort(
      (a, b) => new Date(b.recordDate) - new Date(a.recordDate)
    )[0] || null;
    
    // Get the latest biometric record
    const biometricRecords = await this.getSwimmerRecordsByType(swimmerId, 'biometric');
    const latestBiometricRecord = biometricRecords.sort(
      (a, b) => new Date(b.recordDate) - new Date(a.recordDate)
    )[0] || null;
    
    return {
      swimmerId,
      currentHealth: latestHealthRecord ? latestHealthRecord.metrics : null,
      currentBiometrics: latestBiometricRecord ? latestBiometricRecord.metrics : null,
      lastUpdated: latestHealthRecord ? latestHealthRecord.recordDate : null
    };
  }
}

module.exports = new HealthFitnessService();

const path = require('path');
const { readData, writeData } = require('../utils/fileOps');
const { generateId } = require('../utils/idGenerator');
const { validateCoach } = require('../models/validation/coachValidation');
const { auditLog } = require('./auditService');

const COACHES_FILE = path.join(__dirname, '../../data/coaches.json');

class CoachService {
  async getAllCoaches(query = {}) {
    const data = await readData(COACHES_FILE);
    let coaches = data || [];

    // Apply any filters from query
    if (query.specialty) {
      coaches = coaches.filter(coach => 
        coach.specialties.some(s => s.toLowerCase() === query.specialty.toLowerCase()));
    }

    if (query.certification) {
      coaches = coaches.filter(coach => coach.certification === query.certification);
    }

    return coaches;
  }

  async getCoachById(id) {
    const data = await readData(COACHES_FILE);
    const coach = data.find(c => c.id === id);

    if (!coach) {
      throw new Error(`Coach with ID ${id} not found`);
    }

    return coach;
  }

  async getCoachByEmail(email) {
    const data = await readData(COACHES_FILE);
    return data.find(c => c.email.toLowerCase() === email.toLowerCase());
  }

  async createCoach(coachData) {
    // Validate coach data
    const { error } = validateCoach(coachData);
    if (error) {
      throw new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`);
    }

    const data = await readData(COACHES_FILE);
    const newId = generateId();
    const now = new Date().toISOString();

    const newCoach = {
      ...coachData,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    
    data.push(newCoach);

    await writeData(COACHES_FILE, data);

    return newCoach;
  }

  async updateCoach(id, coachData) {

    const data = await readData(COACHES_FILE);
    const index = data.findIndex(c => c.id === id);

    if (index === -1) {
      throw new Error(`Coach with ID ${id} not found`);
    }

    const updatedCoach = {
      ...data[index],
      ...coachData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    data[index] = updatedCoach;
    await writeData(COACHES_FILE, data);

    return updatedCoach;
  }

  async deleteCoach(id) {
    const data = await readData(COACHES_FILE);
    const index = data.findIndex(c => c.id === id);

    if (index === -1) {
      throw new Error(`Coach with ID ${id} not found`);
    }

    const deletedCoach = data[index];
    data.splice(index, 1);

    await writeData(COACHES_FILE, data);

    return deletedCoach;
  }
}

module.exports = new CoachService();

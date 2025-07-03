// src/services/competitionService.js
const { v4: uuidv4 } = require('uuid');
const fileOps = require('../utils/fileOps');
const auditService = require('./auditService');
const { validateCompetition, validateEvent } = require('../models/validation/competitionValidation');

const COMPETITIONS_FILE = 'data/competitions.json';

// Helper to get all competitions
const getAllCompetitions = async () => {
  const data = await fileOps.readData(COMPETITIONS_FILE);
  return data.competitions;
};

// Helper to save all competitions
const saveCompetitions = async (competitions, lastId) => {
  await fileOps.writeData(COMPETITIONS_FILE, { 
    competitions, 
    _lastId: lastId || competitions.length 
  });
};

const competitionService = {
  // Create a new competition
  create: async (competitionData) => {
    const { value, error } = validateCompetition(competitionData);
    if (error) throw error;
    
    const data = await fileOps.readData(COMPETITIONS_FILE);

    const newCompetition = {
      ...value,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.competitions.push(newCompetition);
    data._lastId += 1;
    
    await fileOps.writeData(COMPETITIONS_FILE, data);
    
    return newCompetition;
  },
  
  // Get all competitions with optional filtering
  getAll: async (filters = {}) => {
    const competitions = await getAllCompetitions();
    
    // Apply filters if provided
    if (Object.keys(filters).length === 0) {
      return competitions;
    }
    
    return competitions.filter(competition => {
      return Object.entries(filters).every(([key, value]) => {
        if (key === 'dateRange' && value.start && value.end) {
          const competitionStart = new Date(competition.startDate);
          const rangeStart = new Date(value.start);
          const rangeEnd = new Date(value.end);
          return competitionStart >= rangeStart && competitionStart <= rangeEnd;
        }
        return competition[key] === value;
      });
    });
  },
  
  // Get a competition by ID
  getById: async (id) => {
    const competitions = await getAllCompetitions();
    return competitions.find(c => c.id === id);
  },
  
  // Update a competition
  update: async (id, competitionData) => {
    const { value, error } = validateCompetition(competitionData);
    if (error) throw error;
    
    const data = await fileOps.readData(COMPETITIONS_FILE);
    const index = data.competitions.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Competition not found');
    }
    
    const updatedCompetition = {
      ...data.competitions[index],
      ...value,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    data.competitions[index] = updatedCompetition;
    
    await fileOps.writeData(COMPETITIONS_FILE, data);
    
    return updatedCompetition;
  },
  
  // Delete a competition
  delete: async (id, userId) => {
    const data = await fileOps.readData(COMPETITIONS_FILE);
    const index = data.competitions.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Competition not found');
    }
    
    const deletedCompetition = data.competitions[index];
    data.competitions.splice(index, 1);
    
    await fileOps.writeData(COMPETITIONS_FILE, data);
    
    return { success: true, id };
  },
  
  // Add an event to a competition
  addEvent: async (competitionId, eventData) => {
    const { value, error } = validateEvent(eventData);
    if (error) throw error;
    
    const data = await fileOps.readData(COMPETITIONS_FILE);
    const index = data.competitions.findIndex(c => c.id === competitionId);
    
    if (index === -1) {
      throw new Error('Competition not found');
    }
    
    const newEvent = {
      ...value,
      id: uuidv4()
    };
    
    if (!data.competitions[index].events) {
      data.competitions[index].events = [];
    }
    
    data.competitions[index].events.push(newEvent);
    data.competitions[index].updatedAt = new Date().toISOString();
    
    await fileOps.writeData(COMPETITIONS_FILE, data);
    
    return newEvent;
  },
  
  // Update an event in a competition
  updateEvent: async (competitionId, eventId, eventData) => {
    const { value, error } = validateEvent(eventData);
    if (error) throw error;
    
    const data = await fileOps.readData(COMPETITIONS_FILE);
    const competitionIndex = data.competitions.findIndex(c => c.id === competitionId);
    
    if (competitionIndex === -1) {
      throw new Error('Competition not found');
    }
    
    if (!data.competitions[competitionIndex].events) {
      throw new Error('No events found for this competition');
    }
    
    const eventIndex = data.competitions[competitionIndex].events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    const updatedEvent = {
      ...data.competitions[competitionIndex].events[eventIndex],
      ...value,
      id: eventId // Ensure ID doesn't change
    };
    
    data.competitions[competitionIndex].events[eventIndex] = updatedEvent;
    data.competitions[competitionIndex].updatedAt = new Date().toISOString();
    
    await fileOps.writeData(COMPETITIONS_FILE, data);
    
    return updatedEvent;
  },
  
  // Remove an event from a competition
  removeEvent: async (competitionId, eventId) => {
    const data = await fileOps.readData(COMPETITIONS_FILE);
    const competitionIndex = data.competitions.findIndex(c => c.id === competitionId);
    
    if (competitionIndex === -1) {
      throw new Error('Competition not found');
    }
    
    if (!data.competitions[competitionIndex].events) {
      throw new Error('No events found for this competition');
    }
    
    const eventIndex = data.competitions[competitionIndex].events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    const removedEvent = data.competitions[competitionIndex].events[eventIndex];
    data.competitions[competitionIndex].events.splice(eventIndex, 1);
    data.competitions[competitionIndex].updatedAt = new Date().toISOString();
    
    await fileOps.writeData(COMPETITIONS_FILE, data);
    
    return { success: true, id: eventId };
  }
};

module.exports = competitionService;

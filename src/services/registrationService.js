const { readData, writeData } = require('../utils/fileOps');
const { validateRegistration } = require('../models/validation/registrationValidation');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const REGISTRATIONS_FILE = path.join(__dirname, '../../data/session-registrations.json');

const registrationService = {
  // Get all registrations
  getAllRegistrations: async (query = {}) => {
    const registrations = await readData(REGISTRATIONS_FILE);
    
    // Apply filters if provided in query
    if (Object.keys(query).length === 0) {
      return registrations;
    }
    
    return registrations.filter(registration => {
      return Object.keys(query).every(key => {
        if (key === 'strokes' && Array.isArray(query[key])) {
          return query[key].some(stroke => registration.strokes.includes(stroke));
        }
        if (key === 'distances' && Array.isArray(query[key])) {
          return query[key].some(distance => registration.distances.includes(Number(distance)));
        }
        return registration[key] === query[key];
      });
    });
  },
  
  // Get registration by ID
  getRegistrationById: async (registrationId) => {
    const registrations = await readData(REGISTRATIONS_FILE);
    return (registrations.registrations || []).find(registration => registration.registrationId === registrationId);
  },
  
  // Get registrations by swimmer ID
  getRegistrationsBySwimmerId: async (swimmerId) => {
    const registrations = await readData(REGISTRATIONS_FILE);
    return (registrations.registrations || []).filter(registration => registration.swimmerId === swimmerId);
  },
  
  // Get registrations by event ID
  getRegistrationsByEventId: async (eventId) => {
    const registrations = await readData(REGISTRATIONS_FILE);
    return (registrations.registrations || []).filter(registration => registration.eventId === eventId);
  },
  
  // Create a new registration
  createRegistration: async (registrationData) => {
    const { error, value } = validateRegistration(registrationData);
    
    if (error) {
      throw new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`);
    }
    
    const registrations = await readData(REGISTRATIONS_FILE);
    
    // Check if swimmer is already registered for this event
    const existingRegistration = (registrations.registrations || []).find(r => 
      r.swimmerId === value.swimmerId && 
      r.eventId === value.eventId && 
      r.active === true
    );
    
    if (existingRegistration) {
      throw new Error('Swimmer is already registered for this event');
    }
    
    const newRegistration = {
      ...value,
      registrationId: value.registrationId || uuidv4(),
      registrationDate: value.registrationDate || new Date().toISOString()
    };
    
    // registrations.push(newRegistration);
    // await writeData(REGISTRATIONS_FILE, registrations);
    
    return newRegistration;
  },
  
  // Update a registration
  updateRegistration: async (registrationId, updateData) => {
    const registrations = await readData(REGISTRATIONS_FILE);
    const index = (registrations.registrations || []).findIndex(r => r.registrationId === registrationId);
    
    if (index === -1) {
      throw new Error('Registration not found');
    }
    
    // Don't allow changing swimmer or event
    delete updateData.swimmerId;
    delete updateData.eventId;
    delete updateData.registrationId;
    
    const updatedRegistration = {
      ...registrations[index],
      ...updateData,
      // Keep original IDs
      registrationId: registrations[index].registrationId,
      swimmerId: registrations[index].swimmerId,
      eventId: registrations[index].eventId
    };
    
    const { error, value } = validateRegistration(updatedRegistration);
    if (error) {
      throw new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`);
    }
    
    registrations[index] = value;
    // await writeData(REGISTRATIONS_FILE, registrations);
    
    return value;
  },
  
  // Cancel a registration
  cancelRegistration: async (registrationId) => {
    const registrations = await readData(REGISTRATIONS_FILE);
    const index = (registrations.registrations || []).findIndex(r => r.registrationId === registrationId);
    
    if (index === -1) {
      throw new Error('Registration not found');
    }
    
    registrations[index].active = false;
    await writeData(REGISTRATIONS_FILE, registrations);
    
    return registrations[index];
  },
  
  // Update qualification status
  updateQualificationStatus: async (registrationId, status, method, timeStandardReference = null) => {
    const validStatuses = ['qualified', 'pending', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid qualification status');
    }
    
    const registrations = await readData(REGISTRATIONS_FILE);
    const index = (registrations.registrations || []).findIndex(r => r.registrationId === registrationId);
    
    if (index === -1) {
      throw new Error('Registration not found');
    }
    
    registrations[index].qualificationStatus = status;
    
    if (method) {
      registrations[index].qualificationMethod = method;
    }
    
    if (timeStandardReference) {
      registrations[index].timeStandardReference = timeStandardReference;
    }
    
    await writeData(REGISTRATIONS_FILE, registrations);
    
    return registrations[index];
  }
};

module.exports = registrationService;

// src/services/registrationService.js
const { readData, writeData } = require('../utils/fileOps');
const { generateId } = require('../utils/idGenerator');
const { validateRegistration } = require('../models/validation/registrationValidation');
const { getSessionById } = require('./trainingSessionService');
const { getSwimmerById } = require('./swimmerService');

const REGISTRATIONS_FILE = 'data/session-registrations.json';

const getAllRegistrations = async () => {
  const data = await readData(REGISTRATIONS_FILE);
  return data.registrations || [];
};

const getRegistrationById = async (id) => {
  const registrations = await getAllRegistrations();
  return registrations.find(reg => reg.id === id);
};

const getRegistrationsBySwimmer = async (swimmerId) => {
  const registrations = await getAllRegistrations();
  return registrations.filter(reg => reg.swimmerId === swimmerId);
};

const getRegistrationsBySession = async (sessionId) => {
  const registrations = await getAllRegistrations();
  return registrations.filter(reg => reg.sessionId === sessionId);
};

const createRegistration = async (registration) => {
  const { error, value } = validateRegistration(registration);
  if (error) throw new Error(`Invalid registration data: ${error.message}`);
  
  const swimmer = await getSwimmerById(value.swimmerId);
  if (!swimmer) throw new Error(`Swimmer ${value.swimmerId} not found`);
  
  const session = await getSessionById(value.sessionId);
  if (!session) throw new Error(`Session ${value.sessionId} not found`);
  
  const sessionRegistrations = await getRegistrationsBySession(value.sessionId);
  const confirmedRegistrations = sessionRegistrations.filter(reg => reg.status === 'confirmed');
  
  const newRegistration = {
    ...value,
    id: value.id || await generateId()
  };
  
  if (confirmedRegistrations.length >= session.capacity) {
    newRegistration.status = 'waitlisted';
  }
  
  const registrations = await getAllRegistrations();
  const data = { registrations: [...registrations, newRegistration] };
  await writeData(REGISTRATIONS_FILE, data);
  
  return newRegistration;
};

const updateRegistration = async (id, updates) => {
  const registration = await getRegistrationById(id);
  if (!registration) throw new Error(`Registration ${id} not found`);
  
  const updatedRegistration = { ...registration, ...updates };
  
  const { error, value } = validateRegistration(updatedRegistration);
  if (error) throw new Error(`Invalid registration data: ${error.message}`);
  
  const registrations = await getAllRegistrations();
  const updatedRegistrations = registrations.map(reg => 
    reg.id === id ? updatedRegistration : reg
  );
  
  const data = { registrations: updatedRegistrations };
  await writeData(REGISTRATIONS_FILE, data);
  
  return updatedRegistration;
};

const deleteRegistration = async (id) => {
  const registration = await getRegistrationById(id);
  if (!registration) throw new Error(`Registration ${id} not found`);
  
  const registrations = await getAllRegistrations();
  const updatedRegistrations = registrations.filter(reg => reg.id !== id);
  
  const data = { registrations: updatedRegistrations };
  await writeData(REGISTRATIONS_FILE, data);
  
  return registration;
};

module.exports = {
  getAllRegistrations,
  getRegistrationById,
  getRegistrationsBySwimmer,
  getRegistrationsBySession,
  createRegistration,
  updateRegistration,
  deleteRegistration
};

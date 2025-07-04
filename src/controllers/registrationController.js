// src/controllers/registrationController.js
const registrationService = require('../services/registrationService');

const getAllRegistrations = async (req, res, next) => {
  try {
    const registrations = await registrationService.getAllRegistrations();
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

const getRegistrationById = async (req, res, next) => {
  try {
    const registration = await registrationService.getRegistrationById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json(registration);
  } catch (error) {
    next(error);
  }
};

const getRegistrationsBySwimmer = async (req, res, next) => {
  try {
    const registrations = await registrationService.getRegistrationsBySwimmer(req.params.swimmerId);
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

const getRegistrationsBySession = async (req, res, next) => {
  try {
    const registrations = await registrationService.getRegistrationsBySession(req.params.sessionId);
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

const createRegistration = async (req, res, next) => {
  try {
    const registration = await registrationService.createRegistration(req.body);
    
    res.status(201).json(registration);
  } catch (error) {
    next(error);
  }
};

const updateRegistration = async (req, res, next) => {
  try {
    const registration = await registrationService.updateRegistration(req.params.id, req.body);
    
    res.json(registration);
  } catch (error) {
    next(error);
  }
};

const deleteRegistration = async (req, res, next) => {
  try {
    const registration = await registrationService.deleteRegistration(req.params.id);

    res.json({ message: 'Registration deleted successfully', registration });
  } catch (error) {
    next(error);
  }
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

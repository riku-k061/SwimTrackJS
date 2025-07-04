const Joi = require('joi');
const { readData } = require('../../utils/fileOps');
const path = require('path');

const COACHES_FILE = path.join(__dirname, '../../../data/coaches.json');

// Helper function to check if coach exists
const coachExists = async (coachId) => {
  try {
    const coaches = await readData(COACHES_FILE);
    return coaches.some(coach => coach.id === coachId);
  } catch (error) {
    console.error('Error checking coach existence:', error);
    return false;
  }
};

// Base schema without async validations
const trainingSessionSchema = Joi.object({
  title: Joi.string().min(3).max(100).required()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title must be less than 100 characters',
      'any.required': 'Title is required'
    }),
  
  coachId: Joi.string().required()
    .messages({
      'any.required': 'Coach ID is required'
    }),
  
  date: Joi.date().iso().required()
    .messages({
      'date.base': 'Date must be a valid date',
      'date.format': 'Date must be in ISO format (YYYY-MM-DD)',
      'any.required': 'Date is required'
    }),
  
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
    .messages({
      'string.pattern.base': 'Start time must be in HH:MM 24-hour format',
      'any.required': 'Start time is required'
    }),
  
  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
    .messages({
      'string.pattern.base': 'End time must be in HH:MM 24-hour format',
      'any.required': 'End time is required'
    }),
  
  poolLocation: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Pool location must be at least 2 characters',
      'string.max': 'Pool location must be less than 100 characters',
      'any.required': 'Pool location is required'
    }),
  
  sessionType: Joi.string().valid('endurance', 'sprint', 'technique', 'recovery', 'competition', 'mixed').required()
    .messages({
      'any.only': 'Session type must be one of: endurance, sprint, technique, recovery, competition, mixed',
      'any.required': 'Session type is required'
    }),
  
  description: Joi.string().max(500)
    .messages({
      'string.max': 'Description must be less than 500 characters'
    }),
  
  capacity: Joi.number().integer().min(1).max(100).required()
    .messages({
      'number.base': 'Capacity must be a number',
      'number.min': 'Capacity must be at least 1',
      'number.max': 'Capacity must be no more than 100',
      'any.required': 'Capacity is required'
    }),
  
  attendees: Joi.array().items(Joi.string()).default([])
    .messages({
      'array.base': 'Attendees must be an array of swimmer IDs'
    }),
  
  notes: Joi.string().max(1000)
    .messages({
      'string.max': 'Notes must be less than 1000 characters'
    }),
  
  status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'cancelled').default('scheduled')
    .messages({
      'any.only': 'Status must be one of: scheduled, in_progress, completed, cancelled'
    })
});

// Async validation function for coachId
const validateCoachId = async (trainingSession) => {
  const { error } = trainingSessionSchema.validate(trainingSession);
  
  if (error) {
    throw new Error(error.details[0].message);
  }
  
  // Additional validation for coachId
  if (!(await coachExists(trainingSession.coachId))) {
    throw new Error(`Coach with ID ${trainingSession.coachId} does not exist`);
  }
  
  // Time validation - ensure end time is after start time
  const startParts = trainingSession.startTime.split(':');
  const endParts = trainingSession.endTime.split(':');
  
  const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
  const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
  
  if (endMinutes <= startMinutes) {
    throw new Error('End time must be after start time');
  }
  
  return trainingSession;
};

module.exports = {
  trainingSessionSchema,
  validateCoachId
};

// src/models/validation/competitionValidation.js
const Joi = require('joi');

const eventSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().required(),
  ageGroup: Joi.string().required(),
  gender: Joi.string().valid('male', 'female', 'mixed').required(),
  date: Joi.date().iso().required(),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').default('scheduled')
});

const competitionSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  location: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  registrationDeadline: Joi.date().iso().less(Joi.ref('startDate')).required(),
  ageGroups: Joi.array().items(Joi.string()).min(1).required(),
  events: Joi.array().items(eventSchema).optional().default([]),
  status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').default('upcoming'),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional()
});

module.exports = {
  validateCompetition: (competition) => competitionSchema.validate(competition),
  validateEvent: (event) => eventSchema.validate(event)
};

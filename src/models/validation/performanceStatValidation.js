// src/models/validation/performanceStatValidation.js
const Joi = require('joi');

const performanceStatSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  swimmerId: Joi.string().uuid().required(),
  date: Joi.date().iso().required(),
  
  // Event details
  stroke: Joi.string().valid('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'individual medley').required(),
  distance: Joi.number().positive().required(),
  courseType: Joi.string().valid('long course', 'short course').required(),
  
  // Time data (stored in milliseconds for precision)
  time: Joi.number().integer().min(0).required(),
  
  // Split times (array of lap times in milliseconds)
  splits: Joi.array().items(Joi.number().integer().min(0)).optional(),
  
  // Technical metrics
  strokeRate: Joi.number().min(0).optional(),
  strokeCount: Joi.number().integer().min(0).optional(),
  turnTime: Joi.number().min(0).optional(),
  startReactionTime: Joi.number().min(0).optional(),
  
  // Context data
  isCompetition: Joi.boolean().default(false),
  competitionId: Joi.string().uuid().optional(),
  venue: Joi.string().optional(),
  
  // Notes
  notes: Joi.string().optional(),
  
  // Metadata
  createdAt: Joi.date().iso().default(() => new Date().toISOString()),
  updatedAt: Joi.date().iso().default(() => new Date().toISOString())
});

module.exports = {
  performanceStatSchema
};

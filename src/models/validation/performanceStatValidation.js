const Joi = require('joi');

const performanceStatSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  swimmerId: Joi.string().pattern(/^swimmer-[0-9]{3}$/).required(),
  date: Joi.date().iso().optional(),
  
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
  
  // Status (root level status)
  status: Joi.string().valid('registered', 'checked-in', 'withdrawn', 'completed').default('registered'),

  // Events: The events are supposed to be within the stat object.
  events: Joi.array().items(
    Joi.object({
      eventId: Joi.string().required(),
      seedTime: Joi.string().pattern(/^[0-9]{2}:[0-5][0-9]\.[0-9]{2}$/).optional(),
      status: Joi.string().valid('registered', 'checked-in', 'scratched', 'completed', 'disqualified').default('registered')
    })
  ).optional(),
  
  // Metadata
  createdAt: Joi.date().iso().default(() => new Date().toISOString()),
  updatedAt: Joi.date().iso().default(() => new Date().toISOString())
});

module.exports = {
  performanceStatSchema
};

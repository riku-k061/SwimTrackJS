const Joi = require('joi');

const registrationSchema = Joi.object({
  registrationId: Joi.string().optional(),
  swimmerId: Joi.string().required(),
  eventId: Joi.string().required(),
  registrationDate: Joi.date().iso().default(() => new Date().toISOString()),
  eventCategory: Joi.string().required(),
  strokes: Joi.array().items(Joi.string().valid('freestyle', 'backstroke', 'breaststroke', 'butterfly', 'medley')).min(1).required(),
  distances: Joi.array().items(Joi.number().positive()).min(1).required(),
  qualificationStatus: Joi.string().valid('qualified', 'pending', 'rejected').default('pending'),
  qualificationMethod: Joi.string().valid('time-standard', 'coach-selection', 'wildcard').optional(),
  seedTime: Joi.number().positive().allow(null).default(null),
  timeStandardReference: Joi.string().allow(null).default(null),
  notes: Joi.string().allow('').default(''),
  paymentStatus: Joi.string().valid('paid', 'pending', 'waived').default('pending'),
  registeredBy: Joi.string().required(),
  lane: Joi.number().integer().min(1).allow(null).default(null),
  heat: Joi.number().integer().min(1).allow(null).default(null),
  active: Joi.boolean().default(true)
});

const validateRegistration = (data) => {
  return registrationSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateRegistration
};

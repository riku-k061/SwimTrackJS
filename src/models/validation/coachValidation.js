const Joi = require('joi');

const coachSchema = Joi.object({
  id: Joi.string().pattern(/^coach-\d{3}$/).optional(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\d{3}-\d{3}-\d{4}$/).optional(),
  certification: Joi.string().valid('Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5').required(),
  specialties: Joi.array().items(Joi.string()).min(1).required(),
  yearsOfExperience: Joi.number().integer().min(0).required(),
  bio: Joi.string().max(500).optional(),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional()
});

const validateCoach = (coach) => {
  return coachSchema.validate(coach, { abortEarly: false });
};

module.exports = {
  validateCoach
};
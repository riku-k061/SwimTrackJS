// src/models/validation/registrationValidation.js
const Joi = require('joi');

const registrationSchema = Joi.object({
  id: Joi.string().guid(),
  swimmerId: Joi.string().pattern(/^swimmer-[0-9]{3}$/).required(),
  sessionId: Joi.string().pattern(/^ts-[0-9]{6}$/).required(),
  registrationDate: Joi.date().iso().default(() => new Date().toISOString()),
  status: Joi.string().valid('confirmed', 'waitlisted', 'canceled').default('confirmed'),
  paymentStatus: Joi.string().valid('paid', 'unpaid').default('unpaid'),
  attendanceStatus: Joi.string().valid('pending', 'attended', 'absent', 'excused').default('pending'),
  notes: Joi.string().allow('').max(500).optional()
});

module.exports = {
  validateRegistration: (registration) => registrationSchema.validate(registration)
};

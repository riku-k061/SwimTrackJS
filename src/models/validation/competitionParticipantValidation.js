// src/models/validation/competitionParticipantValidation.js
const Joi = require('joi');

const participantEventSchema = Joi.object({
  eventId: Joi.string().required(),
  seedTime: Joi.string().pattern(/^[0-9]{2}:[0-5][0-9]\.[0-9]{2}$/).optional(),
  status: Joi.string().valid('registered', 'checked-in', 'scratched', 'completed', 'disqualified').default('registered')
});

const participantSchema = Joi.object({
  id: Joi.string().optional(),
  competitionId: Joi.string().required(),
  swimmerId: Joi.string().required(),
  registrationDate: Joi.date().iso().default(Date.now),
  events: Joi.array().items(participantEventSchema).min(1).required(),
  status: Joi.string().valid('registered', 'checked-in', 'withdrawn', 'completed').default('registered'),
  paymentStatus: Joi.string().valid('pending', 'paid', 'waived').default('pending'),
  notes: Joi.string().allow('').optional(),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional()
});

module.exports = {
  validateParticipant: (participant) => participantSchema.validate(participant),
  validateParticipantEvent: (event) => participantEventSchema.validate(event)
};

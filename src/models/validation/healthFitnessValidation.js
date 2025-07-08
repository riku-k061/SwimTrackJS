const Joi = require('joi');

// Base schema for all health and fitness records
const baseHealthFitnessSchema = Joi.object({
  id: Joi.string(),
  swimmerId: Joi.string().required(),
  recordDate: Joi.date().iso().required(),
  recordType: Joi.string().valid('biometric', 'fitness', 'wellness', 'health').required(),
  notes: Joi.string().allow(''),
  recordedBy: Joi.string().required(),
  createdAt: Joi.date().iso(),
  updatedAt: Joi.date().iso()
});

// Specific validation schemas for each record type
const biometricSchema = baseHealthFitnessSchema.keys({
  metrics: Joi.object({
    height: Joi.number().min(0),
    weight: Joi.number().min(0),
    bodyFat: Joi.number().min(0).max(100),
    restingHeartRate: Joi.number().min(0),
    wingspan: Joi.number().min(0),
    bloodPressure: Joi.string().pattern(/^\d{2,3}\/\d{2,3}$/).allow(null)
  }).min(1).required()
});

const fitnessSchema = baseHealthFitnessSchema.keys({
  metrics: Joi.object({
    benchPress: Joi.number().min(0),
    squats: Joi.number().min(0),
    pullUps: Joi.number().min(0),
    corePlank: Joi.number().min(0),
    flexibility: Joi.object().pattern(/^/, Joi.number()),
    endurance: Joi.object().pattern(/^/, Joi.number())
  }).min(1).required()
});

const wellnessSchema = baseHealthFitnessSchema.keys({
  metrics: Joi.object({
    sleepHours: Joi.number().min(0).max(24),
    sleepQuality: Joi.number().min(1).max(10),
    stressLevel: Joi.number().min(1).max(10),
    fatigue: Joi.number().min(1).max(10),
    mood: Joi.number().min(1).max(10),
    hydration: Joi.number().min(1).max(10),
    nutrition: Joi.number().min(1).max(10)
  }).min(1).required()
});

const healthSchema = baseHealthFitnessSchema.keys({
  metrics: Joi.object({
    injury: Joi.string().allow(null),
    illness: Joi.string().allow(null),
    treatment: Joi.string().allow(null),
    status: Joi.string().valid('active', 'recovering', 'resolved').allow(null),
    expectedRecovery: Joi.date().iso().allow(null),
    restrictions: Joi.array().items(Joi.string()).allow(null)
  }).min(1).required()
});

// Validate based on record type
const validateHealthFitnessRecord = (record) => {
  switch (record.recordType) {
    case 'biometric':
      return biometricSchema.validate(record);
    case 'fitness':
      return fitnessSchema.validate(record);
    case 'wellness':
      return wellnessSchema.validate(record);
    case 'health':
      return healthSchema.validate(record);
    default:
      return { error: { message: 'Invalid record type' } };
  }
};

module.exports = {
  validateHealthFitnessRecord,
  biometricSchema,
  fitnessSchema,
  wellnessSchema,
  healthSchema
};

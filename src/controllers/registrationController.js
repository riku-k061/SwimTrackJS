const registrationService = require('../services/registrationService');
const auditService = require('../services/auditService');

const registrationController = {
  getAllRegistrations: async (req, res, next) => {
    try {
      const registrations = await registrationService.getAllRegistrations(req.query);
      res.json(registrations);
    } catch (error) {
      next(error);
    }
  },
  
  getRegistrationById: async (req, res, next) => {
    try {
      const registration = await registrationService.getRegistrationById(req.params.id);
      if (!registration) {
        return res.status(404).json({ message: 'Registration not found' });
      }
      res.json(registration);
    } catch (error) {
      next(error);
    }
  },
  
  getRegistrationsBySwimmerId: async (req, res, next) => {
    try {
      const registrations = await registrationService.getRegistrationsBySwimmerId(req.params.swimmerId);
      res.json(registrations);
    } catch (error) {
      next(error);
    }
  },
  
  getRegistrationsByEventId: async (req, res, next) => {
    try {
      const registrations = await registrationService.getRegistrationsByEventId(req.params.eventId);
      res.json(registrations);
    } catch (error) {
      next(error);
    }
  },
  
  createRegistration: async (req, res, next) => {
    try {
      const newRegistration = await registrationService.createRegistration(req.body);
      
      res.status(201).json(newRegistration);
    } catch (error) {
      next(error);
    }
  },
  
  updateRegistration: async (req, res, next) => {
    try {
      const updatedRegistration = await registrationService.updateRegistration(req.params.id, req.body);
      
      // Log the action
      await auditService.logAction({
        actionType: 'UPDATE',
        entityType: 'registration',
        entityId: updatedRegistration.registrationId,
        userId: req.body.registeredBy || 'system',
        details: `Registration updated for ${updatedRegistration.registrationId}`
      });
      
      res.json(updatedRegistration);
    } catch (error) {
      next(error);
    }
  },
  
  cancelRegistration: async (req, res, next) => {
    try {
      const registration = await registrationService.cancelRegistration(req.params.id);
      
      // Log the action
      await auditService.logAction({
        actionType: 'CANCEL',
        entityType: 'registration',
        entityId: registration.registrationId,
        userId: req.body.userId || 'system',
        details: `Registration canceled for swimmer ${registration.swimmerId} in event ${registration.eventId}`
      });
      
      res.json(registration);
    } catch (error) {
      next(error);
    }
  },
  
  updateQualificationStatus: async (req, res, next) => {
    try {
      const { status, method, timeStandardReference } = req.body;
      const registration = await registrationService.updateQualificationStatus(
        req.params.id, 
        status, 
        method, 
        timeStandardReference
      );
      
      // Log the action
      await auditService.logAction({
        actionType: 'UPDATE_QUALIFICATION',
        entityType: 'registration',
        entityId: registration.registrationId,
        userId: req.body.userId || 'system',
        details: `Qualification status updated to ${status} for registration ${registration.registrationId}`
      });
      
      res.json(registration);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = registrationController;
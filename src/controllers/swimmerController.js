// src/controllers/swimmerController.js

const swimmerService = require('../services/swimmerService');
const { createResourceController } = require('./controllerFactory');

const generic = createResourceController(swimmerService);

module.exports = {
  createSwimmer: generic.create,
  getSwimmers: generic.getAll,
  getSwimmerById: generic.getById,
  updateSwimmer: generic.update,
  deleteSwimmer: async (req, res, next) => {
    try {
      const preview = req.query.preview === 'true';
      if (preview) {
        const impact = await swimmerService.getDeleteImpact(req.params.id);
        if (!impact.entityExists) return res.status(404).json({ message: 'Swimmer not found' });
        return res.json(impact);
      }
      await generic.delete(req, res, next);
    } catch (e) {
      next(e);
    }
  },
  assignCoach: async (req, res, next) => {
    try {
      const { coachId } = req.body;
      const swimmer = await swimmerService.getById(req.params.id);
      if (!swimmer) return res.status(404).json({ message: 'Swimmer not found' });

      const updatedSwimmer = await swimmerService.assignCoach(req.params.id, coachId);
      res.json(updatedSwimmer);
    } catch (e) {
      next(e);
    }
  },
  unassignCoach: async (req, res, next) => {
    try {
      const swimmer = await swimmerService.getById(req.params.id);
      if (!swimmer) return res.status(404).json({ message: 'Swimmer not found' });

      const updatedSwimmer = await swimmerService.unassignCoach(req.params.id);
      res.json(updatedSwimmer);
    } catch (e) {
      next(e);
    }
  },
  getDeleteImpact: async (req, res, next) => {
    try {
      const impact = await swimmerService.getDeleteImpact(req.params.id);
      if (!impact.entityExists) return res.status(404).json({ message:'Swimmer not found' });
      res.json(impact);
    } catch (e) { next(e); }
  },
  getSwimmersByClub: async (req, res, next) => {
    try {
      const xs = await swimmerService.getSwimmersByClub(req.params.clubId);
      res.json(xs);
    } catch (e) { next(e); }
  },
  getSwimmersByAgeRange: async (req, res, next) => {
    try {
      const { minAge, maxAge } = req.params;
      const xs = await swimmerService.getSwimmersByAgeRange(minAge, maxAge);
      res.json(xs);
    } catch (e) { next(e); }
  }
};


// src/controllers/controllerFactory.js

const { createError, errorTypes } = require('../utils/logger');

const createResourceController = service => ({
  create: async (req, res, next) => {
    try {
      const entity = await service.create(req.body, req.user?.id);
      res.status(201).json(entity);
    } catch (e) {
      next(e);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const result = await service.getAll(req.query);
      if (result.metadata) {
        res.set({
          'X-Total-Count': result.metadata.total,
          'X-Total-Pages': result.metadata.pages,
          'X-Current-Page': result.metadata.page,
          'X-Page-Size': result.metadata.limit
        });
        res.json(result.data);
      } else {
        res.json(result.data || result);
      }
    } catch (e) { next(e); }
  },

  getById: async (req, res, next) => {
    try {
      const ent = await service.getById(req.params.id);
      if (!ent) throw createError(`${req.resourceType.slice(0,-1)} not found`, errorTypes.NOT_FOUND_ERROR, 404);
      res.json(ent);
    } catch (e) { next(e); }
  },

  update: async (req, res, next) => {
    try {
      const ent = await service.update(req.params.id, req.body, req.user?.id);
      if (!ent) throw createError(`${req.resourceType.slice(0,-1)} not found`, errorTypes.NOT_FOUND_ERROR, 404);
      res.json(ent);
    } catch (e) { next(e); }
  },

  delete: async (req, res, next) => {
    try {
      const ok = await service.delete(req.params.id, req.user?.id);
      if (!ok) throw createError(`${req.resourceType.slice(0,-1)} not found`, errorTypes.NOT_FOUND_ERROR, 404);
      res.status(204).end();
    } catch (e) { next(e); }
  }
});

module.exports = { createResourceController };

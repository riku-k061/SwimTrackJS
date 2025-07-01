// src/services/serviceFactory.

const db = require('../db');
const { executeTransaction } = require('../utils/transactionManager');
const auditService = require('./auditService');
const { createError, errorTypes } = require('../utils/logger');

const createResourceService = (entityType, validateEntity) => {
  const cap = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  const singular = entityType.endsWith('s') ? entityType.slice(0, -1) : entityType;

  return {
    create: async (data, userId) => {
      const errs = await validateEntity(data);
      if (errs.length) throw createError('Validation failed', errorTypes.VALIDATION_ERROR, 400, errs);
      try {
        const [entity] = await executeTransaction([
          async () => {
            const e = await db.createEntity(entityType, data);
            return { result: e, rollback: async () => db.deleteEntity(entityType, e.id) };
          },
          async () => auditService.logAudit({
            action: `CREATE_${cap.toUpperCase()}`,
            entityType,
            entityId: null,
            userId: userId || 'system',
            diff: { added: data }
          })
        ]);
        return entity;
      } catch (e) {
        if (e.code === 'ENOENT') throw createError(`DB error creating ${singular}`, errorTypes.DATABASE_ERROR, 500, e.message);
        throw e;
      }
    },

    getAll: async filters => db.getEntities(entityType),

    getById: id => db.getEntityById(entityType, id),

    update: async (id, data, userId) => {
      const orig = await db.getEntityById(entityType, id);
      if (!orig) throw createError(`${singular} not found`, errorTypes.NOT_FOUND_ERROR, 404);
      // Merge original + incoming data for full validation
      const merged = { ...orig, ...data, id };
      const errs = await validateEntity(merged, true);
      if (errs.length) throw createError('Validation failed', errorTypes.VALIDATION_ERROR, 400, errs);
      const diff = auditService.generateDiff(orig, { ...orig, ...data });
      const [updated] = await executeTransaction([
        async () => {
          const u = await db.updateEntity(entityType, id, data);
          return { result: u, rollback: async () => db.updateEntity(entityType, id, orig) };
        },
        async () => auditService.logAudit({
          action: `UPDATE_${cap.toUpperCase()}`,
          entityType,
          entityId: id,
          userId: userId || 'system',
          diff
        })
      ]);
      return updated;
    },

    delete: async (id, userId) => {
      const orig = await db.getEntityById(entityType, id);
      if (!orig) return false;
      const [success] = await executeTransaction([
        async () => {
          const ok = await db.deleteEntity(entityType, id);
          return { result: ok, rollback: async () => db.createEntity(entityType, { ...orig, id }) };
        },
        async () => auditService.logAudit({
          action: `DELETE_${cap.toUpperCase()}`,
          entityType,
          entityId: id,
          userId: userId || 'system',
          diff: { deleted: orig }
        })
      ]);
      return success;
    }
  };
};

module.exports = { createResourceService };
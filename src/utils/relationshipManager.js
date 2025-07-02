// src/utils/relationshipManager.js

const db = require('../db');
const { executeTransaction } = require('./transactionManager');

const RELS = {
  swimmers: [
    { relatedEntity:'sessionsRegistrations', foreignKey:'swimmerId', onDelete:'cascade' },
    { relatedEntity:'sessionLogs', foreignKey:'swimmerId', onDelete:'cascade' },
    { relatedEntity:'competitionResults', foreignKey:'swimmerId', onDelete:'cascade' },
    { relatedEntity:'payments', foreignKey:'swimmerId', onDelete:'cascade' }
  ]
};

const getRelationships = et => RELS[et]||[];

const findRelatedEntities = async (et, id) => {
  const rels = getRelationships(et);
  const found = [];
  for (const { relatedEntity, foreignKey, onDelete } of rels) {
    const all = await db.getEntities(relatedEntity);
    const matches = all.filter(x=>x[foreignKey]===id);
    if (matches.length) found.push({ relatedEntity, foreignKey, onDelete, entities:matches });
  }
  return found;
};

const deleteWithRelationships = async (et, id, userId) => {
  const orig = await db.getEntityById(et, id);
  if (!orig) return { success:false, message:'not found' };
  const { operations, constraints } = await (async () => {
    const ops = []; const cons = [];
    const rels = await findRelatedEntities(et,id);
    for (const r of rels) {
      if (r.onDelete==='restrict' && r.entities.length) {
        cons.push({ check:true, message:`Cannot delete: referenced by ${r.entities.length} ${r.relatedEntity}` });
      }
      if (r.onDelete==='cascade') {
        for (const ent of r.entities) {
          ops.push(async () => {
            const ok = await db.deleteEntity(r.relatedEntity, ent.id);
            return { result:ok, rollback: async ()=> db.createEntity(r.relatedEntity, ent) };
          });
          ops.push(async () => require('../services/auditService').logAudit({
            action:`CASCADE_DELETE_${r.relatedEntity.toUpperCase()}`,
            entityType:r.relatedEntity,
            entityId:ent.id,
            parentEntityType:et,
            parentEntityId:id,
            userId,
            diff:{ deleted:ent }
          }));
        }
      }
      // nullify handling omitted for brevity...
    }
    return { operations:ops, constraints:cons };
  })();

  if (constraints.length) return { success:false, message:constraints[0].message };

  try {
    const mainOp = async () => {
      const ok = await db.deleteEntity(et, id);
      return { result:ok, rollback: async ()=> db.createEntity(et, orig) };
    };
    const auditOp = async () => require('../services/auditService').logAudit({
      action:`DELETE_${et.toUpperCase()}`,
      entityType:et,
      entityId:id,
      userId,
      diff:{ deleted:orig }
    });
    const results = await executeTransaction([mainOp, auditOp, ...operations]);
    return { success:results[0], affected: operations.length/2 };
  } catch (e) {
    return { success:false, message:'error during cascade', error:e.message };
  }
};

module.exports = { getRelationships, findRelatedEntities, deleteWithRelationships };

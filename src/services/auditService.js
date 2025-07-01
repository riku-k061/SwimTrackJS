// src/services/auditService.js

const path = require('path');
const { atomicUpdate } = require('../utils/fileOps');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '../../data');
const generateDiff = (oldObj, newObj) => {
  const diff = { added:{}, modified:{}, deleted:{} };
  for (const k in newObj) {
    if (!(k in oldObj)) diff.added[k] = newObj[k];
    else if (JSON.stringify(oldObj[k])!==JSON.stringify(newObj[k])) {
      diff.modified[k] = { from: oldObj[k], to: newObj[k] };
    }
  }
  for (const k in oldObj) if (!(k in newObj)) diff.deleted[k] = oldObj[k];
  return diff;
};

const logAudit = async auditData => {
  const filePath = path.join(dataDir,'audit.json');
  const entry = { id:uuidv4(), timestamp:new Date().toISOString(), ...auditData };
  const updated = await atomicUpdate(filePath, log => { log.push(entry); return log; }, []);
  const rollback = async () => {
    await atomicUpdate(filePath, log => log.filter(e=>e.id!==entry.id), []);
  };
  return { result: entry, rollback };
};

module.exports = { generateDiff, logAudit };

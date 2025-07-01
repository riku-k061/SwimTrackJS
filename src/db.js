// src/db.js

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { readData, writeData, atomicUpdate } = require('./utils/fileOps');

const dataDir = path.join(__dirname, '../data');
const getFilePath = entityType => path.join(dataDir, `${entityType}.json`);

const initializeDb = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  console.log('Database initialized successfully');
};

const getEntities = async entityType => {
  const data = await readData(getFilePath(entityType));
  return data || [];
};

const getEntityById = (entityType, id) =>
  getEntities(entityType).then(arr => arr.find(e => e.id === id) || null);

const createEntity = async (entityType, data) =>
  atomicUpdate(getFilePath(entityType), (entities = []) => {
    const newEntity = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    entities.push(newEntity);
    return entities;
  }, []).then(list => list[list.length - 1]);

const updateEntity = async (entityType, id, data) =>
  atomicUpdate(getFilePath(entityType), (entities = []) => {
    const i = entities.findIndex(e => e.id === id);
    if (i === -1) return entities;
    entities[i] = { ...entities[i], ...data, updatedAt: new Date().toISOString() };
    return entities;
  }, []).then(list => list.find(e => e.id === id) || null);

const deleteEntity = async (entityType, id) =>
  atomicUpdate(getFilePath(entityType), (entities = []) =>
    entities.filter(e => e.id !== id)
  , []).then(() => true);

const addRelationship = async (entityType, id, relType, relId) => {
  return atomicUpdate(getFilePath(entityType), (entities = []) => {
    const entity = entities.find(e => e.id === id);
    if (!entity) return entities;
    entity[relType] = entity[relType] || [];
    if (!entity[relType].includes(relId)) entity[relType].push(relId);
    return entities;
  }, []).then(list => list.find(e => e.id === id) || null);
};

const removeRelationship = async (entityType, id, relType, relId) => {
  return atomicUpdate(getFilePath(entityType), (entities = []) => {
    const entity = entities.find(e => e.id === id);
    if (entity && entity[relType]) {
      entity[relType] = entity[relType].filter(r => r !== relId);
    }
    return entities;
  }, []).then(list => list.find(e => e.id === id) || null);
};

module.exports = {
  initializeDb,
  getEntities,
  getEntityById,
  createEntity,
  updateEntity,
  deleteEntity,
  addRelationship,
  removeRelationship
};

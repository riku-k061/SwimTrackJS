const fs = require('fs').promises;
const path = require('path');

const writeQueues = new Map();

const readData = async filePath => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
};

const writeData = async (filePath, data) => {
  if (!writeQueues.has(filePath)) writeQueues.set(filePath, Promise.resolve());
  const q = writeQueues.get(filePath).then(async () => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  });
  writeQueues.set(filePath, q);
  return q;
};

const atomicUpdate = async (filePath, updateFn, defaultValue = []) => {
  if (!writeQueues.has(filePath)) writeQueues.set(filePath, Promise.resolve());
  const q = writeQueues.get(filePath).then(async () => {
    let current = await readData(filePath);
    if (current === null) current = defaultValue;
    const updated = updateFn(current);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  });
  writeQueues.set(filePath, q);
  return q;
};

module.exports = { readData, writeData, atomicUpdate };

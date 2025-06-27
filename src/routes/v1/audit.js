const express = require('express');
const path = require('path');
const { readData } = require('../../utils/fileOps');

const router = express.Router();
const dataDir = path.join(__dirname, '../../../data');

router.get('/', async (req, res, next) => {
  try {
    const filePath = path.join(dataDir, 'audit.json');
    let logs = await readData(filePath) || [];
    const { entityType, entityId, action, userId, startDate, endDate } = req.query;

    if (entityType) logs = logs.filter(l => l.entityType === entityType);
    if (entityId) logs = logs.filter(l => l.entityId === entityId);
    if (action) logs = logs.filter(l => l.action === action);
    if (userId) logs = logs.filter(l => l.userId === userId);
    if (startDate) logs = logs.filter(l => l.timestamp >= new Date(startDate).toISOString());
    if (endDate) logs = logs.filter(l => l.timestamp <= new Date(endDate).toISOString());

    res.json(logs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

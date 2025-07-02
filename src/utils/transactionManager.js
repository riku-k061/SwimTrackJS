// src/utils/transactionManager.js

const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const transactionsDir = path.join(__dirname, '../../data/transactions');
const transactionLogs = new Map();

const getLogPath = id => path.join(transactionsDir, `tx-${id}.json`);

const saveLog = async id => {
  const log = transactionLogs.get(id);
  await fs.mkdir(transactionsDir, { recursive: true });
  await fs.writeFile(getLogPath(id), JSON.stringify(log, null, 2));
};

const recoverInterrupted = async () => {
  const files = (await fs.readdir(transactionsDir).catch(()=>[]))
    .filter(f => f.startsWith('tx-'));
  for (const f of files) {
    const full = path.join(transactionsDir, f);
    const data = JSON.parse(await fs.readFile(full, 'utf8'));
    if (['started','rolling_back'].includes(data.status)) {
      data.status = 'failed_on_restart';
      data.endTime = Date.now();
      await fs.writeFile(full, JSON.stringify(data, null, 2));
    } else {
      await fs.unlink(full);
    }
  }
};

const initializeTransactions = async () => {
  await fs.mkdir(transactionsDir, { recursive: true });
  await recoverInterrupted();
};

const executeTransaction = async operations => {
  const txId = uuidv4();
  transactionLogs.set(txId, {
    id: txId,
    status: 'started',
    startTime: Date.now(),
    completedOperations: 0,
    rollbacks: 0
  });
  await saveLog(txId);

  const rollbacks = [];
  const results = [];
  try {
    for (let i = 0; i < operations.length; i++) {
      const { result, rollback } = await operations[i]();
      results.push(result);
      rollbacks.unshift(rollback);
      const log = transactionLogs.get(txId);
      log.completedOperations = i + 1;
      await saveLog(txId);
    }
    const log = transactionLogs.get(txId);
    log.status = 'completed';
    log.endTime = Date.now();
    await saveLog(txId);
    setTimeout(() => {
      fs.unlink(getLogPath(txId)).catch(()=>{});
      transactionLogs.delete(txId);
    }, 60000);
    return results;
  } catch (err) {
    const log = transactionLogs.get(txId);
    log.status = 'rolling_back';
    log.error = err.message;
    await saveLog(txId);

    for (let i = 0; i < rollbacks.length; i++) {
      try {
        await rollbacks[i]();
        log.rollbacks = i + 1;
        await saveLog(txId);
      } catch (rbErr) {
        log.rollbackErrors = log.rollbackErrors||[];
        log.rollbackErrors.push({ index: i, error: rbErr.message });
        await saveLog(txId);
      }
    }
    log.status = log.rollbackErrors ? 'rolled_back_with_errors' : 'rolled_back';
    log.endTime = Date.now();
    await saveLog(txId);
    setTimeout(() => {
      fs.unlink(getLogPath(txId)).catch(()=>{});
      transactionLogs.delete(txId);
    }, 3600000);
    throw err;
  }
};

module.exports = { initializeTransactions, executeTransaction, getTransactionLogs: () => Array.from(transactionLogs.values()) };

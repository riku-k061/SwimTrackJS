const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}${info.stack?'\n'+info.stack:''}`
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV==='production'?'info':'debug',
  defaultMeta: { service: 'swim-track-js' },
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({ filename: path.join(logsDir,'combined.log'), format: fileFormat, maxsize:10485760, maxFiles:5, tailable:true }),
    new winston.transports.File({ filename: path.join(logsDir,'errors.log'), level:'error', format: fileFormat, maxsize:10485760, maxFiles:5, tailable:true })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir,'exceptions.log'), format:fileFormat, maxsize:10485760, maxFiles:5, tailable:true }),
    new winston.transports.Console({ format: consoleFormat })
  ]
});

const requestLogger = (req, res, next) => {
  if (req.path.startsWith('/static/')) return next();
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  logger.info(`[${requestId}] ${req.method} ${req.url}`, { requestId, userId: req.user?.id||'anon' });
  res.on('finish', () => {
    const duration = Date.now()-start;
    const level = res.statusCode>=400?'warn':'info';
    logger[level](`[${requestId}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`, { statusCode: res.statusCode, duration, requestId });
  });
  next();
};

const errorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SYSTEM_ERROR: 'SYSTEM_ERROR'
};

const createError = (msg, type=errorTypes.SYSTEM_ERROR, statusCode=500, details=null) => {
  const err = new Error(msg);
  err.type = type; err.statusCode = statusCode; err.details = details;
  return err;
};

const logError = (error, req=null) => {
  const requestId = req?.requestId;
  const userId = req?.user?.id||'anonymous';
  const meta = { message:error.message, type:error.type||errorTypes.SYSTEM_ERROR, statusCode:error.statusCode||500, requestId, userId, stack:error.stack };
  if (error.details) meta.details = error.details;
  logger.error(`[${requestId||'NO_REQ'}] ${error.message}`, meta);
};

module.exports = { logger, requestLogger, errorTypes, createError, logError };

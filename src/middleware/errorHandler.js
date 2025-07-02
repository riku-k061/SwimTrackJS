// src/middleware/errorHandler.js

const { logError, errorTypes, createError } = require('../utils/logger');

const formatErrorResponse = error => {
  const res = { status:'error', message:error.message };
  if (error.requestId) res.requestId = error.requestId;
  if (error.type===errorTypes.VALIDATION_ERROR && error.details) {
    res.errors = Array.isArray(error.details) ? error.details : [error.details];
  }
  if (process.env.NODE_ENV!=='production') {
    res.debug = { type:error.type, stack:error.stack?.split('\n').map(l=>l.trim()) };
    if (error.details && error.type!==errorTypes.VALIDATION_ERROR) res.debug.details = error.details;
  }
  return res;
};

const normalizeError = (err, req) => {
  if (err.type && err.statusCode) return err;
  if (err.validationErrors) {
    return createError('Validation failed', errorTypes.VALIDATION_ERROR, 400, err.validationErrors);
  }
  if (err.message?.toLowerCase().includes('not found')) {
    return createError(err.message, errorTypes.NOT_FOUND_ERROR, 404);
  }
  if (err.code==='ENOENT') {
    return createError('Database operation failed', errorTypes.DATABASE_ERROR, 500, err.message);
  }
  return createError(err.message||'Unexpected error', errorTypes.SYSTEM_ERROR, 500);
};

const errorHandler = (err, req, res, next) => {
  const normalized = normalizeError(err, req);
  normalized.requestId = req.requestId;
  logError(normalized, req);
  res.status(normalized.statusCode).json(formatErrorResponse(normalized));
};

const notFoundHandler = (req, res, next) => {
  next(createError(`Route not found: ${req.method} ${req.path}`, errorTypes.NOT_FOUND_ERROR, 404));
};

module.exports = { errorHandler, notFoundHandler };

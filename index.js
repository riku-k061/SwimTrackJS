// index.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./src/db');
const { registerRoutes } = require('./src/routes');
const { initializeTransactions } = require('./src/utils/transactionManager');
const { requestLogger, logger } = require('./src/utils/logger');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Record start time
const startTime = Date.now();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

// Initialize database
db.initializeDb().catch(err => {
  logger.error('Database initialization failed', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Initialize transaction system
initializeTransactions().catch(err => {
  logger.error('Transaction system initialization failed', { error: err.message, stack: err.stack });
});

// Register all routes dynamically
registerRoutes(app);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to SwimTrackJS API',
    version: '1.0.0',
    uptime: `${Math.round((Date.now() - startTime) / 1000)}s`
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    uptime: `${Math.round((Date.now() - startTime) / 1000)}s`,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Only start listening when run directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
}

// Export app for testing
module.exports = app;

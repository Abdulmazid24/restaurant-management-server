const app = require('./app');
const config = require('./config/config');
const { connectMongoose } = require('./config/database');
const logger = require('./utils/logger');

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', error);
    process.exit(1);
});

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectMongoose();
        logger.info('Database connected successfully');

        // Start HTTP server
        const server = app.listen(config.port, () => {
            logger.info(`
╔════════════════════════════════════════════════╗
║   Restaurant Management API Server Started    ║
╠════════════════════════════════════════════════╣
║ ⚡ Server running on port: ${config.port.toString().padEnd(20)}  ║
║ 🌍 Environment: ${config.nodeEnv.padEnd(31)}  ║
║ 📡 API Version: v1${' '.repeat(31)}  ║
║ 🔗 Base URL: http://localhost:${config.port}${' '.repeat(19)}  ║
║ 🏥 Health Check: /api/v1/health${' '.repeat(18)}  ║
╚════════════════════════════════════════════════╝
      `);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (error) => {
            logger.error('UNHANDLED REJECTION! Shutting down...', error);
            server.close(() => {
                process.exit(1);
            });
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Process terminated');
            });
        });

        process.on('SIGINT', () => {
            logger.info('SIGINT received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Process terminated');
            });
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

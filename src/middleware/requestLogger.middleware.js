const logger = require('../utils/logger');

/**
 * Request logger middleware
 * Logs all incoming requests with details
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - start;

        logger.info('HTTP Request', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    });

    next();
};

module.exports = { requestLogger };

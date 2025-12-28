const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

/**
 * Error handler middleware
 * Converts all errors to ApiError and sends consistent error responses
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Convert non-ApiError to ApiError
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, false, err.stack);
    }

    // Log error
    logger.error(`Error: ${error.message}`, {
        statusCode: error.statusCode,
        path: req.path,
        method: req.method,
        ip: req.ip,
        stack: error.stack,
    });

    // Send error response
    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
    };

    // Include stack trace in development
    if (config.nodeEnv === 'development') {
        response.stack = error.stack;
    }

    res.status(error.statusCode).json(response);
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
    const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Async error handler wrapper
 * Catches async errors and passes to error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    notFound,
    asyncHandler,
};

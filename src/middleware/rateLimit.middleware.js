const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw ApiError.tooManyRequests('Too many requests, please try again later');
    },
});

/**
 * Auth endpoints rate limiter
 * More strict: 15 requests per 15 minutes
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15,
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        throw ApiError.tooManyRequests('Too many authentication attempts, please try again later');
    },
});

/**
 * Create food rate limiter
 * 20 requests per hour
 */
const createFoodLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: 'Too many food items created, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        throw ApiError.tooManyRequests('Too many food items created, please try again later');
    },
});

module.exports = {
    apiLimiter,
    authLimiter,
    createFoodLimiter,
};

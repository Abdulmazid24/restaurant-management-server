const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { asyncHandler } = require('./error.middleware');

/**
 * Verify JWT access token
 */
const verifyToken = asyncHandler(async (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, config.jwt.accessTokenSecret);

        // Attach user to request
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw ApiError.unauthorized('Token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw ApiError.unauthorized('Invalid token');
        }
        throw ApiError.unauthorized('Token verification failed');
    }
});

/**
 * Check if user owns the resource
 * Compares user email from token with resource email
 */
const checkOwnership = (resourceEmailField = 'email') => {
    return asyncHandler(async (req, res, next) => {
        const userEmail = req.user.email;
        const resourceEmail = req.body[resourceEmailField] || req.query[resourceEmailField];

        if (!resourceEmail) {
            throw ApiError.badRequest(`${resourceEmailField} is required`);
        }

        if (userEmail !== resourceEmail) {
            throw ApiError.forbidden('You do not have permission to access this resource');
        }

        next();
    });
};

/**
 * Optional authentication
 * Verifies token if present, but doesn't fail if not
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwt.accessTokenSecret);
        req.user = decoded;
    } catch (error) {
        // Silently fail for optional auth
    }

    next();
});

module.exports = {
    verifyToken,
    checkOwnership,
    optionalAuth,
};

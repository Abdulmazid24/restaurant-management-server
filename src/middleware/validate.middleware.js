const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Validate request using express-validator
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => ({
            field: err.param,
            message: err.msg,
            value: err.value,
        }));

        const error = ApiError.badRequest('Validation failed');
        error.errors = errorMessages;

        throw error;
    }

    next();
};

module.exports = { validate };

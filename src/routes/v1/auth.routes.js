const express = require('express');
const { body } = require('express-validator');
const authController = require('../../controllers/auth.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { authLimiter } = require('../../middleware/rateLimit.middleware');

const router = express.Router();

// Validation schemas
const registerValidation = [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('photoURL').optional().isURL().withMessage('Valid photo URL required'),
];

const loginValidation = [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const firebaseAuthValidation = [
    body('uid').trim().notEmpty().withMessage('Firebase UID is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
];

const updateProfileValidation = [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('photoURL').optional().isURL().withMessage('Valid photo URL required'),
];

// Public routes with rate limiting
router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/firebase', authLimiter, firebaseAuthValidation, validate, authController.firebaseAuth);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);
router.patch('/profile', verifyToken, updateProfileValidation, validate, authController.updateProfile);

module.exports = router;

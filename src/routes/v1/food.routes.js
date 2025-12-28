const express = require('express');
const { body } = require('express-validator');
const foodController = require('../../controllers/food.controller');
const { verifyToken, checkOwnership } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createFoodLimiter } = require('../../middleware/rateLimit.middleware');

const router = express.Router();

// Validation schemas
const createFoodValidation = [
    body('name').trim().notEmpty().withMessage('Food name is required'),
    body('image').trim().isURL().withMessage('Valid image URL is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('description').optional().isString(),
    body('email').trim().isEmail().withMessage('Valid email is required'),
];

const updateFoodValidation = [
    body('name').optional().trim().notEmpty().withMessage('Food name cannot be empty'),
    body('image').optional().trim().isURL().withMessage('Valid image URL is required'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
];

// Public routes
router.get('/', foodController.getAllFoods);
router.get('/top', foodController.getTopFoods);
router.get('/:id', foodController.getFoodById);

// Protected routes
router.get('/user/:email', verifyToken, foodController.getUserFoods);

router.post(
    '/',
    verifyToken,
    createFoodLimiter,
    createFoodValidation,
    validate,
    foodController.createFood
);

router.put(
    '/:id',
    verifyToken,
    updateFoodValidation,
    validate,
    foodController.updateFood
);

router.delete('/:id', verifyToken, foodController.deleteFood);

module.exports = router;

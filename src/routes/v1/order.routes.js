const express = require('express');
const { body } = require('express-validator');
const orderController = require('../../controllers/order.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');

const router = express.Router();

// Validation schemas
const createOrderValidation = [
    body('foodId').trim().notEmpty().withMessage('Food ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('buyerName').trim().notEmpty().withMessage('Buyer name is required'),
];

const updateStatusValidation = [
    body('status')
        .isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
        .withMessage('Invalid status'),
];

// All order routes require authentication
router.use(verifyToken);

// Order routes
router.post('/', createOrderValidation, validate, orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', updateStatusValidation, validate, orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);

// Admin routes
router.get('/admin/all', orderController.getAllOrders);

module.exports = router;

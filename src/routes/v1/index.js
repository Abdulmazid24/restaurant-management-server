const express = require('express');
const foodRoutes = require('./food.routes');
const orderRoutes = require('./order.routes');
const authRoutes = require('./auth.routes');

const router = express.Router();

// API v1 routes
router.use('/foods', foodRoutes);
router.use('/orders', orderRoutes);
router.use('/auth', authRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

module.exports = router;

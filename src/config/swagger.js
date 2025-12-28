const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Restaurant Management API',
            version: '2.0.0',
            description: 'Enterprise-grade RESTful API for restaurant management system with JWT authentication',
            contact: {
                name: 'Abdul Mazid',
                url: 'https://github.com/Abdulmazid24',
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC',
            },
        },
        servers: [
            {
                url: `http://localhost:${config.port}`,
                description: 'Development server',
            },
            {
                url: 'https://your-production-url.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Food: {
                    type: 'object',
                    required: ['name', 'image', 'price', 'category'],
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        name: { type: 'string', example: 'Margherita Pizza' },
                        image: { type: 'string', example: 'https://example.com/pizza.jpg' },
                        price: { type: 'number', example: 12.99 },
                        category: { type: 'string', example: 'Pizza' },
                        description: { type: 'string', example: 'Classic Italian pizza with tomato and mozzarella' },
                        quantity: { type: 'number', example: 50 },
                        purchaseCount: { type: 'number', example: 127 },
                        addedBy: {
                            type: 'object',
                            properties: {
                                email: { type: 'string', example: 'chef@restaurant.com' },
                                name: { type: 'string', example: 'Chef Mario' },
                            },
                        },
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        foodId: { type: 'string' },
                        buyerEmail: { type: 'string' },
                        buyerName: { type: 'string' },
                        quantity: { type: 'number' },
                        price: { type: 'number' },
                        totalPrice: { type: 'number' },
                        status: { type: 'string', enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'] },
                        buyingDate: { type: 'string', format: 'date-time' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        photoURL: { type: 'string' },
                        role: { type: 'string', enum: ['user', 'admin'] },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        statusCode: { type: 'number' },
                    },
                },
            },
        },
        tags: [
            { name: 'Authentication', description: 'User authentication endpoints' },
            { name: 'Foods', description: 'Food management endpoints' },
            { name: 'Orders', description: 'Order management endpoints' },
        ],
    },
    apis: ['./src/routes/**/*.js'], // Path to API routes for JSDoc comments
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };

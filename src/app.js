const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const config = require('./config/config');
const { requestLogger } = require('./middleware/requestLogger.middleware');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const v1Routes = require('./routes/v1');
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Request logger
app.use(requestLogger);

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Restaurant Management API Server',
        version: '2.0.0',
        documentation: '/api/v1/health',
    });
});

// API v1 routes
app.use('/api/v1', v1Routes);

// Backward compatibility routes (old endpoints)
const { getDatabase } = require('./config/database');
const { ObjectId } = require('mongodb');

// Old endpoint: GET /top-foods
app.get('/top-foods', async (req, res, next) => {
    try {
        const Food = require('./models/Food.model');
        const foods = await Food.find().sort({ purchaseCount: -1 }).limit(6).lean();
        res.json(foods);
    } catch (error) {
        next(error);
    }
});

// Old endpoint: GET /foods
app.get('/foods', async (req, res, next) => {
    try {
        const Food = require('./models/Food.model');
        const search = req.query.search || '';
        const query = search
            ? { name: { $regex: search, $options: 'i' } }
            : {};
        const foods = await Food.find(query).lean();
        res.send(foods);
    } catch (error) {
        next(error);
    }
});

// Old endpoint: GET /foods/:id
app.get('/foods/:id', async (req, res, next) => {
    try {
        const Food = require('./models/Food.model');
        const food = await Food.findById(req.params.id).lean();
        if (!food) {
            return res.status(404).send({ message: 'Food not found' });
        }
        res.send(food);
    } catch (error) {
        next(error);
    }
});

// Old endpoint: POST /purchase
app.post('/purchase', async (req, res, next) => {
    try {
        const Order = require('./models/Order.model');
        const Food = require('./models/Food.model');

        const order = await Order.create(req.body);
        await Food.findByIdAndUpdate(req.body.foodId, {
            $inc: { purchaseCount: 1 },
        });
        res.status(201).send(order);
    } catch (error) {
        next(error);
    }
});

// Old endpoint: GET /myfoods/:email
app.get('/myfoods/:email', async (req, res, next) => {
    try {
        const Food = require('./models/Food.model');
        const foods = await Food.find({
            $or: [{ 'addedBy.email': req.params.email }, { email: req.params.email }],
        }).lean();
        res.send(foods);
    } catch (error) {
        next(error);
    }
});

// Old endpoint: GET /myfood/:id
app.get('/myfood/:id', async (req, res, next) => {
    try {
        const Food = require('./models/Food.model');
        const food = await Food.findById(req.params.id).lean();
        if (!food) {
            return res.status(404).send({ message: 'Food not found' });
        }
        res.send(food);
    } catch (error) {
        next(error);
    }
});

// Old endpoint: POST /add-foods
app.post('/add-foods', async (req, res, next) => {
    try {
        const Food = require('./models/Food.model');
        const food = await Food.create(req.body);
        res.status(201).send(food);
    } catch (error) {
        next(error);
    }
});

// Old endpoint: PUT /myfood/:id
app.put('/myfood/:id', async (req, res, next) => {
    try {
        const Food = require('./models/Food.model');
        const food = await Food.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, upsert: true }
        );
        res.send(food);
    } catch (error) {
        next(error);
    }
});

// Old endpoint: GET /my-orders/:email
app.get('/my-orders/:email', async (req, res, next) => {
    try {
        const Order = require('./models/Order.model');
        const orders = await Order.find({ buyerEmail: req.params.email }).lean();
        res.send(orders);
    } catch (error) {
        next(error);
    }
});

// Old endpoint: DELETE /my-orders/:id
app.delete('/my-orders/:id', async (req, res, next) => {
    try {
        const Order = require('./models/Order.model');
        const result = await Order.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (error) {
        next(error);
    }
});

// 404 handler (must be after all routes)
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;

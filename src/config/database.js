const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

let client;

/**
 * Connect to MongoDB using Mongoose
 */
const connectMongoose = async () => {
    try {
        await mongoose.connect(config.mongodb.uri, {
            dbName: config.mongodb.dbName,
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });

        logger.info('Successfully connected to MongoDB with Mongoose!');

        // Test the connection
        await mongoose.connection.db.admin().ping();
        logger.info('Pinged MongoDB deployment. Connection verified!');

        return mongoose.connection;
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        throw error;
    }
};

/**
 * Connect to MongoDB using native driver (for backward compatibility)
 */
const connectNative = async () => {
    try {
        client = new MongoClient(config.mongodb.uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });

        await client.connect();
        await client.db('admin').command({ ping: 1 });
        logger.info('Successfully connected to MongoDB (native driver)!');

        return client;
    } catch (error) {
        logger.error('MongoDB native connection error:', error);
        throw error;
    }
};

/**
 * Get native MongoDB database instance
 */
const getDatabase = () => {
    if (!client) {
        throw new Error('MongoDB client not initialized. Call connectNative() first.');
    }
    return client.db(config.mongodb.dbName);
};

/**
 * Close database connections
 */
const closeConnection = async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            logger.info('Mongoose connection closed');
        }

        if (client) {
            await client.close();
            logger.info('MongoDB native client closed');
        }
    } catch (error) {
        logger.error('Error closing database connections:', error);
        throw error;
    }
};

module.exports = {
    connectMongoose,
    connectNative,
    getDatabase,
    closeConnection,
};

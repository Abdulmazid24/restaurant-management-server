require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: 'v1',

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.DB_NAME || 'restaurantDB',
  },

  // JWT
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-token-secret',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Pagination
  pagination: {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
  },
};

module.exports = config;

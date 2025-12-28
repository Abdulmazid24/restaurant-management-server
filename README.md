# 🍽️ Restaurant Management API Server

Enterprise-grade RESTful API server for restaurant management system built with Node.js, Express, MongoDB, and JWT authentication.

## 🚀 Features

- ✅ **Complete MVC Architecture** - Organized code structure with models, views, controllers
- ✅ **JWT Authentication** - Secure access & refresh token system
- ✅ **Firebase Integration** - Support for Firebase authentication
- ✅ **MongoDB with Mongoose** - Robust data modeling and validation
- ✅ **Request Validation** - Input validation with express-validator
- ✅ **Error Handling** - Centralized error handling middleware
- ✅ **Rate Limiting** - Protection against abuse and DDoS
- ✅ **Security Headers** - Helmet.js for enhanced security
- ✅ **Logging System** - Winston logger with file and console outputs
- ✅ **CORS Configuration** - Proper cross-origin resource sharing
- ✅ **API Versioning** - `/api/v1` endpoints with backward compatibility
- ✅ **Code Quality** - ESLint & Prettier configuration

## 📁 Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   │   ├── config.js     # Central configuration
│   │   └── database.js   # MongoDB connection
│   ├── controllers/      # Route controllers
│   │   ├── auth.controller.js
│   │   ├── food.controller.js
│   │   └── order.controller.js
│   ├── models/           # Mongoose models
│   │   ├── User.model.js
│   │   ├── Food.model.js
│   │   └── Order.model.js
│   ├── routes/           # API routes
│   │   └── v1/          # Version 1 routes
│   ├── middleware/       # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validate.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── services/         # Business logic
│   │   ├── auth.service.js
│   │   ├── food.service.js
│   │   └── order.service.js
│   ├── utils/            # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   └── logger.js
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── logs/                 # Log files
├── .env.example         # Environment variables template
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
└── package.json

```

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Steps

1. **Clone the repository**

```bash
git clone https://github.com/Abdulmazid24/restaurant-management-server.git
cd restaurant-management-server
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your-mongodb-connection-string
DB_NAME=restaurantDB

# JWT Secrets
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Database credentials (for backward compatibility)
DB_USER=your-db-username
DB_PASS=your-db-password
```

4. **Run the server**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/firebase` - Firebase authentication
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user (Protected)
- `GET /api/v1/auth/profile` - Get user profile (Protected)
- `PATCH /api/v1/auth/profile` - Update profile (Protected)

### Foods

- `GET /api/v1/foods` - Get all foods (with search, filter, pagination)
- `GET /api/v1/foods/top` - Get top 6 foods by popularity
- `GET /api/v1/foods/:id` - Get single food by ID
- `GET /api/v1/foods/user/:email` - Get foods by user (Protected)
- `POST /api/v1/foods` - Create new food (Protected)
- `PUT /api/v1/foods/:id` - Update food (Protected)
- `DELETE /api/v1/foods/:id` - Delete food (Protected)

### Orders

- `POST /api/v1/orders` - Create new order (Protected)
- `GET /api/v1/orders/my-orders` - Get user's orders (Protected)
- `GET /api/v1/orders/:id` - Get single order (Protected)
- `PATCH /api/v1/orders/:id/status` - Update order status (Protected)
- `DELETE /api/v1/orders/:id` - Delete order (Protected)
- `GET /api/v1/orders/admin/all` - Get all orders (Admin)

### Health Check

- `GET /api/v1/health` - API health status

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Access Token**: Short-lived (15 minutes), sent in Authorization header
2. **Refresh Token**: Long-lived (7 days), stored in HTTP-only cookie

### Usage

```javascript
// Include access token in request header
headers: {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
}
```

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📝 Code Quality

- **ESLint**: For code linting and maintaining code standards
- **Prettier**: For consistent code formatting
- **Winston**: For structured logging

## 🔐 Security Features

- Helmet.js for security headers
- CORS with whitelist
- Rate limiting per IP
- JWT token expiration
- Password hashing with bcrypt
- Input validation and sanitization
- MongoDB injection prevention

## 🌐 Deployment

### Environment Variables for Production

Make sure to set these in your hosting platform:

- `NODE_ENV=production`
- `MONGODB_URI` - Your production MongoDB URI
- `JWT_ACCESS_SECRET` - Strong secret key
- `JWT_REFRESH_SECRET` - Strong secret key
- `CORS_ORIGIN` - Your frontend URL

### Recommended Platforms

- **Vercel** - Easy deployment with GitHub integration
- **Railway** - Simple Node.js hosting
- **Render** - Free tier available
- **Heroku** - Traditional PaaS
- **DigitalOcean** - VPS with more control

## 📚 Documentation

API documentation is available at the `/api/v1/health` endpoint.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Abdul Mazid**

- GitHub: [@Abdulmazid24](https://github.com/Abdulmazid24)

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the powerful database
- All contributors and supporters

---

**Version**: 2.0.0  
**Last Updated**: December 2025

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

/**
 * Generate JWT access token
 */
const generateAccessToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role,
    };

    return jwt.sign(payload, config.jwt.accessTokenSecret, {
        expiresIn: config.jwt.accessTokenExpiry,
    });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
    };

    return jwt.sign(payload, config.jwt.refreshTokenSecret, {
        expiresIn: config.jwt.refreshTokenExpiry,
    });
};

/**
 * Register new user
 */
const register = async (userData) => {
    const { email, password, name, photoURL } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw ApiError.conflict('User with this email already exists');
    }

    // Create user
    const user = await User.create({
        email,
        password,
        name,
        photoURL,
        provider: 'email',
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return {
        user: user.toAuthJSON(),
        accessToken,
        refreshToken,
    };
};

/**
 * Login user
 */
const login = async (email, password) => {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
        throw ApiError.forbidden('Your account has been deactivated');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return {
        user: user.toAuthJSON(),
        accessToken,
        refreshToken,
    };
};

/**
 * Firebase authentication (create or login user)
 */
const firebaseAuth = async (firebaseUser) => {
    const { uid, email, displayName, photoURL } = firebaseUser;

    // Find or create user
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
        // Check if email already exists
        user = await User.findOne({ email });

        if (user) {
            // Update existing user with Firebase UID
            user.firebaseUid = uid;
            user.provider = 'firebase';
            if (!user.photoURL) user.photoURL = photoURL;
        } else {
            // Create new user
            user = await User.create({
                email,
                name: displayName || email.split('@')[0],
                photoURL,
                firebaseUid: uid,
                provider: 'firebase',
            });
        }
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return {
        user: user.toAuthJSON(),
        accessToken,
        refreshToken,
    };
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecret);

        // Find user
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        return {
            accessToken: newAccessToken,
        };
    } catch (error) {
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }
};

/**
 * Logout user
 */
const logout = async (userId) => {
    // Clear refresh token
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
};

/**
 * Get user profile
 */
const getProfile = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    return user.toAuthJSON();
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updates) => {
    const user = await User.findById(userId);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'photoURL'];
    allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
            user[field] = updates[field];
        }
    });

    await user.save();
    return user.toAuthJSON();
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    register,
    login,
    firebaseAuth,
    refreshAccessToken,
    logout,
    getProfile,
    updateProfile,
};

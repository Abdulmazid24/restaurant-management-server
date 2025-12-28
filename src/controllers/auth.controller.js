const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const { email, password, name, photoURL } = req.body;

    const result = await authService.register({ email, password, name, photoURL });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json(
        ApiResponse.created(
            {
                user: result.user,
                accessToken: result.accessToken,
            },
            'User registered successfully'
        )
    );
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json(
        ApiResponse.success(
            {
                user: result.user,
                accessToken: result.accessToken,
            },
            'Login successful'
        )
    );
});

/**
 * @route   POST /api/v1/auth/firebase
 * @desc    Authenticate with Firebase
 * @access  Public
 */
const firebaseAuth = asyncHandler(async (req, res) => {
    const firebaseUser = req.body;

    const result = await authService.firebaseAuth(firebaseUser);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json(
        ApiResponse.success(
            {
                user: result.user,
                accessToken: result.accessToken,
            },
            'Authentication successful'
        )
    );
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json(
        ApiResponse.success(
            {
                accessToken: result.accessToken,
            },
            'Token refreshed successfully'
        )
    );
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user.id);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
});

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);

    res.status(200).json(ApiResponse.success(user, 'Profile retrieved successfully'));
});

/**
 * @route   PATCH /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);

    res.status(200).json(ApiResponse.success(user, 'Profile updated successfully'));
});

module.exports = {
    register,
    login,
    firebaseAuth,
    refreshToken,
    logout,
    getProfile,
    updateProfile,
};

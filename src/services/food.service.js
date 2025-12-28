const Food = require('../models/Food.model');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

/**
 * Get all foods with optional search, pagination, and sorting
 */
const getAllFoods = async (filters = {}) => {
    const {
        search = '',
        page = config.pagination.defaultPage,
        limit = config.pagination.defaultLimit,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        category,
        minPrice,
        maxPrice,
    } = filters;

    // Build query
    const query = {};

    // Search by name
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), config.pagination.maxLimit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [foods, total] = await Promise.all([
        Food.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
        Food.countDocuments(query),
    ]);

    return {
        foods,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            hasMore: pageNum * limitNum < total,
        },
    };
};

/**
 * Get top foods by purchase count
 */
const getTopFoods = async (limit = 6) => {
    const foods = await Food.find()
        .sort({ purchaseCount: -1 })
        .limit(limit)
        .lean();

    return foods;
};

/**
 * Get food by ID
 */
const getFoodById = async (id) => {
    const food = await Food.findById(id).lean();

    if (!food) {
        throw ApiError.notFound('Food item not found');
    }

    return food;
};

/**
 * Get foods added by a specific user
 */
const getFoodsByUser = async (email) => {
    const foods = await Food.find({
        $or: [{ 'addedBy.email': email }, { email: email }],
    })
        .sort({ createdAt: -1 })
        .lean();

    return foods;
};

/**
 * Create new food item
 */
const createFood = async (foodData) => {
    // Ensure backward compatibility
    if (foodData.email && !foodData.addedBy) {
        foodData.addedBy = {
            email: foodData.email,
            name: foodData.userName || '',
        };
    }

    const food = await Food.create(foodData);
    return food.toObject();
};

/**
 * Update food item
 */
const updateFood = async (id, foodData, userEmail) => {
    const food = await Food.findById(id);

    if (!food) {
        throw ApiError.notFound('Food item not found');
    }

    // Check ownership
    const foodOwnerEmail = food.addedBy?.email || food.email;
    if (foodOwnerEmail !== userEmail) {
        throw ApiError.forbidden('You are not authorized to update this food item');
    }

    // Update fields
    Object.keys(foodData).forEach((key) => {
        food[key] = foodData[key];
    });

    await food.save();
    return food.toObject();
};

/**
 * Delete food item
 */
const deleteFood = async (id, userEmail) => {
    const food = await Food.findById(id);

    if (!food) {
        throw ApiError.notFound('Food item not found');
    }

    // Check ownership
    const foodOwnerEmail = food.addedBy?.email || food.email;
    if (foodOwnerEmail !== userEmail) {
        throw ApiError.forbidden('You are not authorized to delete this food item');
    }

    await Food.findByIdAndDelete(id);
    return { message: 'Food item deleted successfully' };
};

/**
 * Increment purchase count
 */
const incrementPurchaseCount = async (id) => {
    const food = await Food.findByIdAndUpdate(
        id,
        { $inc: { purchaseCount: 1 } },
        { new: true }
    );

    if (!food) {
        throw ApiError.notFound('Food item not found');
    }

    return food;
};

module.exports = {
    getAllFoods,
    getTopFoods,
    getFoodById,
    getFoodsByUser,
    createFood,
    updateFood,
    deleteFood,
    incrementPurchaseCount,
};

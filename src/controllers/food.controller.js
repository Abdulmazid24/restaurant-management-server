const foodService = require('../services/food.service');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * @route   GET /api/v1/foods
 * @desc    Get all foods with search, filters, and pagination
 * @access  Public
 */
const getAllFoods = asyncHandler(async (req, res) => {
    const filters = {
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        category: req.query.category,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
    };

    const result = await foodService.getAllFoods(filters);

    res.status(200).json(
        ApiResponse.paginated(result.foods, result.pagination, 'Foods retrieved successfully')
    );
});

/**
 * @route   GET /api/v1/foods/top
 * @desc    Get top foods by purchase count
 * @access  Public
 */
const getTopFoods = asyncHandler(async (req, res) => {
    const limit = req.query.limit || 6;
    const foods = await foodService.getTopFoods(parseInt(limit));

    res.status(200).json(ApiResponse.success(foods, 'Top foods retrieved successfully'));
});

/**
 * @route   GET /api/v1/foods/:id
 * @desc    Get single food by ID
 * @access  Public
 */
const getFoodById = asyncHandler(async (req, res) => {
    const food = await foodService.getFoodById(req.params.id);

    res.status(200).json(ApiResponse.success(food, 'Food retrieved successfully'));
});

/**
 * @route   GET /api/v1/foods/user/:email
 * @desc    Get all foods added by a user
 * @access  Private
 */
const getUserFoods = asyncHandler(async (req, res) => {
    const foods = await foodService.getFoodsByUser(req.params.email);

    res.status(200).json(ApiResponse.success(foods, 'User foods retrieved successfully'));
});

/**
 * @route   POST /api/v1/foods
 * @desc    Create new food item
 * @access  Private
 */
const createFood = asyncHandler(async (req, res) => {
    const food = await foodService.createFood(req.body);

    res.status(201).json(ApiResponse.created(food, 'Food item created successfully'));
});

/**
 * @route   PUT /api/v1/foods/:id
 * @desc    Update food item
 * @access  Private
 */
const updateFood = asyncHandler(async (req, res) => {
    const food = await foodService.updateFood(req.params.id, req.body, req.user.email);

    res.status(200).json(ApiResponse.success(food, 'Food item updated successfully'));
});

/**
 * @route   DELETE /api/v1/foods/:id
 * @desc    Delete food item
 * @access  Private
 */
const deleteFood = asyncHandler(async (req, res) => {
    await foodService.deleteFood(req.params.id, req.user.email);

    res.status(200).json(ApiResponse.success(null, 'Food item deleted successfully'));
});

module.exports = {
    getAllFoods,
    getTopFoods,
    getFoodById,
    getUserFoods,
    createFood,
    updateFood,
    deleteFood,
};

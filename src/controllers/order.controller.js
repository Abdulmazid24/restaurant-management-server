const orderService = require('../services/order.service');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * @route   POST /api/v1/orders
 * @desc    Create new order (purchase food)
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
    const orderData = {
        ...req.body,
        buyerEmail: req.user.email, // From JWT token
    };

    const order = await orderService.createOrder(orderData);

    res.status(201).json(ApiResponse.created(order, 'Order placed successfully'));
});

/**
 * @route   GET /api/v1/orders/my-orders
 * @desc    Get all orders for logged-in user
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
    const filters = {
        status: req.query.status,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
    };

    const orders = await orderService.getUserOrders(req.user.email, filters);

    res.status(200).json(ApiResponse.success(orders, 'Orders retrieved successfully'));
});

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get single order by ID
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id, req.user.email);

    res.status(200).json(ApiResponse.success(order, 'Order retrieved successfully'));
});

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status
 * @access  Private
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status, req.user.email);

    res.status(200).json(ApiResponse.success(order, 'Order status updated successfully'));
});

/**
 * @route   DELETE /api/v1/orders/:id
 * @desc    Delete/cancel order
 * @access  Private
 */
const deleteOrder = asyncHandler(async (req, res) => {
    await orderService.deleteOrder(req.params.id, req.user.email);

    res.status(200).json(ApiResponse.success(null, 'Order deleted successfully'));
});

/**
 * @route   GET /api/v1/orders/admin/all
 * @desc    Get all orders (admin only)
 * @access  Private (Admin)
 */
const getAllOrders = asyncHandler(async (req, res) => {
    const filters = {
        status: req.query.status,
        page: req.query.page,
        limit: req.query.limit,
    };

    const result = await orderService.getAllOrders(filters);

    res.status(200).json(
        ApiResponse.paginated(result.orders, result.pagination, 'All orders retrieved successfully')
    );
});

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getAllOrders,
};

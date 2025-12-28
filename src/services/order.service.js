const Order = require('../models/Order.model');
const ApiError = require('../utils/ApiError');
const foodService = require('./food.service');

/**
 * Create new order (purchase)
 */
const createOrder = async (orderData) => {
    const { foodId, quantity = 1, buyerEmail, buyerName } = orderData;

    // Get food details
    const food = await foodService.getFoodById(foodId);

    // Check if food is available
    if (food.quantity && food.quantity < quantity) {
        throw ApiError.badRequest('Insufficient quantity available');
    }

    // Create order
    const order = await Order.create({
        foodId: food._id,
        foodName: food.name,
        foodImage: food.image,
        price: food.price,
        quantity,
        totalPrice: food.price * quantity,
        buyerEmail,
        buyerName,
        buyingDate: new Date(),
    });

    // Increment purchase count
    await foodService.incrementPurchaseCount(foodId);

    return order.toObject();
};

/**
 * Get all orders for a user
 */
const getUserOrders = async (userEmail, filters = {}) => {
    const { status, sortBy = 'buyingDate', sortOrder = 'desc' } = filters;

    const query = { buyerEmail: userEmail };

    if (status) {
        query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const orders = await Order.find(query)
        .sort(sortOptions)
        .populate('foodId', 'name image category')
        .lean();

    return orders;
};

/**
 * Get order by ID
 */
const getOrderById = async (id, userEmail) => {
    const order = await Order.findById(id)
        .populate('foodId', 'name image category description')
        .lean();

    if (!order) {
        throw ApiError.notFound('Order not found');
    }

    // Check ownership
    if (order.buyerEmail !== userEmail) {
        throw ApiError.forbidden('You are not authorized to view this order');
    }

    return order;
};

/**
 * Update order status
 */
const updateOrderStatus = async (id, status, userEmail) => {
    const order = await Order.findById(id);

    if (!order) {
        throw ApiError.notFound('Order not found');
    }

    // Check ownership
    if (order.buyerEmail !== userEmail) {
        throw ApiError.forbidden('You are not authorized to update this order');
    }

    order.status = status;
    await order.save();

    return order.toObject();
};

/**
 * Cancel/Delete order
 */
const deleteOrder = async (id, userEmail) => {
    const order = await Order.findById(id);

    if (!order) {
        throw ApiError.notFound('Order not found');
    }

    // Check ownership
    if (order.buyerEmail !== userEmail) {
        throw ApiError.forbidden('You are not authorized to delete this order');
    }

    // Only allow deletion if order is pending
    if (order.status !== 'pending' && order.status !== 'confirmed') {
        throw ApiError.badRequest('Cannot delete order that is being prepared or delivered');
    }

    await Order.findByIdAndDelete(id);
    return { message: 'Order deleted successfully' };
};

/**
 * Get all orders (admin only)
 */
const getAllOrders = async (filters = {}) => {
    const { status, page = 1, limit = 20 } = filters;

    const query = {};
    if (status) {
        query.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        Order.find(query)
            .sort({ buyingDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate('foodId', 'name image category')
            .lean(),
        Order.countDocuments(query),
    ]);

    return {
        orders,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getAllOrders,
};

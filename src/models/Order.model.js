const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        // Food information
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food',
            required: [true, 'Food ID is required'],
        },
        foodName: {
            type: String,
            required: [true, 'Food name is required'],
        },
        foodImage: {
            type: String,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'],
            default: 1,
        },
        totalPrice: {
            type: Number,
            required: true,
        },

        // Buyer information
        buyerEmail: {
            type: String,
            required: [true, 'Buyer email is required'],
        },
        buyerName: {
            type: String,
            required: [true, 'Buyer name is required'],
        },

        // Order details
        buyingDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
            default: 'pending',
        },

        // Additional information
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
orderSchema.index({ buyerEmail: 1 });
orderSchema.index({ foodId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ buyingDate: -1 });

// Pre-save middleware to calculate total price
orderSchema.pre('save', function (next) {
    if (this.isModified('price') || this.isModified('quantity')) {
        this.totalPrice = this.price * this.quantity;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

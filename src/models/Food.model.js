const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Food name is required'],
            trim: true,
            maxlength: [100, 'Food name cannot exceed 100 characters'],
        },
        image: {
            type: String,
            required: [true, 'Food image URL is required'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
            default: 0,
        },
        description: {
            type: String,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        origin: {
            type: String,
            trim: true,
        },
        purchaseCount: {
            type: Number,
            default: 0,
            min: [0, 'Purchase count cannot be negative'],
        },
        // User who added this food
        addedBy: {
            email: {
                type: String,
                required: [true, 'Added by email is required'],
            },
            name: {
                type: String,
            },
        },
        // For backward compatibility with old schema
        email: {
            type: String,
        },
        userName: {
            type: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for better query performance
foodSchema.index({ name: 'text' });
foodSchema.index({ category: 1 });
foodSchema.index({ price: 1 });
foodSchema.index({ purchaseCount: -1 });
foodSchema.index({ 'addedBy.email': 1 });
foodSchema.index({ email: 1 }); // For backward compatibility

// Virtual for availability status
foodSchema.virtual('isAvailable').get(function () {
    return this.quantity > 0;
});

// Pre-save middleware to sync addedBy with email/userName
foodSchema.pre('save', function (next) {
    if (this.email && !this.addedBy.email) {
        this.addedBy.email = this.email;
    }
    if (this.userName && !this.addedBy.name) {
        this.addedBy.name = this.userName;
    }
    next();
});

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;

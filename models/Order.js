const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [{
        product: {
            type: String,  // Changed from ObjectId to String to accept combo IDs
            ref: 'Product'
        },
        name: { 
            type: String, 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true,
            min: 1
        },
        price: { 
            type: Number, 
            required: true,
            min: 0
        },
        addOns: {
            type: String,
            default: ''
        },
        isCombo: { 
            type: Boolean, 
            default: false 
        }
    }],
    shippingAddress: {
        street: { 
            type: String, 
            required: true 
        },
        city: { 
            type: String, 
            required: true 
        },
        state: { 
            type: String, 
            required: false,  // Changed to false to accept empty strings
            default: 'Lagos'   // Default value if not provided
        },
        zipCode: {
            type: String,
            default: ''
        },
        phone: { 
            type: String, 
            required: true 
        }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['pay-on-delivery', 'bank-transfer', 'card']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0
    },
    taxPrice: {
        type: Number,
        default: 0.0,
        min: 0
    },
    deliveryPrice: {
        type: Number,
        default: 0.0,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
        min: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide product description']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'Please provide product category'],
        enum: ['small-chops', 'cakes', 'cookies', 'pastries', 'drinks', 'combos']
    },
    image: {
        type: String,
        default: ''
    },
    imagePublicId: {
        type: String,
        default: ''
    },
    isCombo: {
        type: Boolean,
        default: false
    },
    comboItems: [{
        name: String,
        quantity: Number
    }],
    hasAddOns: {
        type: Boolean,
        default: false
    },
    featured: {
        type: Boolean,
        default: false
    },
    inStock: {
        type: Boolean,
        default: true
    },
    stockQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
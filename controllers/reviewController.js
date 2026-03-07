const Review = require('../models/Review');
const Product = require('../models/Product');

// Add review
const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        // Check if user already reviewed
        const existingReview = await Review.findOne({
            user: req.user.id,
            product: productId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You already reviewed this product'
            });
        }

        const review = await Review.create({
            user: req.user.id,
            product: productId,
            rating,
            comment
        });

        // Update product ratings
        const product = await Product.findById(productId);
        const reviews = await Review.find({ product: productId });
        
        product.numReviews = reviews.length;
        product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
        
        product.reviews.push(review._id);
        await product.save();

        res.status(201).json({ success: true, review });
    } catch (error) {
        console.error('Review error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get product reviews
const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name')
            .sort('-createdAt');
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addReview, getProductReviews };
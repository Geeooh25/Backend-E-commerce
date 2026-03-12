const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

// Get user's wishlist
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        res.json({ success: true, wishlist: user.wishlist || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add to wishlist
router.post('/add/:productId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.wishlist.includes(req.params.productId)) {
            user.wishlist.push(req.params.productId);
            await user.save();
        }
        res.json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Remove from wishlist
router.delete('/remove/:productId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
        await user.save();
        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Check if product is in wishlist
router.get('/check/:productId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const inWishlist = user.wishlist.some(id => id.toString() === req.params.productId);
        res.json({ success: true, inWishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
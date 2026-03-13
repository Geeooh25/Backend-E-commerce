// controllers/wishlistController.js
const User = require('../models/User');
const Product = require('../models/Product');

// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        res.json({ success: true, wishlist: user.wishlist || [] });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user.id);
        
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }
        
        res.json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user.id);
        
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();
        
        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Check if product is in wishlist
const checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user.id);
        
        const inWishlist = user.wishlist.some(id => id.toString() === productId);
        res.json({ success: true, inWishlist });
    } catch (error) {
        console.error('Check wishlist error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅
module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist
};
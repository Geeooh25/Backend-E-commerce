// controllers/wishlistController.js
const User = require('../models/User');
const Product = require('../models/Product');

// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const user = await User.findById(req.user.id).populate('wishlist');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, wishlist: user.wishlist || [] });
    } catch (error) {
        console.error('❌ Get wishlist error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add to wishlist - handles both real products and combo IDs
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // For combo items, we'll create a virtual product representation
        let productToAdd = productId;
        
        // If it's a combo, check if it exists in our combo list
        if (productId.startsWith('combo-')) {
            // Extract combo name from ID
            const comboName = productId.replace('combo-', '').replace(/-/g, ' ');
            
            // Check if this combo exists in your combos (you can maintain a combo list)
            const validCombos = ['jollof combo', 'fried rice combo', 'small chops combo', 'doughnut combo'];
            const comboExists = validCombos.some(c => comboName.includes(c));
            
            if (!comboExists) {
                return res.status(404).json({ success: false, message: 'Combo not found' });
            }
            
            // For combos, we'll store the combo ID as a special identifier
            productToAdd = productId;
        } else {
            // For regular products, verify they exist in database
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
        }

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Initialize wishlist if it doesn't exist
        if (!user.wishlist) {
            user.wishlist = [];
        }

        // Add to wishlist if not already there
        if (!user.wishlist.includes(productToAdd)) {
            user.wishlist.push(productToAdd);
            await user.save();
        }

        res.json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        console.error('❌ Add to wishlist error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.wishlist) {
            user.wishlist = [];
        }

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        console.error('❌ Remove from wishlist error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Check if product is in wishlist
const checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.wishlist) {
            user.wishlist = [];
        }

        const inWishlist = user.wishlist.some(id => id.toString() === productId);
        
        res.json({ success: true, inWishlist });
    } catch (error) {
        console.error('❌ Check wishlist error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist
};
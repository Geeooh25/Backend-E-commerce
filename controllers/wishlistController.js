// controllers/wishlistController.js
const User = require('../models/User');
const Product = require('../models/Product');

// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        console.log('🔍 getWishlist called for user:', req.user?.id);
        
        if (!req.user || !req.user.id) {
            console.log('❌ No user found in request');
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        const user = await User.findById(req.user.id).populate('wishlist');
        console.log('✅ User found:', user ? 'yes' : 'no');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        console.log('📦 Wishlist items:', user.wishlist?.length || 0);
        
        res.json({ 
            success: true, 
            wishlist: user.wishlist || [] 
        });
    } catch (error) {
        console.error('❌ Get wishlist error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: error.message,
            stack: error.stack
        });
    }
};

// Add to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log('🔍 addToWishlist called for product:', productId);
        console.log('🔍 User:', req.user?.id);
        
        if (!req.user || !req.user.id) {
            console.log('❌ No user found in request');
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        // Check if this is a combo (starts with 'combo-')
        const isCombo = productId.startsWith('combo-');
        console.log('📦 Is combo:', isCombo);
        
        if (!isCombo) {
            // For regular products, verify they exist in database
            console.log('🔍 Checking if product exists:', productId);
            const product = await Product.findById(productId);
            if (!product) {
                console.log('❌ Product not found:', productId);
                return res.status(404).json({ 
                    success: false, 
                    message: 'Product not found' 
                });
            }
            console.log('✅ Product found:', product.name);
        }

        console.log('🔍 Finding user:', req.user.id);
        const user = await User.findById(req.user.id);
        
        if (!user) {
            console.log('❌ User not found');
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        console.log('✅ User found:', user.email);

        // Initialize wishlist if it doesn't exist
        if (!user.wishlist) {
            console.log('📦 Initializing wishlist array');
            user.wishlist = [];
        }

        console.log('📦 Current wishlist:', user.wishlist);
        console.log('📦 Checking if already in wishlist:', user.wishlist.includes(productId));
        
        // Add to wishlist if not already there
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            console.log('✅ Added to wishlist, saving...');
            await user.save();
            console.log('✅ User saved successfully');
        } else {
            console.log('ℹ️ Already in wishlist');
        }

        res.json({ 
            success: true, 
            message: isCombo ? 'Combo added to wishlist' : 'Product added to wishlist'
        });
    } catch (error) {
        console.error('❌ Add to wishlist error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: error.message,
            stack: error.stack
        });
    }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log('🔍 removeFromWishlist called for product:', productId);
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (!user.wishlist) {
            user.wishlist = [];
        }

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        res.json({ 
            success: true, 
            message: 'Removed from wishlist' 
        });
    } catch (error) {
        console.error('❌ Remove from wishlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Check if product is in wishlist
const checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (!user.wishlist) {
            user.wishlist = [];
        }

        const inWishlist = user.wishlist.some(id => id.toString() === productId);
        
        res.json({ 
            success: true, 
            inWishlist 
        });
    } catch (error) {
        console.error('❌ Check wishlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist
};
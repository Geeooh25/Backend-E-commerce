const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist
} = require('../controllers/wishlistController');

// All wishlist routes are protected (require login)
router.get('/', protect, getWishlist);              // Line 12
router.post('/add/:productId', protect, addToWishlist);
router.delete('/remove/:productId', protect, removeFromWishlist);
router.get('/check/:productId', protect, checkWishlist);

module.exports = router;
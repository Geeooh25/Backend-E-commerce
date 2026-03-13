const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const wishlistController = require('../controllers/wishlistController');

// All wishlist routes are protected (require login)
router.get('/', protect, wishlistController.getWishlist);
router.post('/add/:productId', protect, wishlistController.addToWishlist);
router.delete('/remove/:productId', protect, wishlistController.removeFromWishlist);
router.get('/check/:productId', protect, wishlistController.checkWishlist);

module.exports = router;
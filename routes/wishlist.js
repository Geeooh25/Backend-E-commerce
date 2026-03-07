const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');

router.get('/', protect, getWishlist);
router.post('/', protect, addToWishlist);
router.delete('/:productId', protect, removeFromWishlist);

module.exports = router;
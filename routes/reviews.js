const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addReview, getProductReviews } = require('../controllers/reviewController');

router.post('/', protect, addReview);
router.get('/product/:productId', getProductReviews);

module.exports = router;
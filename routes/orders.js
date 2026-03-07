const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createOrder,
    getMyOrders,
    getOrderById
} = require('../controllers/orderController');

// All order routes are protected
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
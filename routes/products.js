const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    getProducts,
    getProductById,
    getFeaturedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', protect, admin, upload.single('image'), createProduct);
router.put('/:id', protect, admin, upload.single('image'), updateProduct);
router.put('/:id/stock', protect, admin, updateProductStock);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
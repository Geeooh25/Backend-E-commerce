const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', protect, admin, upload.single('image'), createCategory);
router.put('/:id', protect, admin, upload.single('image'), updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
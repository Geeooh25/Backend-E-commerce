const Category = require('../models/Category');
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (category) {
            res.json({
                success: true,
                category
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide category name'
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }
        
        // Create slug from name
        const slug = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
        
        const categoryData = {
            name,
            slug,
            description: description || '',
            isActive: true
        };

        // Add image if uploaded
        if (req.file) {
            categoryData.image = req.file.path;
        }
        
        const category = await Category.create(categoryData);
        
        res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Update fields
        if (req.body.name) {
            category.name = req.body.name;
            category.slug = req.body.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
        }
        
        category.description = req.body.description || category.description;
        category.isActive = req.body.isActive !== undefined ? req.body.isActive : category.isActive;
        
        // Update image if new one uploaded
        if (req.file) {
            // Delete old image from cloudinary if exists
            if (category.image) {
                try {
                    const publicId = category.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error('Error deleting old image:', error);
                }
            }
            
            category.image = req.file.path;
        }
        
        const updatedCategory = await category.save();
        
        res.json({
            success: true,
            category: updatedCategory
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category has products
        const productsInCategory = await Product.countDocuments({ category: category.name });
        if (productsInCategory > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category that has products. Move or delete products first.'
            });
        }
        
        // Delete image from cloudinary
        if (category.image) {
            try {
                const publicId = category.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.error('Error deleting image:', error);
            }
        }
        
        await category.deleteOne();
        
        res.json({
            success: true,
            message: 'Category removed successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        console.log('Getting products...');
        
        const pageSize = 12;
        const page = Number(req.query.page) || 1;

        const keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i'
            }
        } : {};

        const category = req.query.category ? { category: req.query.category } : {};

        const count = await Product.countDocuments({ ...keyword, ...category });
        const products = await Product.find({ ...keyword, ...category })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        console.log(`Found ${products.length} products`);

        res.json({
            success: true,
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        console.error('Error in getProducts:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json({
                success: true,
                product
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
    } catch (error) {
        console.error('Error in getProductById:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ featured: true }).limit(8);
        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Error in getFeaturedProducts:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a product - UPDATED: No category validation
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        console.log('=== CREATE PRODUCT REQUEST ===');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        
        const { name, description, price, category, featured, inStock, stockQuantity } = req.body;

        // Validate ONLY required fields - NO category validation
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, description, price, and category'
            });
        }

        // Prepare product data - ACCEPT ANY CATEGORY
        const productData = {
            name,
            description,
            price: Number(price),
            category,  // Accept ANY category value - no validation
            featured: featured === 'true' || featured === true,
            inStock: inStock === 'true' || inStock === true,
            stockQuantity: Number(stockQuantity) || 0,
            isCombo: false,
            hasAddOns: false
        };

        // Handle image upload
        if (req.file) {
            productData.image = req.file.path;
            productData.imagePublicId = req.file.filename;
            console.log('✅ Image uploaded to Cloudinary:', req.file.path);
        } else {
            productData.image = '';
            console.log('⚠️ No image uploaded');
        }

        console.log('Product data to create:', productData);

        const product = await Product.create(productData);
        console.log('✅ Product created successfully with ID:', product._id);

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('❌ ERROR in createProduct:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (let field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        console.log('=== UPDATE PRODUCT REQUEST ===');
        console.log('Product ID:', req.params.id);
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Update fields - NO category validation
        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description;
        product.price = req.body.price ? Number(req.body.price) : product.price;
        product.category = req.body.category || product.category;  // Accept ANY category
        product.featured = req.body.featured !== undefined ? 
            (req.body.featured === 'true' || req.body.featured === true) : product.featured;
        product.inStock = req.body.inStock !== undefined ? 
            (req.body.inStock === 'true' || req.body.inStock === true) : product.inStock;
        product.stockQuantity = req.body.stockQuantity ? 
            Number(req.body.stockQuantity) : product.stockQuantity;

        // Update image if new one uploaded
        if (req.file) {
            // Delete old image from cloudinary if exists
            if (product.imagePublicId) {
                try {
                    await cloudinary.uploader.destroy(product.imagePublicId);
                    console.log('🗑️ Old image deleted from cloudinary');
                } catch (error) {
                    console.error('Error deleting old image:', error);
                }
            }
            
            product.image = req.file.path;
            product.imagePublicId = req.file.filename;
            console.log('✅ New image uploaded to Cloudinary:', req.file.path);
        }

        const updatedProduct = await product.save();
        console.log('✅ Product updated successfully:', updatedProduct._id);

        res.json({
            success: true,
            product: updatedProduct
        });
    } catch (error) {
        console.error('❌ ERROR in updateProduct:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        console.log('=== DELETE PRODUCT REQUEST ===');
        console.log('Product ID:', req.params.id);
        
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete image from cloudinary
        if (product.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(product.imagePublicId);
                console.log('🗑️ Image deleted from cloudinary');
            } catch (error) {
                console.error('Error deleting image:', error);
            }
        }

        await product.deleteOne();
        console.log('✅ Product deleted successfully');

        res.json({
            success: true,
            message: 'Product removed successfully'
        });
    } catch (error) {
        console.error('❌ ERROR in deleteProduct:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
const updateProductStock = async (req, res) => {
    try {
        console.log('=== UPDATE STOCK REQUEST ===');
        console.log('Product ID:', req.params.id);
        console.log('New stock:', req.body.stockQuantity);
        
        const { stockQuantity } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (stockQuantity === undefined || stockQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid stock quantity'
            });
        }

        product.stockQuantity = Number(stockQuantity);
        product.inStock = Number(stockQuantity) > 0;

        await product.save();
        console.log('✅ Stock updated successfully');

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('❌ ERROR in updateProductStock:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export all functions
module.exports = {
    getProducts,
    getProductById,
    getFeaturedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock
};
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // Get total counts
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        
        // Calculate total revenue
        const orders = await Order.find();
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        
        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name');

        // Get orders by status
        const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
        const confirmedOrders = await Order.countDocuments({ orderStatus: 'confirmed' });
        const preparingOrders = await Order.countDocuments({ orderStatus: 'preparing' });
        const readyOrders = await Order.countDocuments({ orderStatus: 'ready' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

        res.json({
            success: true,
            stats: {
                totalOrders,
                totalUsers,
                totalProducts,
                totalRevenue,
                recentOrders,
                ordersByStatus: {
                    pending: pendingOrders,
                    confirmed: confirmedOrders,
                    preparing: preparingOrders,
                    ready: readyOrders,
                    delivered: deliveredOrders,
                    cancelled: cancelledOrders
                }
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:orderId/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        order.orderStatus = status;
        
        // If order is delivered, set delivered date
        if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }
        
        // If order is cancelled
        if (status === 'cancelled') {
            // Optionally restore stock here
        }
        
        await order.save();
        
        // Try to send email notification (non-blocking)
        try {
            const { sendOrderStatusUpdateEmail } = require('../utils/emailService');
            const user = await User.findById(order.user);
            if (user && user.email) {
                sendOrderStatusUpdateEmail(order, user, status).catch(err => {
                    console.log('Status email sending failed:', err.message);
                });
            }
        } catch (emailError) {
            console.log('Email service not available:', emailError.message);
        }
        
        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllOrders,
    updateOrderStatus,
    getAllUsers
};
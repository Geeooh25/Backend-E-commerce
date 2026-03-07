const { sendOrderConfirmationEmail } = require('../utils/emailService');
const Order = require('../models/Order');
const User = require('../models/User');

const createOrder = async (req, res) => {
    try {
        console.log('Creating order for user:', req.user.id);
        console.log('Order data:', req.body);

        // Validate required fields
        if (!req.body.orderItems || req.body.orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items'
            });
        }

        // Ensure state has a value
        const shippingAddress = {
            ...req.body.shippingAddress,
            state: req.body.shippingAddress.state || 'Lagos'
        };

        const orderData = {
            user: req.user.id,
            orderItems: req.body.orderItems,
            shippingAddress: shippingAddress,
            paymentMethod: req.body.paymentMethod,
            itemsPrice: req.body.itemsPrice || 0,
            taxPrice: req.body.taxPrice || 0,
            deliveryPrice: req.body.deliveryPrice || 0,
            totalPrice: req.body.totalPrice || 0
        };

        console.log('Processed order data:', orderData);

        const order = await Order.create(orderData);
        
        console.log('Order created successfully with ID:', order._id);
        
        // Try to send email - only after order is created
        try {
            const { sendOrderConfirmationEmail } = require('../utils/emailService');
            const user = await User.findById(req.user.id);
            
            if (user && user.email) {
                await sendOrderConfirmationEmail(order, user);
                console.log('✅ Order confirmation email sent');
            }
        } catch (emailError) {
            console.log('Email sending failed (non-critical):', emailError.message);
        }
        
        res.status(201).json({
            success: true,
            order: {
                id: order._id,
                totalPrice: order.totalPrice,
                orderStatus: order.orderStatus,
                createdAt: order.createdAt
            }
        });
    } catch (error) {
        console.error('Order creation error details:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select('-__v');
        
        res.json({
            success: true,
            orders,
            count: orders.length
        });
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .select('-__v');
        
        if (order) {
            // Check if user is authorized to view this order
            if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this order'
                });
            }
            
            res.json({
                success: true,
                order
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Only admin can update order status
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update order status'
            });
        }

        order.orderStatus = req.body.status || order.orderStatus;
        
        if (req.body.status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        
        // Try to send status update email
        try {
            const { sendOrderStatusUpdateEmail } = require('../utils/emailService');
            const user = await User.findById(order.user);
            
            sendOrderStatusUpdateEmail(order, user, req.body.status).catch(err => {
                console.log('Status email sending failed:', err.message);
            });
        } catch (emailError) {
            console.log('Email service error:', emailError.message);
        }
        
        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus
};
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ============== MIDDLEWARE ==============

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key');
        req.adminId = decoded.adminId;
        req.adminRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Middleware to check admin role
const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.adminRole)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        next();
    };
};

// ============== PUBLIC ROUTES ==============

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = await Admin.findOne({ 
            $or: [{ username }, { email: username }],
            isActive: true 
        });
        
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        if (admin.lockUntil && admin.lockUntil > Date.now()) {
            return res.status(401).json({ success: false, message: 'Account is locked. Try again later.' });
        }
        
        const isMatch = await admin.comparePassword(password);
        
        if (!isMatch) {
            admin.loginAttempts += 1;
            if (admin.loginAttempts >= 5) {
                admin.lockUntil = Date.now() + 30 * 60 * 1000;
            }
            await admin.save();
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        admin.loginAttempts = 0;
        admin.lockUntil = undefined;
        admin.lastLogin = Date.now();
        await admin.save();
        
        const token = jwt.sign(
            { adminId: admin._id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET || 'admin-secret-key',
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                fullName: admin.fullName,
                role: admin.role,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Setup admin
router.route('/setup')
    .get(async (req, res) => {
        try {
            const adminExists = await Admin.findOne({ role: 'super_admin' });
            if (adminExists) {
                return res.status(200).json({ success: false, message: 'Admin already exists', exists: true });
            }
            res.status(200).json({
                success: true,
                message: 'Ready to create admin. Send POST request with admin details.',
                setup: {
                    method: 'POST',
                    url: '/api/admin/setup',
                    body: {
                        username: 'admin',
                        password: 'Admin123',
                        email: 'beedahttreats@gmail.com',
                        fullName: 'Administrator'
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    })
    .post(async (req, res) => {
        try {
            const adminExists = await Admin.findOne({ role: 'admin' });
            if (adminExists) {
                return res.json({ success: false, message: 'Admin already exists' });
            }
            
            const { username, password, email, fullName } = req.body;
            
            const superAdmin = new Admin({
                username: username || 'admin',
                email: email || 'beedahttreats@gmail.com',
                password: password || 'Admin123',
                fullName: fullName || 'Administrator',
                role: 'admin',
                permissions: ['manage_products', 'manage_orders', 'manage_users', 'manage_categories', 'view_reports']
            });
            
            await superAdmin.save();
            
            res.json({ 
                success: true, 
                message: 'Super admin created successfully',
                credentials: {
                    username: superAdmin.username,
                    password: password || 'Admin@123'
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });

// ============== ADMIN MANAGEMENT (Your existing code) ==============

// Get all admins (super_admin only)
router.get('/admins', verifyAdminToken, checkRole('super_admin'), async (req, res) => {
    try {
        const admins = await Admin.find().select('-password').sort('-createdAt');
        res.json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new admin (super_admin only)
router.post('/admins', verifyAdminToken, checkRole('admin'), async (req, res) => {
    try {
        const { username, email, password, fullName, role, permissions } = req.body;
        
        const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'Username or email already exists' });
        }
        
        const admin = new Admin({
            username,
            email,
            password,
            fullName,
            role: role || 'admin',
            permissions: permissions || [],
            createdBy: req.adminId
        });
        
        await admin.save();
        
        res.json({ 
            success: true, 
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                fullName: admin.fullName,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update admin (super_admin only)
router.put('/admins/:id', verifyAdminToken, checkRole('super_admin'), async (req, res) => {
    try {
        const { fullName, email, role, permissions, isActive } = req.body;
        const admin = await Admin.findById(req.params.id);
        
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        
        if (fullName) admin.fullName = fullName;
        if (email) admin.email = email;
        if (role) admin.role = role;
        if (permissions) admin.permissions = permissions;
        if (isActive !== undefined) admin.isActive = isActive;
        
        await admin.save();
        res.json({ success: true, message: 'Admin updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete admin (super_admin only)
router.delete('/admins/:id', verifyAdminToken, checkRole('super_admin'), async (req, res) => {
    try {
        if (req.params.id === req.adminId) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }
        
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        
        res.json({ success: true, message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get current admin profile
router.get('/profile', verifyAdminToken, async (req, res) => {
    try {
        const admin = await Admin.findById(req.adminId).select('-password');
        res.json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update profile
router.put('/profile', verifyAdminToken, async (req, res) => {
    try {
        const admin = await Admin.findById(req.adminId);
        if (req.body.fullName) admin.fullName = req.body.fullName;
        if (req.body.email) admin.email = req.body.email;
        await admin.save();
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Change password
router.post('/change-password', verifyAdminToken, async (req, res) => {
    try {
        const admin = await Admin.findById(req.adminId);
        const isMatch = await admin.comparePassword(req.body.currentPassword);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        
        admin.password = req.body.newPassword;
        await admin.save();
        
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============== ADD THESE MISSING ROUTES ==============

// ============== DASHBOARD STATS (for regular data) ==============
router.get('/dashboard', verifyAdminToken, async (req, res) => {
    try {
        console.log('📊 Getting dashboard stats...');
        
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        
        const recentOrders = await Order.find()
            .sort('-createdAt')
            .limit(5)
            .populate('user', 'name email');
        
        const orders = await Order.find();
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        
        const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
        const confirmedOrders = await Order.countDocuments({ orderStatus: 'confirmed' });
        const preparingOrders = await Order.countDocuments({ orderStatus: 'preparing' });
        const readyOrders = await Order.countDocuments({ orderStatus: 'ready' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

        res.json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                totalUsers,
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
        console.error('❌ Dashboard stats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============== USERS MANAGEMENT ==============
router.get('/users', verifyAdminToken, async (req, res) => {
    try {
        console.log('👥 Getting all users...');
        const users = await User.find().select('-password').sort('-createdAt');
        res.json({ success: true, users });
    } catch (error) {
        console.error('❌ Get users error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/users/:id', verifyAdminToken, async (req, res) => {
    try {
        const { name, email, phone, role } = req.body;
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (role) user.role = role;
        
        await user.save();
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('❌ Update user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/users/:id', verifyAdminToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        await user.deleteOne();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('❌ Delete user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/users/:id/make-admin', verifyAdminToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.role = 'admin';
        await user.save();
        res.json({ success: true, message: 'User is now an admin' });
    } catch (error) {
        console.error('❌ Make admin error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/users/:id/remove-admin', verifyAdminToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.role = 'user';
        await user.save();
        res.json({ success: true, message: 'Admin privileges removed' });
    } catch (error) {
        console.error('❌ Remove admin error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============== ORDERS MANAGEMENT ==============
router.get('/orders', verifyAdminToken, async (req, res) => {
    try {
        console.log('📦 Getting all orders...');
        const orders = await Order.find()
            .populate('user', 'name email phone')
            .sort('-createdAt');
        res.json({ success: true, orders });
    } catch (error) {
        console.error('❌ Get orders error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/orders/:orderId/status', verifyAdminToken, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        order.orderStatus = status;
        if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }
        
        await order.save();
        res.json({ success: true, message: 'Order status updated', order });
    } catch (error) {
        console.error('❌ Update order status error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============== NEWSLETTER MANAGEMENT ==============
const NewsletterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now },
    status: { type: String, default: 'active' }
});

const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);

router.get('/newsletter', verifyAdminToken, async (req, res) => {
    try {
        console.log('📧 Getting newsletter subscribers...');
        const subscribers = await Newsletter.find().sort('-subscribedAt');
        res.json({ success: true, subscribers });
    } catch (error) {
        console.error('❌ Get newsletter error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/newsletter/:id', verifyAdminToken, async (req, res) => {
    try {
        await Newsletter.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Subscriber deleted' });
    } catch (error) {
        console.error('❌ Delete newsletter error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============== QUICK ORDERS MANAGEMENT ==============
const QuickOrderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    details: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const QuickOrder = mongoose.models.QuickOrder || mongoose.model('QuickOrder', QuickOrderSchema);

router.get('/quick-orders', verifyAdminToken, async (req, res) => {
    try {
        console.log('⏱️ Getting quick orders...');
        const orders = await QuickOrder.find().sort('-createdAt');
        res.json({ success: true, orders });
    } catch (error) {
        console.error('❌ Get quick orders error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/quick-orders/:id/status', verifyAdminToken, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await QuickOrder.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        order.status = status;
        await order.save();
        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        console.error('❌ Update quick order error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/quick-orders/:id', verifyAdminToken, async (req, res) => {
    try {
        await QuickOrder.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Quick order deleted' });
    } catch (error) {
        console.error('❌ Delete quick order error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
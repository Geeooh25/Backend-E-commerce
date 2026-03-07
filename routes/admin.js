const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        
        // Find admin
        const admin = await Admin.findOne({ 
            $or: [{ username }, { email: username }],
            isActive: true 
        });
        
        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        // Check if account is locked
        if (admin.lockUntil && admin.lockUntil > Date.now()) {
            return res.status(401).json({ 
                success: false, 
                message: 'Account is locked. Try again later.' 
            });
        }
        
        // Verify password
        const isMatch = await admin.comparePassword(password);
        
        if (!isMatch) {
            // Increment login attempts
            admin.loginAttempts += 1;
            
            if (admin.loginAttempts >= 5) {
                admin.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
            }
            
            await admin.save();
            
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        // Reset login attempts on successful login
        admin.loginAttempts = 0;
        admin.lockUntil = undefined;
        admin.lastLogin = Date.now();
        await admin.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                adminId: admin._id, 
                username: admin.username,
                role: admin.role 
            },
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
        res.status(500).json({ 
            success: false, 
            message: 'Login failed' 
        });
    }
});

// Setup admin - handles both GET and POST
router.route('/setup')
    .get(async (req, res) => {
        try {
            const adminExists = await Admin.findOne({ role: 'super_admin' });
            
            if (adminExists) {
                return res.status(200).json({ 
                    success: false, 
                    message: 'Admin already exists',
                    exists: true 
                });
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
            
            // Use provided details or defaults
            const { username, password, email, fullName } = req.body;
            
            const superAdmin = new Admin({
                username: username || 'admin',
                email: email || 'beedahttreats@gmail.com',
                password: password || 'Admin123',
                fullName: fullName || 'Administrator',
                role: 'admin',
                permissions: [
                    'manage_products',
                    'manage_orders',
                    'manage_users',
                    'manage_categories',
                    'view_reports'
                ]
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

// ============== PROTECTED ROUTES ==============

// Get all admins (super_admin only)
router.get('/admins', verifyAdminToken, checkRole('super_admin'), async (req, res) => {
    try {
        const admins = await Admin.find()
            .select('-password')
            .sort('-createdAt');
        res.json({ success: true, admins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new admin (super_admin only)
router.post('/admins', verifyAdminToken, checkRole('admin'), async (req, res) => {
    try {
        const { username, email, password, fullName, role, permissions } = req.body;
        
        // Check if admin exists
        const existingAdmin = await Admin.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingAdmin) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username or email already exists' 
            });
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
        const adminId = req.params.id;
        
        const admin = await Admin.findById(adminId);
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
        const adminId = req.params.id;
        
        // Don't allow deleting yourself
        if (adminId === req.adminId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete your own account' 
            });
        }
        
        const admin = await Admin.findByIdAndDelete(adminId);
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
        const { fullName, email } = req.body;
        
        const admin = await Admin.findById(req.adminId);
        if (fullName) admin.fullName = fullName;
        if (email) admin.email = email;
        
        await admin.save();
        
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Change password
router.post('/change-password', verifyAdminToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const admin = await Admin.findById(req.adminId);
        
        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }
        
        admin.password = newPassword;
        await admin.save();
        
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============== DASHBOARD STATS ==============

// Get dashboard stats
router.get('/dashboard/stats', verifyAdminToken, async (req, res) => {
    try {
        const Product = mongoose.model('Product');
        const Order = mongoose.model('Order');
        const User = mongoose.model('User');
        
        const [
            totalProducts,
            totalOrders,
            totalUsers,
            recentOrders,
            lowStockProducts
        ] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments(),
            Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
            Product.find({ stock: { $lt: 10 } }).limit(5)
        ]);
        
        // Get today's orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = await Order.find({
            createdAt: { $gte: today }
        });
        
        const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        res.json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                totalUsers,
                todayOrders: todayOrders.length,
                todayRevenue,
                recentOrders,
                lowStock: lowStockProducts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
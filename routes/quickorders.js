const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, admin } = require('../middleware/auth');  // ✅ Use existing auth

// Quick Order Schema
const quickOrderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    details: String,
    status: { type: String, default: 'pending', enum: ['pending', 'completed', 'cancelled'] },
    createdAt: { type: Date, default: Date.now }
});

const QuickOrder = mongoose.models.QuickOrder || mongoose.model('QuickOrder', quickOrderSchema);

// Create quick order (public)
router.post('/', async (req, res) => {
    try {
        const { name, phone, details } = req.body;
        const order = await QuickOrder.create({ name, phone, details });
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all quick orders (admin only) - ✅ Use protect + admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await QuickOrder.find().sort('-createdAt');
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update order status (admin only)
router.put('/:id/status', protect, admin, async (req, res) => {
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
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete quick order (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await QuickOrder.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Quick order deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
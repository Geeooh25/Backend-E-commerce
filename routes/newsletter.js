const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyAdminToken } = require('../middleware/adminAuth');

// Newsletter Schema
const newsletterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now },
    status: { type: String, default: 'active' }
});

const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', newsletterSchema);

// Subscribe to newsletter (public)
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if already subscribed
        let subscriber = await Newsletter.findOne({ email });
        
        if (subscriber) {
            if (subscriber.status === 'unsubscribed') {
                subscriber.status = 'active';
                await subscriber.save();
            }
            return res.json({ success: true, message: 'Already subscribed' });
        }
        
        // Create new subscriber
        subscriber = await Newsletter.create({ email });
        
        // You could add email notification here
        
        res.json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all subscribers (admin only)
router.get('/', verifyAdminToken, async (req, res) => {
    try {
        const subscribers = await Newsletter.find().sort('-subscribedAt');
        res.json({ success: true, subscribers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete subscriber (admin only)
router.delete('/:id', verifyAdminToken, async (req, res) => {
    try {
        await Newsletter.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Subscriber deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
const axios = require('axios');
const Order = require('../models/Order');

// Initialize Paystack payment
const initializePayment = async (req, res) => {
    try {
        const { email, amount, orderId } = req.body;

        console.log('Initializing payment:', { email, amount, orderId });

        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email: email,
            amount: amount * 100,
            metadata: {
                orderId: orderId,
                userId: req.user.id
            },
            callback_url: `${process.env.FRONTEND_URL}/payment-callback.html`
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            success: true,
            authorization_url: response.data.data.authorization_url,
            reference: response.data.data.reference
        });
    } catch (error) {
        console.error('Paystack error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Payment initialization failed'
        });
    }
};

// Verify payment
const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;

        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        const { data } = response.data;
        
        if (data.status === 'success') {
            const order = await Order.findById(data.metadata.orderId);
            if (order) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: data.id,
                    status: data.status,
                    reference: data.reference
                };
                await order.save();
            }
            
            res.json({ success: true, data });
        } else {
            res.json({ success: false, message: 'Payment failed' });
        }
    } catch (error) {
        console.error('Verification error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Verification failed'
        });
    }
};

module.exports = { initializePayment, verifyPayment };

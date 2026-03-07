const axios = require('axios');
const Order = require('../models/Order');

// Initialize Paystack payment
const initializePayment = async (req, res) => {
    try {
        const { email, amount, orderId } = req.body;

        console.log('Initializing payment:', { email, amount, orderId });

        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email: email,
            amount: amount * 100, // Paystack amount is in kobo
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

        console.log('Paystack response:', response.data);

        res.json({
            success: true,
            authorization_url: response.data.data.authorization_url,
            reference: response.data.data.reference
        });
    } catch (error) {
        console.error('Paystack error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Payment initialization failed',
            error: error.response?.data || error.message
        });
    }
};

// Verify payment
const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;

        console.log('Verifying payment reference:', reference);

        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        console.log('Verification response:', response.data);

        const { data } = response.data;
        
        if (data.status === 'success') {
            // Update order payment status
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
                console.log('Order updated:', order._id);
            }
            
            res.json({ success: true, data });
        } else {
            res.json({ success: false, message: 'Payment failed' });
        }
    } catch (error) {
        console.error('Verification error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Verification failed',
            error: error.response?.data || error.message
        });
    }
};

module.exports = { initializePayment, verifyPayment };
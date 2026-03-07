const twilio = require('twilio');
const Order = require('../models/Order');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const sendOrderConfirmationSMS = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId).populate('user');

        const message = `🍪 Beedaht Sweet Treats\n\nOrder #${order._id.slice(-6)} Confirmed!\nTotal: ₦${order.totalPrice}\nStatus: ${order.orderStatus}\n\nThank you for your order!`;

        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: order.user.phone
        });

        res.json({ success: true, message: 'SMS sent' });
    } catch (error) {
        console.error('SMS error:', error);
        res.status(500).json({ success: false, message: 'SMS failed' });
    }
};

module.exports = { sendOrderConfirmationSMS };
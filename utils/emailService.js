const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ganiyuusman43@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Email templates
const templates = {
    orderConfirmation: (order, user) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f7f7f7;">
            <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                <div style="background: #FFB88C; padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
                    <h1 style="margin: 0; color: #1F1F1F; font-size: 28px;">🍪 Beedaht Sweet Treats</h1>
                </div>
                <div style="padding: 40px;">
                    <h2 style="color: #1F1F1F; margin: 0 0 20px;">Order Confirmation</h2>
                    <p style="color: #555; line-height: 1.6;">Hello ${user.name},</p>
                    <p style="color: #555; line-height: 1.6;">Your order #${order._id.toString().slice(-6)} has been placed successfully!</p>
                    <p style="color: #555; line-height: 1.6;">Total: ₦${order.totalPrice}</p>
                    <p style="color: #555; line-height: 1.6;">We'll notify you when your order is ready.</p>
                </div>
            </div>
        </body>
        </html>
    `
};

// Firebase handles emails automatically
// This is just a wrapper for logging

const sendOrderConfirmationEmail = async (order, user) => {
    try {
        // Firebase automatically sends:
        // - Email verification
        // - Password reset emails
        
        // For order confirmations, just log it (you can add a real email service later)
        console.log('✅ Order placed - confirmation would be sent to:', user.email);
        console.log('Order ID:', order._id);
        console.log('Total:', order.totalPrice);
        
        return { success: true };
    } catch (error) {
        console.error('Error:', error);
        return { success: false };
    }
};

module.exports = { sendOrderConfirmationEmail };

module.exports = { sendOrderConfirmationEmail };
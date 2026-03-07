const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let html = '';
        switch (options.template) {
            case 'orderConfirmation':
                html = `
                    <h1>Order Confirmation</h1>
                    <p>Dear ${options.data.customerName},</p>
                    <p>Thank you for your order! Your order has been received and is being processed.</p>
                    <h3>Order Details:</h3>
                    <p>Order ID: ${options.data.order._id}</p>
                    <p>Total Amount: ₦${options.data.order.totalPrice}</p>
                    <p>We will notify you when your order is ready for pickup/delivery.</p>
                    <br>
                    <p>Best regards,</p>
                    <p>Beedaht Sweet Treats Team</p>
                `;
                break;
        }

        const message = {
            from: 'Beedaht Sweet Treats <noreply@beedaht.com>',
            to: options.email,
            subject: options.subject,
            html: html
        };

        await transporter.sendMail(message);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Email error:', error);
    }
};

module.exports = sendEmail;
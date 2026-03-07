const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email options
        const mailOptions = {
            from: '"Beedaht Sweet Treats" <noreply@beedaht.com>',
            to: options.email,
            subject: options.subject,
            html: options.html
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent. Preview URL:', nodemailer.getTestMessageUrl(info));
        return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return { success: false, error };
    }
};

module.exports = sendEmail;
const sgMail = require('@sendgrid/mail');

const sendEmail = async (options) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
        to: options.email,
        from: 'orders@beedaht.com', // Verified sender in SendGrid
        subject: options.subject,
        html: options.html
    };
    
    try {
        await sgMail.send(msg);
        console.log('✅ Email sent via SendGrid');
        return { success: true };
    } catch (error) {
        console.error('❌ SendGrid error:', error);
        return { success: false, error };
    }
};

module.exports = sendEmail;
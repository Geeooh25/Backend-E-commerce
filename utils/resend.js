const { Resend } = require('resend');

// Initialize Resend with your API key
const resend = new Resend('re_RHZaHFxn_HeVzbJUfVGBFdotCNX3b538R');

const sendEmail = async (options) => {
    try {
        console.log('📧 Attempting to send email to:', options.email);
        
        const { data, error } = await resend.emails.send({
            from: 'Beedaht Sweet Treats <onboarding@resend.dev>',
            to: [options.email],
            subject: options.subject,
            html: options.html
        });

        if (error) {
            console.error('❌ Resend error:', error);
            return { success: false, error };
        }

        console.log('✅ Email sent successfully via Resend!');
        console.log('📨 Message ID:', data.id);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Resend error:', error);
        return { success: false, error };
    }
};

module.exports = sendEmail;
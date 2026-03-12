// Telegram notification function (reuse the same one)
async function sendTelegramMessage(message) {
    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('⚠️ Telegram not configured');
        return;
    }
    
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        console.log('✅ Telegram notification sent');
    } catch (error) {
        console.error('❌ Telegram error:', error);
    }
}

// In your newsletter subscription function
async function subscribeNewsletter(req, res) {
    try {
        const { email } = req.body;
        
        // Save to database
        const subscriber = await Newsletter.create({ email });
        
        // Send Telegram notification
        const message = `
📧 <b>NEW NEWSLETTER SUBSCRIBER!</b>

<b>Email:</b> ${email}
<b>Time:</b> ${new Date().toLocaleString()}
<b>Total subscribers:</b> +1 🎉

<a href="https://beedahttreats.netlify.app/admin.html#newsletter">View in Admin Panel</a>
        `;
        
        await sendTelegramMessage(message);
        
        res.json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Newsletter error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// In your quick order function
async function createQuickOrder(req, res) {
    try {
        const { name, phone, details } = req.body;
        
        // Save to database
        const order = await QuickOrder.create({ name, phone, details });
        
        // Send Telegram notification
        const message = `
📝 <b>NEW QUICK ORDER REQUEST!</b>

<b>Name:</b> ${name}
<b>Phone:</b> ${phone}
<b>Details:</b> ${details || 'No details'}

⏰ ${new Date().toLocaleString()}

<a href="https://beedahttreats.netlify.app/admin.html#quick-orders">View in Admin Panel</a>
        `;
        
        await sendTelegramMessage(message);
        
        res.json({ success: true, order });
    } catch (error) {
        console.error('Quick order error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}
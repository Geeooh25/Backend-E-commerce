// In your quick order function
async function createQuickOrder(req, res) {
    try {
        const { name, phone, details } = req.body;
        
        // Save to database
        const order = await QuickOrder.create({ name, phone, details });
        
        // ✅ Send Telegram notification
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
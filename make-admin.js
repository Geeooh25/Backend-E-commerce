// make-admin.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function makeAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beedaht');
        console.log('Connected to MongoDB');

        const email = 'beedahttreats@gmail.com'; // admin EMAIL
        
        const user = await User.findOne({ email });
        
        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`User ${user.email} is now an admin!`);
        } else {
            console.log('User not found. Please check the email.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

makeAdmin();


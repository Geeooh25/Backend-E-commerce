const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors'); 
const helmet = require('helmet'); 
const compression = require('compression'); 
const rateLimit = require('express-rate-limit'); 
require('dotenv').config(); 
 
// Import routes 
const authRoutes = require('./routes/auth'); 
const firebaseAuthRoutes = require('./routes/firebaseAuth'); 
const productRoutes = require('./routes/products'); 
const orderRoutes = require('./routes/orders'); 
const categoryRoutes = require('./routes/categories'); 
const adminRoutes = require('./routes/admin'); 
const paymentRoutes = require('./routes/payment'); 
 
const app = express(); 
 
// Security middleware 
app.use(helmet()); 
app.use(compression()); 
 
// Rate limiting 
const limiter = rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15 minutes 
    max: 100 // limit each IP to 100 requests per windowMs 
}); 
app.use('/api/', limiter); 
 
// CORS Configuration - UPDATED FOR NETLIFY 
const corsOptions = { 
    origin: [ 
        'https://beedahttreats.netlify.app',  // Your Netlify frontend 
        'http://localhost:5500',               // Local development 
        'http://127.0.0.1:5500',               // Local development alternative 
        'http://localhost:3000'                 // Alternative local port 
    ], 
    credentials: true, 
    optionsSuccessStatus: 200 
}; 
app.use(cors(corsOptions)); 
 
// Body parser middleware 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
 
// Database connection 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}) 
.then(() = MongoDB connected successfully')) 
.catch(err = MongoDB connection error:', err)); 
 
// Routes 
app.use('/api/auth', authRoutes); 
app.use('/api/auth/firebase', firebaseAuthRoutes); 
app.use('/api/products', productRoutes); 
app.use('/api/orders', orderRoutes); 
app.use('/api/categories', categoryRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/payments', paymentRoutes); 
 
// ========== DEBUG ENDPOINT - MUST BE BEFORE 404 HANDLER ========== 
app.get('/api/debug/mongo', async (req, res) =
    try { 
        // Check if mongoose is connected 
        const state = mongoose.connection.readyState; 
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting 
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting']; 
 
        // Try a simple operation 
        let dbStatus = 'unknown'; 
        let dbError = null; 
 
        if (state === 1) { 
            try { 
                // Try to count users (lightweight operation) 
                const User = mongoose.model('User'); 
                const count = await User.countDocuments(); 
                dbStatus = `connected - found ${count} users`; 
            } catch (err) { 
                dbStatus = 'error'; 
                dbError = err.message; 
            } 
        } 
 
        res.json({ 
            success: true, 
            readyState: state, 
            dbStatus: dbStatus, 
            dbError: dbError, 
            host: mongoose.connection.host, 
            name: mongoose.connection.name, 
            timestamp: new Date().toISOString() 
        }); 
    } catch (error) { 
        res.status(500).json({ 
            success: false, 
            error: error.message 
        }); 
    } 
}); 
 
// ========== ERROR HANDLING MIDDLEWARE ========== 
app.use((err, req, res, next) =
    console.error('? Error:', err.stack); 
        success: false, 
    }); 
}); 
 
// ========== 404 HANDLER - MUST BE LAST ========== 
app.use('*', (req, res) =
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    }); 
}); 
 
app.listen(PORT, () =
    console.log(`?? Server running on port ${PORT}`); 
}); 

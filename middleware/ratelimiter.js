const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: {
        success: false,
        message: 'Too many login attempts, please try again later'
    }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

module.exports = { authLimiter, apiLimiter };
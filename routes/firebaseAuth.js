const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    firebaseRegister,
    firebaseLogin,
    firebaseForgotPassword,
    firebaseSendVerification,
    firebaseCheckVerification,
    firebaseUpdateEmail,
    firebaseUpdatePassword,
    firebaseDeleteUser,
    resendVerificationEmail
} = require('../controllers/firebaseAuthController');

// Public routes
router.post('/register', firebaseRegister);
router.post('/login', firebaseLogin);
router.post('/forgot-password', firebaseForgotPassword);

// Protected routes
router.post('/send-verification', protect, firebaseSendVerification);
router.post('/check-verification', protect, firebaseCheckVerification);
router.post('/update-email', protect, firebaseUpdateEmail);
router.post('/update-password', protect, firebaseUpdatePassword);
router.post('/delete-user', protect, firebaseDeleteUser);
router.post('/resend-verification', protect, resendVerificationEmail);

module.exports = router;
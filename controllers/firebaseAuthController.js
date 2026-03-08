const { auth } = require('../config/firebase');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to format Nigerian phone numbers to E.164 format
const formatPhoneNumber = (phone) => {
    if (!phone || phone.trim() === '') {
        return null;
    }
    
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    console.log('Phone digits only:', digitsOnly);
    
    // Format to E.164 (e.g., +2348012345678 for Nigeria)
    if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
        // Nigerian number: 08012345678 -> +2348012345678
        return '+234' + digitsOnly.substring(1);
    } else if (digitsOnly.length === 10) {
        // If 10 digits, assume Nigerian without leading 0
        return '+234' + digitsOnly;
    } else if (digitsOnly.length === 13 && digitsOnly.startsWith('234')) {
        // Already has country code without plus: 2348012345678 -> +2348012345678
        return '+' + digitsOnly;
    } else if (digitsOnly.length === 14 && digitsOnly.startsWith('234')) {
        // Already has country code with plus in digits? unlikely
        return '+' + digitsOnly;
    } else if (digitsOnly.length > 8) {
        // For other lengths, just add + if not present
        return digitsOnly.startsWith('+') ? phone : '+' + digitsOnly;
    }
    
    return null; // Return null if invalid
};

// @desc    Register with Firebase
// @route   POST /api/auth/firebase/register
// @access  Public
const firebaseRegister = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        console.log('Registration attempt:', { name, email, phone });

        // Check if user exists in MongoDB
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Format phone number for Firebase (E.164 format)
        const formattedPhone = formatPhoneNumber(phone);
        console.log('Formatted phone for Firebase:', formattedPhone);

        // Prepare user data for Firebase
        const userData = {
            email,
            password,
            displayName: name
        };
        
        // Only add phone if we have a valid formatted number
        if (formattedPhone) {
            userData.phoneNumber = formattedPhone;
        }

        // Create user in Firebase
        const firebaseUser = await auth.createUser(userData);
        console.log('✅ Firebase user created with UID:', firebaseUser.uid);

        // Generate email verification link
        const verificationLink = await auth.generateEmailVerificationLink(email);
        console.log('✅ Verification link generated for:', email);

        // Save user to MongoDB
        const user = await User.create({
            name,
            email,
            password,
            phone: phone || '', // Store original phone in MongoDB
            firebaseUid: firebaseUser.uid,
            isVerified: false
        });

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: false,
                firebaseUid: firebaseUser.uid
            }
        });

    } catch (error) {
        console.error('❌ Firebase register error:', error);
        
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        
        if (error.code === 'auth/invalid-phone-number') {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format. Please use a valid Nigerian number (e.g., 08012345678)'
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Login with Firebase
// @route   POST /api/auth/firebase/login
// @access  Public
const firebaseLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        console.log('=== FIREBASE LOGIN REQUEST ===');
        console.log('Token received:', idToken ? idToken.substring(0, 20) + '...' : 'No token');

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'No ID token provided'
            });
        }

        // Verify the Firebase ID token
        console.log('Verifying token...');
        const decodedToken = await auth.verifyIdToken(idToken);
        console.log('✅ Token verified successfully');
        console.log('Decoded token:', {
            uid: decodedToken.uid,
            email: decodedToken.email,
            email_verified: decodedToken.email_verified
        });

        const { uid, email, name, email_verified } = decodedToken;

        // Find or create user in MongoDB
        let user = await User.findOne({ firebaseUid: uid });
        
        if (!user) {
            console.log('User not found by UID, trying email...');
            user = await User.findOne({ email });
            if (user) {
                console.log('✅ Found user by email, linking with Firebase');
                user.firebaseUid = uid;
                user.isVerified = email_verified || false;
                await user.save();
            } else {
                console.log('Creating new user in MongoDB');
                user = await User.create({
                    name: name || email.split('@')[0],
                    email,
                    firebaseUid: uid,
                    isVerified: email_verified || false,
                    password: Math.random().toString(36) // Random password since Firebase handles auth
                });
                console.log('✅ New user created in MongoDB');
            }
        }
        const { sendEmail, templates } = require('../utils/emailService');



// Generate verification link
const verificationLink = await auth.generateEmailVerificationLink(email);
console.log('✅ Verification link generated:', verificationLink);

// Send email using Gmail
try {
    await sendEmail(
        email,
        'Verify your email - Beedaht Sweet Treats',
        templates.verification(name, verificationLink)
    );
    console.log('✅ Verification email sent via Gmail');
} catch (emailError) {
    console.log('⚠️ Email sending failed:', emailError.message);
    // Don't fail registration if email fails
}

        // Generate your JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });

        console.log('✅ Login successful for:', email);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: email_verified || false,
                firebaseUid: uid
            }
        });

    } catch (error) {
        console.error('❌ Firebase login error:', {
            name: error.name,
            code: error.code,
            message: error.message
        });
        
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                success: false,
                message: 'Session expired. Please login again.'
            });
        }
        
        if (error.code === 'auth/argument-error') {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token format'
            });
        }
        
        res.status(401).json({
            success: false,
            message: 'Authentication failed: ' + error.message
        });
    }
};

// @desc    Send password reset email
// @route   POST /api/auth/firebase/forgot-password
// @access  Public
const firebaseForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email'
            });
        }

        // Get user from Firebase to get name
        let userName = 'there';
        try {
            const userRecord = await auth.getUserByEmail(email);
            userName = userRecord.displayName || 'there';
            console.log('User found in Firebase:', email);
        } catch (error) {
            // User not found in Firebase s
            console.log('User not found in Firebase for email:', email);
        }

        // Generate password reset link
        const resetLink = await auth.generatePasswordResetLink(email);
        console.log('✅ Password reset link generated for:', email);
        console.log('Reset link:', resetLink);

        

        res.json({
            success: true,
            message: 'If your email is registered, you will receive a reset link',
            resetLink: resetLink 
        });

    } catch (error) {
        console.error('Firebase forgot password error:', error);
        
        // Always return success for security (don't reveal if email exists)
        res.json({
            success: true,
            message: 'If your email is registered, you will receive a reset link'
        });
    }
};

// @desc    Send email verification (manual trigger)
// @route   POST /api/auth/firebase/send-verification
// @access  Private
const firebaseSendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email'
            });
        }

        // Get user from Firebase to get name
        let userName = 'there';
        try {
            const userRecord = await auth.getUserByEmail(email);
            userName = userRecord.displayName || 'there';
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const verificationLink = await auth.generateEmailVerificationLink(email);
        console.log('✅ Verification link generated for:', email);
        console.log('Verification link:', verificationLink);

        res.json({
            success: true,
            message: 'Verification email sent successfully',
            verificationLink: verificationLink // Only for development
        });

    } catch (error) {
        console.error('Firebase verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Check if email is verified
// @route   POST /api/auth/firebase/check-verification
// @access  Private
const firebaseCheckVerification = async (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: 'Please provide user UID'
            });
        }

        const userRecord = await auth.getUser(uid);
        
        res.json({
            success: true,
            isVerified: userRecord.emailVerified
        });

    } catch (error) {
        console.error('Firebase check verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user email in Firebase
// @route   POST /api/auth/firebase/update-email
// @access  Private
const firebaseUpdateEmail = async (req, res) => {
    try {
        const { uid, newEmail } = req.body;

        if (!uid || !newEmail) {
            return res.status(400).json({
                success: false,
                message: 'Please provide UID and new email'
            });
        }

        await auth.updateUser(uid, {
            email: newEmail
        });

        // Send verification for new email
        const verificationLink = await auth.generateEmailVerificationLink(newEmail);
        console.log('✅ New verification email sent to:', newEmail);

        res.json({
            success: true,
            message: 'Email updated successfully. Please verify your new email.'
        });

    } catch (error) {
        console.error('Firebase update email error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user password in Firebase
// @route   POST /api/auth/firebase/update-password
// @access  Private
const firebaseUpdatePassword = async (req, res) => {
    try {
        const { uid, newPassword } = req.body;

        if (!uid || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide UID and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        await auth.updateUser(uid, {
            password: newPassword
        });

        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Firebase update password error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete user from Firebase
// @route   POST /api/auth/firebase/delete-user
// @access  Private
const firebaseDeleteUser = async (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: 'Please provide user UID'
            });
        }

        await auth.deleteUser(uid);

        // Also delete from MongoDB
        await User.findOneAndDelete({ firebaseUid: uid });

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Firebase delete user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/firebase/resend-verification
// @access  Public
const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email'
            });
        }

        // Get user from Firebase to get name
        let userName = 'there';
        try {
            const userRecord = await auth.getUserByEmail(email);
            userName = userRecord.displayName || 'there';
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new verification link
        const verificationLink = await auth.generateEmailVerificationLink(email);
        console.log('✅ New verification link generated for:', email);

        res.json({
            success: true,
            message: 'Verification email sent successfully',
            verificationLink: verificationLink // Only for development
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export all functions
module.exports = {
    firebaseRegister,
    firebaseLogin,
    firebaseForgotPassword,
    firebaseSendVerification,
    firebaseCheckVerification,
    firebaseUpdateEmail,
    firebaseUpdatePassword,
    firebaseDeleteUser,
    resendVerificationEmail
}; 
// Add this at the top of your firebaseRegister function 
// Make sure to add these headers before res.json: 
res.header('Access-Control-Allow-Origin', 'https://beedahttreats.netlify.app'); 
res.header('Access-Control-Allow-Credentials', true); 

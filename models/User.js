const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number']
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpire: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

// Add to userSchema
wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
}]
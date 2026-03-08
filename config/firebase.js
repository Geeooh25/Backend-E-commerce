const admin = require('firebase-admin');

let serviceAccount;

// Check if we're in production (Railway/Render) or development (local)
if (process.env.NODE_ENV === 'production') {
    // On Railway/Render - use environment variables
    console.log('🔥 Using Firebase environment variables');
    
    // Handle private key properly - it might have literal \n or actual newlines
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // If private key exists, clean it up
    if (privateKey) {
        // Replace literal '\n' strings with actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
        console.log('✅ Firebase private key loaded and formatted');
    } else {
        console.error('❌ FIREBASE_PRIVATE_KEY is missing!');
    }
    
    serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
        universe_domain: "googleapis.com"
    };
    
    // Log which variables exist (without exposing values)
    console.log('📋 Firebase env vars check:', {
        project_id: !!process.env.FIREBASE_PROJECT_ID,
        private_key_id: !!process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: !!process.env.FIREBASE_PRIVATE_KEY,
        client_email: !!process.env.FIREBASE_CLIENT_EMAIL,
        client_id: !!process.env.FIREBASE_CLIENT_ID,
        client_cert_url: !!process.env.FIREBASE_CLIENT_CERT_URL
    });
    
} else {
    // Local development - use the JSON file
    console.log('🔥 Using local Firebase JSON file');
    try {
        serviceAccount = require('../serviceAccountKey.json');
        console.log('✅ Local Firebase JSON loaded');
    } catch (err) {
        console.error('❌ Failed to load local Firebase JSON:', err.message);
    }
}

// Initialize Firebase Admin
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
}

// Initialize Auth
const auth = admin.auth();

module.exports = { admin, auth };
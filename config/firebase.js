const admin = require('firebase-admin');

let serviceAccount;

// Check if we're in production (Render) or development (local)
if (process.env.NODE_ENV === 'production') {
    // On Render - use environment variables
    console.log('🔥 Using Firebase environment variables');
    
    serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
        universe_domain: "googleapis.com"
    };
} else {
    // Local development - use the JSON file
    console.log('🔥 Using local Firebase JSON file');
    serviceAccount = require('../serviceAccountKey.json');
}

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Initialize Auth
const auth = admin.auth();

module.exports = { admin, auth };
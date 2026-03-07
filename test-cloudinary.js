const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key exists:', !!process.env.CLOUDINARY_API_KEY);

async function testCloudinary() {
    try {
        const result = await cloudinary.uploader.upload('https://via.placeholder.com/300', {
            folder: 'beedaht-test'
        });
        console.log('✅ Cloudinary working! Uploaded:', result.secure_url);
    } catch (error) {
        console.error('❌ Cloudinary error:', error);
    }
}

testCloudinary();
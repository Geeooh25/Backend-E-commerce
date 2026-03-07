const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');

const defaultCategories = [
    { 
        name: 'small-chops', 
        slug: 'small-chops', 
        description: 'Small chops and snacks including meat pies, puff puff, and sausage rolls',
        isActive: true
    },
    { 
        name: 'cakes', 
        slug: 'cakes', 
        description: 'Delicious cakes for all occasions - birthdays, weddings, and parties',
        isActive: true
    },
    { 
        name: 'cookies', 
        slug: 'cookies', 
        description: 'Fresh baked cookies, biscuits, and crunchy treats',
        isActive: true
    },
    { 
        name: 'pastries', 
        slug: 'pastries', 
        description: 'Flaky pastries, croissants, and sweet baked goods',
        isActive: true
    },
    { 
        name: 'drinks', 
        slug: 'drinks', 
        description: 'Refreshing beverages including zobo, chapman, and smoothies',
        isActive: true
    },
    { 
        name: 'combos', 
        slug: 'combos', 
        description: 'Special combo packages and meal deals',
        isActive: true
    }
];

async function addCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beedaht');
        console.log('✅ Connected to MongoDB');

        let added = 0;
        let skipped = 0;

        for (const cat of defaultCategories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) {
                await Category.create(cat);
                console.log(`✅ Added category: ${cat.name}`);
                added++;
            } else {
                console.log(`⏭️ Category already exists: ${cat.name}`);
                skipped++;
            }
        }

        console.log('\n=== Summary ===');
        console.log(`✅ Added: ${added} categories`);
        console.log(`⏭️ Skipped: ${skipped} categories`);
        console.log('✅ Default categories added successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addCategories();
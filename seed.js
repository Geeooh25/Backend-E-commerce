// seed.js
const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const products = [
    // Small Chops
    {
        name: "Meat Pie",
        category: "small-chops",
        price: 1000,
        image: "./IMAGE/MEAT PIE.jpg",
        description: "Flaky pastry filled with seasoned minced meat.",
        featured: true,
        inStock: true,
        stockQuantity: 50
    },
    {
        name: "Snowcap Doughnut",
        category: "small-chops",
        price: 1500,
        image: "./IMAGE/snowcap doughnut new.jpg",
        description: "Nigerian ring dough filled with powdered sweet milk.",
        featured: true,
        inStock: true,
        stockQuantity: 30
    },
    {
        name: "Puff Puff",
        category: "small-chops",
        price: 1000,
        image: "./IMAGE/FRESH PUFF PUFF.jpg",
        description: "Soft, fluffy Nigerian dough balls, lightly sweetened.",
        featured: true,
        inStock: true,
        stockQuantity: 40
    },
    {
        name: "Glizing Doughnuts (3pcs)",
        category: "small-chops",
        price: 3500,
        image: "./IMAGE/glizing doughnuts.jpg",
        description: "Yummy glizing doughnut.",
        featured: true,
        inStock: true,
        stockQuantity: 25
    },
    {
        name: "Potato Fries",
        category: "small-chops",
        price: 1000,
        image: "./IMAGE/POTATO CHIPS.JPG",
        description: "Crunchy potato fries.",
        featured: true,
        inStock: true,
        stockQuantity: 45
    },
    {
        name: "Sausage Roll (4pcs)",
        category: "small-chops",
        price: 1200,
        image: "./IMAGE/SAUSAGE ROLL.jpg",
        description: "Flaky pastry wrapped around savory sausage.",
        featured: true,
        inStock: true,
        stockQuantity: 35
    },
    {
        name: "Milky Doughnuts (2pcs)",
        category: "small-chops",
        price: 2000,
        image: "./IMAGE/milky doughnut.jpg",
        description: "Nigerian ring dough filled with powdered sweet milk.",
        featured: true,
        inStock: true,
        stockQuantity: 30
    },
    {
        name: "Chin Chin (chocolate & plain)",
        category: "small-chops",
        price: 1000,
        image: "./IMAGE/CHINchin new.jpg",
        description: "Crunchy Nigerian snack with perfect sweetness.",
        featured: true,
        inStock: true,
        stockQuantity: 50
    },
    {
        name: "Snowcap Puff Puff",
        category: "small-chops",
        price: 1000,
        image: "./IMAGE/SNOWCAP PUFF pUFF 2.jpg",
        description: "Fluffy round dough with powdered flavour.",
        featured: true,
        inStock: true,
        stockQuantity: 40
    },
    
    // Cakes
    {
        name: "Red Velvet Cake",
        category: "cakes",
        price: 8000,
        image: "./IMAGE/RED VELVET.jpg",
        description: "Moist red velvet cake with cream cheese frosting.",
        featured: true,
        inStock: true,
        stockQuantity: 10
    },
    {
        name: "Rich Chocolate Cake",
        category: "cakes",
        price: 4000,
        image: "./IMAGE/CHOCOLATE CAKE.jpg",
        description: "Rich creamy chocolate cake.",
        featured: true,
        inStock: true,
        stockQuantity: 15
    },
    {
        name: "Fruit Cake",
        category: "cakes",
        price: 8000,
        image: "./IMAGE/FRUIT tray 2.jpg",
        description: "Traditional Nigerian fruit cake with mixed fruits.",
        featured: true,
        inStock: true,
        stockQuantity: 8
    },
    {
        name: "Cupcakes (4pcs)",
        category: "cakes",
        price: 3000,
        image: "./IMAGE/CUP CAKES of 4.jpg",
        description: "Assorted flavored cupcakes with beautiful frosting.",
        featured: true,
        inStock: true,
        stockQuantity: 20
    },
    {
        name: "Bento Cake",
        category: "cakes",
        price: 7000,
        image: "./IMAGE/BENTO CAKE 2.jpg",
        description: "Beautifully decorated bento cake.",
        featured: true,
        inStock: true,
        stockQuantity: 12
    },
    {
        name: "Foil Cake",
        category: "cakes",
        price: 1000,
        image: "./IMAGE/MINI FOIL CAKE.jpg",
        description: "Mini foil cake perfect for individual treats.",
        featured: true,
        inStock: true,
        stockQuantity: 25
    },
    {
        name: "Cake Perfeit",
        category: "cakes",
        price: 3000,
        image: "./IMAGE/cake perfeit.jpg",
        description: "Layered cake perfection.",
        featured: true,
        inStock: true,
        stockQuantity: 15
    },
    {
        name: "Chocolate Foil Cake",
        category: "cakes",
        price: 1000,
        image: "./IMAGE/CHOCOLATE FOIL CAKE.jpg",
        description: "Chocolate foil cake.",
        featured: true,
        inStock: true,
        stockQuantity: 25
    },
    {
        name: "Birthday Cake (6INCH)",
        category: "cakes",
        price: 15000,
        image: "./IMAGE/BIRTHDAY CAKE 6.jpg",
        description: "Beautifully decorated birthday cake.",
        featured: true,
        inStock: true,
        stockQuantity: 5
    },
    {
        name: "Birthday Cake (8INCH)",
        category: "cakes",
        price: 25000,
        image: "./IMAGE/BIRTHDAY CAKE 8INCH.jpg",
        description: "Beautiful birthday cake.",
        featured: true,
        inStock: true,
        stockQuantity: 5
    },
    {
        name: "Birthday Cake (10INCH)",
        category: "cakes",
        price: 35000,
        image: "./IMAGE/BIRTHDAY CAKE 10 INCH.jpg",
        description: "Stunning birthday cake design.",
        featured: true,
        inStock: true,
        stockQuantity: 3
    },
    
    // Drinks
    {
        name: "Zobo Drink (1L)",
        category: "drinks",
        price: 2000,
        image: "./IMAGE/ZOBO.jpg",
        description: "Refreshing hibiscus drink with pineapple and ginger.",
        featured: true,
        inStock: true,
        stockQuantity: 30
    },
    {
        name: "Chapman (1L)",
        category: "drinks",
        price: 2000,
        image: "./IMAGE/CHAPMAN.jpg",
        description: "Nigerian classic cocktail (non-alcoholic).",
        featured: true,
        inStock: true,
        stockQuantity: 25
    },
    {
        name: "Smoothies",
        category: "drinks",
        price: 3000,
        image: "./IMAGE/smoothies.jpg",
        description: "Fresh blended smoothies.",
        featured: true,
        inStock: true,
        stockQuantity: 20
    },
    {
        name: "Cookies (6pcs)",
        category: "cookies",
        price: 1500,
        image: "./IMAGE/cookies.jpg",
        description: "Crunchy homemade cookies.",
        featured: true,
        inStock: true,
        stockQuantity: 40
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        // Force use of production database
await mongoose.connect('mongodb+srv://beedahttreats_db_user:n7okU8Bs9rhA9bF3@beedaht.x0grs6q.mongodb.net/beedaht_db?retryWrites=true&w=majority&appName=beedaht');
        // Clear existing products
        await Product.deleteMany({});
        console.log('✅ Cleared existing products');

        // Insert new products
        await Product.insertMany(products);
        console.log(`✅ Added ${products.length} products to database!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
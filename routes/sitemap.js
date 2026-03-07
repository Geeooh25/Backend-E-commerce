const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

router.get('/sitemap.xml', async (req, res) => {
    try {
        const products = await Product.find();
        const categories = await Category.find();

        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        // Static pages
        sitemap += `
            <url>
                <loc>${process.env.FRONTEND_URL}/</loc>
                <changefreq>daily</changefreq>
                <priority>1.0</priority>
            </url>
            <url>
                <loc>${process.env.FRONTEND_URL}/products</loc>
                <changefreq>daily</changefreq>
                <priority>0.8</priority>
            </url>
        `;

        // Product pages
        products.forEach(product => {
            sitemap += `
                <url>
                    <loc>${process.env.FRONTEND_URL}/product/${product._id}</loc>
                    <lastmod>${new Date(product.updatedAt || product.createdAt).toISOString().split('T')[0]}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.6</priority>
                </url>
            `;
        });

        // Category pages
        categories.forEach(category => {
            sitemap += `
                <url>
                    <loc>${process.env.FRONTEND_URL}/category/${category.slug}</loc>
                    <changefreq>weekly</changefreq>
                    <priority>0.5</priority>
                </url>
            `;
        });

        sitemap += '</urlset>';
        
        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        res.status(500).send('Error generating sitemap');
    }
});

module.exports = router;
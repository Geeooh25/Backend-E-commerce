// SEO Configuration
const seoConfig = {
    title: 'Beedaht Sweet Treats - Authentic Nigerian Bakery & Cafe',
    description: 'Order delicious Nigerian cakes, small chops, pastries, and drinks online. Freshly baked daily in Lagos. Delivery available.',
    keywords: 'Nigerian bakery, cakes Lagos, small chops, puff puff, meat pie, zobo drink, Nigerian pastries',
    author: 'Beedaht Sweet Treats',
    ogImage: 'https://yourdomain.com/images/og-image.jpg',
    twitterHandle: '@beedaht'
};

// Update page title dynamically
function updatePageTitle(pageTitle) {
    document.title = `${pageTitle} | Beedaht Sweet Treats`;
}

// Update meta tags dynamically
function updateMetaTags(meta) {
    let metaTags = {
        description: meta.description || seoConfig.description,
        keywords: meta.keywords || seoConfig.keywords
    };

    Object.keys(metaTags).forEach(name => {
        let metaTag = document.querySelector(`meta[name="${name}"]`);
        if (metaTag) {
            metaTag.setAttribute('content', metaTags[name]);
        }
    });
}

// Add to head of HTML
function generateSEOTags() {
    return `
        <meta name="description" content="${seoConfig.description}">
        <meta name="keywords" content="${seoConfig.keywords}">
        <meta name="author" content="${seoConfig.author}">
        <meta property="og:title" content="${seoConfig.title}">
        <meta property="og:description" content="${seoConfig.description}">
        <meta property="og:image" content="${seoConfig.ogImage}">
        <meta property="og:url" content="https://yourdomain.com">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="${seoConfig.twitterHandle}">
        <meta name="twitter:title" content="${seoConfig.title}">
        <meta name="twitter:description" content="${seoConfig.description}">
        <meta name="twitter:image" content="${seoConfig.ogImage}">
        <link rel="canonical" href="https://yourdomain.com">
    `;
}
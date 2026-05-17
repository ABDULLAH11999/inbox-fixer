const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(process.cwd(), 'data');
const BLOGS_FILE = path.join(DB_DIR, 'blogs.json');
const PUBLIC_SITEMAP = path.join(process.cwd(), 'public', 'sitemap.xml');
const ROOT_SITEMAP = path.join(process.cwd(), 'sitemap.xml');

const baseUrl = 'https://inboxfixer.online';

function generate() {
  console.log('Generating dynamic XML sitemaps...');
  
  let blogs = [];
  try {
    if (fs.existsSync(BLOGS_FILE)) {
      const content = fs.readFileSync(BLOGS_FILE, 'utf-8');
      blogs = JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to read blogs.json:', err);
  }
  
  console.log(`Loaded ${blogs.length} blog posts from database.`);

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Static Pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/auth/login</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/auth/signup</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Dynamic Blog Posts -->${blogs.map(blog => `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${new Date(blog.created_at || new Date()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>
`;

  fs.writeFileSync(PUBLIC_SITEMAP, sitemapXml);
  fs.writeFileSync(ROOT_SITEMAP, sitemapXml);
  
  console.log('Successfully wrote dynamic sitemaps to public/sitemap.xml and sitemap.xml.');
}

generate();

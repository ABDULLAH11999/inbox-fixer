import fs from 'fs';
import path from 'path';
import { getBlogs } from './db';

/**
 * Automates regeneration of physical sitemap.xml files.
 * Keeps public/sitemap.xml and root sitemap.xml in perfect real-time sync with database logs.
 */
export function updateStaticSitemap() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inboxfixer.online';
    const blogs = getBlogs();

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

  <!-- Dynamic Blog Posts -->${blogs.map((blog: any) => `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${new Date(blog.created_at || new Date()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>
`;

    const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    const rootPath = path.join(process.cwd(), 'sitemap.xml');

    fs.writeFileSync(publicPath, sitemapXml);
    fs.writeFileSync(rootPath, sitemapXml);
    console.log('Static sitemaps successfully regenerated in real-time.');
  } catch (err: any) {
    console.error('Failed to regenerate static sitemaps:', err.message || err);
  }
}

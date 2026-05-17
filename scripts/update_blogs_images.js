const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');
const BLOGS_FILE = path.join(DB_DIR, 'blogs.json');

if (!fs.existsSync(BLOGS_FILE)) {
  console.error("Error: blogs.json file does not exist!");
  process.exit(1);
}

// Read the database
const blogs = JSON.parse(fs.readFileSync(BLOGS_FILE, 'utf8'));

// Update each blog to use its local unique SVG image asset
const updatedBlogs = blogs.map((blog, index) => {
  return {
    ...blog,
    image: `/blog-images/blog-${index + 1}.svg`
  };
});

// Write the updated database back
fs.writeFileSync(BLOGS_FILE, JSON.stringify(updatedBlogs, null, 2));

console.log(`✅ Successfully updated exactly ${updatedBlogs.length} blogs to use the robust, local, unique SVG assets!`);

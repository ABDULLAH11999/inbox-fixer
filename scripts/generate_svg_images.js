const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'blog-images');

// Ensure directories exist
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Highly relevant tech icons rendered as inline paths
const ICONS = {
  shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  mail: `<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 4l-9 8-9-8" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  database: `<ellipse cx="12" cy="5" rx="9" ry="3" fill="none" stroke="#00ff88" stroke-width="2"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" fill="none" stroke="#00ff88" stroke-width="2"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" fill="none" stroke="#00ff88" stroke-width="2"/>`,
  key: `<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3m-3-3l-1.5-1.5" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  lock: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  server: `<rect x="2" y="2" width="20" height="8" rx="2" fill="none" stroke="#00ff88" stroke-width="2"/><rect x="2" y="14" width="20" height="8" rx="2" fill="none" stroke="#00ff88" stroke-width="2"/><line x1="6" y1="6" x2="6" y2="6.01" stroke="#00ff88" stroke-width="3" stroke-linecap="round"/><line x1="6" y1="18" x2="6" y2="18.01" stroke="#00ff88" stroke-width="3" stroke-linecap="round"/>`,
  network: `<circle cx="12" cy="12" r="3" fill="none" stroke="#00ff88" stroke-width="2"/><circle cx="12" cy="4" r="2" fill="#00ff88"/><circle cx="4" cy="12" r="2" fill="#00ff88"/><circle cx="20" cy="12" r="2" fill="#00ff88"/><circle cx="12" cy="20" r="2" fill="#00ff88"/><line x1="12" y1="6" x2="12" y2="9" stroke="#00ff88" stroke-width="2"/><line x1="12" y1="15" x2="12" y2="18" stroke="#00ff88" stroke-width="2"/><line x1="6" y1="12" x2="9" y2="12" stroke="#00ff88" stroke-width="2"/><line x1="15" y1="12" x2="18" y2="12" stroke="#00ff88" stroke-width="2"/>`
};

const ICON_KEYS = Object.keys(ICONS);

// Pre-defined high-end dark cyber gradient schemes
const GRADIENTS = [
  { from: "#0a0f1e", to: "#0f1729", accent: "#00ff88" },
  { from: "#0a0f1e", to: "#1e1b4b", accent: "#8b5cf6" },
  { from: "#020617", to: "#0f172a", accent: "#38bdf8" },
  { from: "#061325", to: "#0a0f1e", accent: "#0ea5e9" },
  { from: "#090514", to: "#0a0f1e", accent: "#d946ef" },
  { from: "#081c15", to: "#0a0f1e", accent: "#2d6a4f" }
];

// Generate 80 unique SVGs
for (let i = 1; i <= 80; i++) {
  const grad = GRADIENTS[(i - 1) % GRADIENTS.length];
  const iconName = ICON_KEYS[(i - 1) % ICON_KEYS.length];
  const iconMarkup = ICONS[iconName].replace(/#00ff88/g, grad.accent);

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="grad-${i}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${grad.from}" />
      <stop offset="100%" stop-color="${grad.to}" />
    </linearGradient>
    <pattern id="grid-${i}" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${grad.accent}" stroke-width="0.5" opacity="0.07" />
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="450" fill="url(#grad-${i})" />
  
  <!-- Tech Grid Overlay -->
  <rect width="800" height="450" fill="url(#grid-${i})" />
  
  <!-- Neon decorative orbs -->
  <circle cx="150" cy="120" r="100" fill="${grad.accent}" opacity="0.04" filter="blur(40px)" />
  <circle cx="650" cy="320" r="120" fill="${grad.accent}" opacity="0.03" filter="blur(50px)" />

  <!-- Abstract digital diagnostic circle -->
  <circle cx="400" cy="225" r="120" fill="none" stroke="${grad.accent}" stroke-width="1.5" stroke-dasharray="10, 8" opacity="0.15" />
  <circle cx="400" cy="225" r="140" fill="none" stroke="${grad.accent}" stroke-width="0.5" opacity="0.08" />

  <!-- Stylized corner diagnostic brackets -->
  <path d="M 40 60 L 40 40 L 60 40" fill="none" stroke="${grad.accent}" stroke-width="1.5" opacity="0.3" />
  <path d="M 760 60 L 760 40 L 740 40" fill="none" stroke="${grad.accent}" stroke-width="1.5" opacity="0.3" />
  <path d="M 40 390 L 40 410 L 60 410" fill="none" stroke="${grad.accent}" stroke-width="1.5" opacity="0.3" />
  <path d="M 760 390 L 760 410 L 740 410" fill="none" stroke="${grad.accent}" stroke-width="1.5" opacity="0.3" />

  <!-- Center Icon Wrapper -->
  <g transform="translate(372, 197) scale(2.4)">
    ${iconMarkup}
  </g>

  <!-- Typography metadata overlay -->
  <text x="400" y="380" font-family="'Syne', 'Inter', sans-serif" font-size="16" font-weight="bold" fill="#ffffff" opacity="0.8" text-anchor="middle" letter-spacing="4">
    INBOXFIXER DIAGNOSTICS
  </text>
  
  <text x="400" y="405" font-family="'IBM Plex Mono', monospace" font-size="11" fill="${grad.accent}" opacity="0.6" text-anchor="middle" letter-spacing="2">
    INDEXING NODE AUDIT // POST-00${i}
  </text>

  <!-- Technical grade subline -->
  <line x1="300" y1="360" x2="500" y2="360" stroke="${grad.accent}" stroke-width="1" opacity="0.2" />
</svg>`;

  fs.writeFileSync(path.join(IMAGES_DIR, `blog-${i}.svg`), svgContent);
}

console.log(`✅ Successfully generated 80 unique, beautiful local tech SVG images inside ${IMAGES_DIR}!`);

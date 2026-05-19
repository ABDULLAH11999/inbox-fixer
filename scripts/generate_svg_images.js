const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'blog-images');
const BLOGS_FILE = path.join(__dirname, '..', 'data', 'blogs.json');

if (!fs.existsSync(BLOGS_FILE)) {
  console.error('Error: blogs.json file does not exist!');
  process.exit(1);
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const blogs = JSON.parse(fs.readFileSync(BLOGS_FILE, 'utf8'));
const targetBlogs = blogs.slice(0, 80);

const palettes = [
  { bgFrom: '#07111f', bgTo: '#0f3b5f', accent: '#38bdf8', accentAlt: '#22c55e', line: '#d7f3ff', panel: '#06101b' },
  { bgFrom: '#140b12', bgTo: '#4a1328', accent: '#fb7185', accentAlt: '#f97316', line: '#ffd4dd', panel: '#1c0f17' },
  { bgFrom: '#0c1020', bgTo: '#1e1b4b', accent: '#a78bfa', accentAlt: '#22c55e', line: '#ddd6fe', panel: '#0a0f1e' },
  { bgFrom: '#10140b', bgTo: '#2f3f14', accent: '#84cc16', accentAlt: '#facc15', line: '#ecfccb', panel: '#11180b' },
  { bgFrom: '#07131a', bgTo: '#083344', accent: '#22d3ee', accentAlt: '#34d399', line: '#d5fbff', panel: '#081019' },
  { bgFrom: '#120d24', bgTo: '#2b1760', accent: '#8b5cf6', accentAlt: '#22d3ee', line: '#e9ddff', panel: '#100d1a' },
  { bgFrom: '#111827', bgTo: '#1f2937', accent: '#60a5fa', accentAlt: '#22c55e', line: '#dbeafe', panel: '#0b1220' },
  { bgFrom: '#0f172a', bgTo: '#164e63', accent: '#06b6d4', accentAlt: '#a3e635', line: '#cffafe', panel: '#0a1420' },
  { bgFrom: '#1a1023', bgTo: '#3b0764', accent: '#c084fc', accentAlt: '#22c55e', line: '#f3e8ff', panel: '#130d18' },
  { bgFrom: '#09203a', bgTo: '#1e3a8a', accent: '#38bdf8', accentAlt: '#f59e0b', line: '#dbeafe', panel: '#081524' },
];

const templateTypes = [
  'radar-check',
  'fix-arrow',
  'browser-target',
  'auth-chips',
  'shield-ring',
  'search-panel',
  'record-stack',
  'mail-route',
];

const topicConfig = {
  spf: { label: 'SPF RECORD REPAIR', micro: 'SPF ALIGNMENT', symbol: 'shield' },
  dkim: { label: 'DKIM KEY RESOLUTION', micro: 'DKIM SELECTOR', symbol: 'key' },
  dmarc: { label: 'DMARC POLICY FIX', micro: 'DMARC ENFORCEMENT', symbol: 'ring' },
  mx: { label: 'MX RECORD CHECK', micro: 'MAIL EXCHANGE', symbol: 'server' },
  blacklist: { label: 'BLACKLIST MONITOR', micro: 'REPUTATION DEFENSE', symbol: 'alert' },
  yahoo: { label: 'YAHOO DELIVERY FIX', micro: 'YAHOO FILTERS', symbol: 'mail' },
  gmail: { label: 'GMAIL DELIVERY FIX', micro: 'GOOGLE FILTERS', symbol: 'mail' },
  google: { label: 'GOOGLE WORKSPACE FIX', micro: 'WORKSPACE AUTH', symbol: 'mail' },
  security: { label: 'DOMAIN SECURITY GUIDE', micro: 'SENDER TRUST', symbol: 'shield' },
  dns: { label: 'DOMAIN DNS REPAIR', micro: 'DNS MANAGEMENT', symbol: 'nodes' },
  auth: { label: 'EMAIL AUTH RECORDS', micro: 'AUTH STACK', symbol: 'chips' },
  mail: { label: 'EMAIL DELIVERY CHECK', micro: 'MAIL ROUTING', symbol: 'mail' },
  default: { label: 'DOMAIN DNS CHECK', micro: 'RECORD AUDIT', symbol: 'search' },
};

function safeTag(tag) {
  return String(tag || '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase();
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function fitText(value, maxLength) {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}

function splitHeadline(title) {
  const words = String(title || '').replace(/[:|]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length <= 4) {
    return [words.join(' ').toUpperCase(), ''];
  }

  let midpoint = Math.ceil(words.length / 2);
  midpoint = Math.max(3, Math.min(words.length - 2, midpoint));
  const first = words.slice(0, midpoint).join(' ').toUpperCase();
  const second = words.slice(midpoint).join(' ').toUpperCase();

  return [fitText(first, 28), fitText(second, 30)];
}

function inferTopic(blog) {
  const haystack = `${blog.title} ${blog.slug} ${(blog.tags || []).join(' ')}`.toLowerCase();

  if (haystack.includes('spf')) return topicConfig.spf;
  if (haystack.includes('dkim')) return topicConfig.dkim;
  if (haystack.includes('dmarc')) return topicConfig.dmarc;
  if (haystack.includes('mx')) return topicConfig.mx;
  if (haystack.includes('blacklist')) return topicConfig.blacklist;
  if (haystack.includes('yahoo')) return topicConfig.yahoo;
  if (haystack.includes('gmail')) return topicConfig.gmail;
  if (haystack.includes('google')) return topicConfig.google;
  if (haystack.includes('security') || haystack.includes('spoof') || haystack.includes('abuse')) return topicConfig.security;
  if (haystack.includes('auth') || haystack.includes('deliverability')) return topicConfig.auth;
  if (haystack.includes('dns') || haystack.includes('domain')) return topicConfig.dns;
  if (haystack.includes('mail') || haystack.includes('email')) return topicConfig.mail;

  return topicConfig.default;
}

function symbolSvg(symbol, palette) {
  const stroke = palette.accent;
  const alt = palette.accentAlt;

  switch (symbol) {
    case 'shield':
      return `<path d="M0 -40l48 16v40c0 28-19 52-48 66-29-14-48-38-48-66v-40z" fill="none" stroke="${stroke}" stroke-width="10"/><path d="M-18 6l15 15 28-34" fill="none" stroke="${alt}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'key':
      return `<circle cx="-10" cy="8" r="22" fill="none" stroke="${stroke}" stroke-width="10"/><path d="M9 8h56m-20 0v18m-15-18v12" fill="none" stroke="${alt}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'ring':
      return `<circle cx="0" cy="0" r="52" fill="none" stroke="${stroke}" stroke-width="10" stroke-dasharray="14 9"/><path d="M-20 2l16 16 36-40" fill="none" stroke="${alt}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'server':
      return `<rect x="-56" y="-42" width="112" height="36" rx="10" fill="none" stroke="${stroke}" stroke-width="8"/><rect x="-56" y="10" width="112" height="36" rx="10" fill="none" stroke="${stroke}" stroke-width="8"/><circle cx="-30" cy="-24" r="4" fill="${alt}"/><circle cx="-30" cy="28" r="4" fill="${alt}"/><path d="M4 -24h28M4 28h28" stroke="${alt}" stroke-width="8" stroke-linecap="round"/>`;
    case 'alert':
      return `<path d="M0 -52l56 98H-56z" fill="none" stroke="${stroke}" stroke-width="8"/><path d="M0 -20v32" stroke="${alt}" stroke-width="10" stroke-linecap="round"/><circle cx="0" cy="26" r="6" fill="${alt}"/>`;
    case 'mail':
      return `<rect x="-58" y="-36" width="116" height="74" rx="14" fill="none" stroke="${stroke}" stroke-width="8"/><path d="M-58 -28l58 42 58-42" fill="none" stroke="${alt}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'nodes':
      return `<circle cx="0" cy="0" r="18" fill="none" stroke="${stroke}" stroke-width="8"/><circle cx="0" cy="-56" r="9" fill="${alt}"/><circle cx="-56" cy="0" r="9" fill="${alt}"/><circle cx="56" cy="0" r="9" fill="${alt}"/><circle cx="0" cy="56" r="9" fill="${alt}"/><path d="M0 -38v20M0 18v20M-38 0h20M18 0h20" stroke="${stroke}" stroke-width="8" stroke-linecap="round"/>`;
    case 'chips':
      return `<rect x="-70" y="-36" width="42" height="72" rx="10" fill="none" stroke="${alt}" stroke-width="7"/><rect x="-21" y="-36" width="42" height="72" rx="10" fill="none" stroke="${stroke}" stroke-width="7"/><rect x="28" y="-36" width="42" height="72" rx="10" fill="none" stroke="${alt}" stroke-width="7"/>`;
    case 'search':
    default:
      return `<circle cx="-8" cy="-4" r="34" fill="none" stroke="${stroke}" stroke-width="10"/><path d="M22 26l34 34" stroke="${alt}" stroke-width="10" stroke-linecap="round"/>`;
  }
}

function renderTagChips(tags, palette, xStart, y) {
  return tags.slice(0, 3).map((tag, index) => {
    const x = xStart + index * 112;
    return `
      <rect x="${x}" y="${y}" width="96" height="28" rx="8" fill="#0c1724" stroke="${palette.accent}" stroke-opacity="0.22"/>
      <text x="${x + 48}" y="${y + 19}" font-family="'IBM Plex Mono', monospace" font-size="11" fill="${palette.accent}" text-anchor="middle">#${escapeXml(safeTag(tag).slice(0, 10))}</text>
    `;
  }).join('');
}

function renderFrame(palette, index, innerMarkup) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="grad-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bgFrom}" />
      <stop offset="100%" stop-color="${palette.bgTo}" />
    </linearGradient>
    <pattern id="grid-${index}" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0L0 0 0 40" fill="none" stroke="${palette.accent}" stroke-width="0.7" opacity="0.08" />
    </pattern>
  </defs>
  <rect width="800" height="450" fill="url(#grad-${index})" />
  <rect width="800" height="450" fill="url(#grid-${index})" />
  ${innerMarkup}
</svg>`;
}

function renderTemplate(template, blog, palette, index) {
  const topic = inferTopic(blog);
  const [headlineLine1, headlineLine2] = splitHeadline(blog.title);
  const tags = (blog.tags || []).slice(0, 3);
  const symbol = symbolSvg(topic.symbol, palette);
  const postNo = String(index).padStart(4, '0');
  const tagMarkup = renderTagChips(tags, palette, 66, 54);
  const driftA = (index * 17) % 29;
  const driftB = (index * 11) % 31;
  const driftC = (index * 7) % 37;
  const panelWidth = 460 + (index % 5) * 16;
  const panelX = Math.max(126, Math.min(190, 170 - Math.floor((panelWidth - 460) / 2)));
  const panelRight = panelX + panelWidth;
  const orbLeftX = 120 + driftA;
  const orbRightX = 630 + driftB;
  const orbBottomY = 300 + driftC;
  const iconShiftX = 500 + driftB;
  const lineStartX = 200 + Math.floor(driftA / 3);

  switch (template) {
    case 'radar-check':
      return renderFrame(palette, index, `
  <circle cx="${orbLeftX}" cy="${105 + driftC}" r="${84 + (index % 4) * 4}" fill="${palette.accent}" opacity="0.07" />
  <circle cx="${orbRightX + 18}" cy="${orbBottomY}" r="${108 + (index % 5) * 5}" fill="${palette.accentAlt}" opacity="0.06" />
  <rect x="${140 + Math.floor(driftB / 3)}" y="${102 + Math.floor(driftC / 4)}" width="${488 + (index % 4) * 10}" height="240" rx="28" fill="${palette.panel}" stroke="${palette.accent}" stroke-opacity="0.24" />
  <path d="M${lineStartX} 160h170M${lineStartX} 205h${215 + driftB}M${lineStartX} 250h${140 + driftC}" stroke="${palette.line}" stroke-width="10" stroke-linecap="round" opacity="0.5" />
  <circle cx="${iconShiftX}" cy="${214 + Math.floor(driftC / 4)}" r="${56 + (index % 4) * 2}" fill="none" stroke="${palette.accent}" stroke-width="10" stroke-dasharray="10 8" />
  <path d="M${iconShiftX - 26} ${214 + Math.floor(driftC / 4)}l18 18 36-40" fill="none" stroke="${palette.accentAlt}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
  ${tagMarkup}
  <text x="400" y="372" font-family="'Syne', sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="3">${escapeXml(topic.label)}</text>
  <text x="400" y="400" font-family="'IBM Plex Mono', monospace" font-size="11" fill="${palette.accent}" opacity="0.82" text-anchor="middle" letter-spacing="2">${escapeXml(topic.micro)} // POST-${postNo}</text>`);
    case 'fix-arrow':
      return renderFrame(palette, index, `
  <circle cx="${orbLeftX}" cy="${82 + driftC}" r="${86 + (index % 4) * 4}" fill="${palette.accent}" opacity="0.08" />
  <circle cx="${orbRightX + 12}" cy="${330 + Math.floor(driftA / 4)}" r="${104 + (index % 3) * 8}" fill="${palette.accentAlt}" opacity="0.06" />
  <rect x="${126 + Math.floor(driftB / 4)}" y="110" width="${526 + (index % 4) * 10}" height="220" rx="28" fill="${palette.panel}" stroke="${palette.accent}" stroke-opacity="0.22" />
  <path d="M${206 + Math.floor(driftA / 4)} 175h${150 + driftC}M${206 + Math.floor(driftA / 4)} 225h${110 + driftB}M${206 + Math.floor(driftA / 4)} 275h${180 + driftA}" stroke="${palette.line}" stroke-width="10" stroke-linecap="round" opacity="0.5" />
  <path d="M${476 + Math.floor(driftB / 2)} 152l${82 + Math.floor(driftC / 2)} 86-96 60 10-60-50-30z" fill="${palette.accent}" opacity="0.18" stroke="${palette.accent}" stroke-width="6" />
  <path d="M${500 + Math.floor(driftB / 3)} 214l26 26 50-60" fill="none" stroke="${palette.accentAlt}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
  ${tagMarkup}
  <text x="400" y="372" font-family="'Syne', sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="3">${escapeXml(headlineLine1)}</text>
  <text x="400" y="398" font-family="'IBM Plex Mono', monospace" font-size="11" fill="${palette.accent}" opacity="0.82" text-anchor="middle" letter-spacing="2">${escapeXml(headlineLine2 || topic.micro)} // POST-${postNo}</text>`);
    case 'browser-target':
      return renderFrame(palette, index, `
  <path d="M0 ${348 + Math.floor(driftA / 3)}Q170 300 332 ${338 + Math.floor(driftC / 2)}T640 ${324 + Math.floor(driftB / 2)}T800 350V450H0Z" fill="${palette.accentAlt}" opacity="0.08" />
  <circle cx="${150 + driftB}" cy="${100 + Math.floor(driftC / 2)}" r="${74 + (index % 4) * 3}" fill="${palette.accent}" opacity="0.08" />
  <rect x="${panelX}" y="98" width="${panelWidth}" height="236" rx="26" fill="${palette.panel}" stroke="${palette.accent}" stroke-opacity="0.24" />
  <circle cx="${panelX + 36}" cy="128" r="8" fill="${palette.accent}" opacity="0.8" />
  <circle cx="${panelX + 62}" cy="128" r="8" fill="${palette.accentAlt}" opacity="0.8" />
  <circle cx="${panelX + 88}" cy="128" r="8" fill="#ffffff" opacity="0.5" />
  <path d="M${panelX + 56} 170h${138 + driftC}M${panelX + 56} 210h${190 + driftA}M${panelX + 56} 250h${110 + driftB}" stroke="${palette.line}" stroke-width="9" stroke-linecap="round" opacity="0.45" />
  <circle cx="${panelRight - 108}" cy="${205 + Math.floor(driftB / 4)}" r="${54 + (index % 5) * 2}" fill="none" stroke="${palette.accent}" stroke-width="10" />
  <path d="M${panelRight - 70} ${245 + Math.floor(driftB / 4)}l38 38" stroke="${palette.accentAlt}" stroke-width="12" stroke-linecap="round" />
  ${tagMarkup}
  <text x="400" y="372" font-family="'Syne', sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="3">${escapeXml(fitText(blog.title.toUpperCase(), 30))}</text>
  <text x="400" y="400" font-family="'IBM Plex Mono', monospace" font-size="11" fill="${palette.accent}" opacity="0.82" text-anchor="middle" letter-spacing="2">LIVE RECORD LOOKUP // POST-${postNo}</text>`);
    case 'auth-chips':
      return renderFrame(palette, index, `
  <circle cx="${orbLeftX}" cy="${108 + Math.floor(driftC / 3)}" r="${84 + (index % 4) * 3}" fill="${palette.accent}" opacity="0.07" />
  <circle cx="${orbRightX + 24}" cy="${orbBottomY}" r="${112 + (index % 4) * 4}" fill="${palette.accentAlt}" opacity="0.06" />
  <rect x="${142 + Math.floor(driftB / 3)}" y="105" width="${490 + (index % 4) * 8}" height="240" rx="28" fill="${palette.panel}" stroke="${palette.accent}" stroke-opacity="0.24" />
  <rect x="${195 + Math.floor(driftA / 4)}" y="155" width="110" height="64" rx="12" fill="#0c1b28" stroke="${palette.accentAlt}" stroke-opacity="0.4" />
  <rect x="${336 + Math.floor(driftB / 4)}" y="155" width="110" height="64" rx="12" fill="#0c1b28" stroke="${palette.accent}" stroke-opacity="0.4" />
  <rect x="${477 + Math.floor(driftC / 3)}" y="155" width="110" height="64" rx="12" fill="#0c1b28" stroke="${palette.accentAlt}" stroke-opacity="0.4" />
  <path d="M${195 + Math.floor(driftA / 4)} 260h${384 + Math.floor(driftB / 2)}" stroke="${palette.line}" stroke-width="10" stroke-linecap="round" opacity="0.45" />
  <text x="${250 + Math.floor(driftA / 4)}" y="194" font-family="'IBM Plex Mono', monospace" font-size="18" fill="${palette.accentAlt}" text-anchor="middle">${escapeXml((tags[0] || 'SPF').toUpperCase().slice(0, 8))}</text>
  <text x="${391 + Math.floor(driftB / 4)}" y="194" font-family="'IBM Plex Mono', monospace" font-size="18" fill="${palette.accent}" text-anchor="middle">${escapeXml((tags[1] || 'DKIM').toUpperCase().slice(0, 8))}</text>
  <text x="${532 + Math.floor(driftC / 3)}" y="194" font-family="'IBM Plex Mono', monospace" font-size="18" fill="${palette.accentAlt}" text-anchor="middle">${escapeXml((tags[2] || 'DMARC').toUpperCase().slice(0, 8))}</text>
  <text x="400" y="372" font-family="'Syne', sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="3">${escapeXml(topic.label)}</text>
  <text x="400" y="400" font-family="'IBM Plex Mono', monospace" font-size="11" fill="${palette.accent}" opacity="0.82" text-anchor="middle" letter-spacing="2">${escapeXml(topic.micro)} // POST-${postNo}</text>`);
    case 'shield-ring':
      return renderFrame(palette, index, `
  <circle cx="400" cy="224" r="120" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-dasharray="10 8" opacity="0.15" />
  <circle cx="400" cy="224" r="150" fill="none" stroke="${palette.accentAlt}" stroke-width="1" opacity="0.09" />
  <circle cx="400" cy="224" r="170" fill="${palette.accent}" opacity="0.02" />
  <path d="M40 60L40 40 60 40M760 60L760 40 740 40M40 390L40 410 60 410M760 390L760 410 740 410" fill="none" stroke="${palette.accent}" stroke-width="1.5" opacity="0.28" />
  <g transform="translate(400 224)">
    ${symbol}
  </g>
  <text x="400" y="340" font-family="'IBM Plex Mono', monospace" font-size="13" fill="${palette.accent}" opacity="0.72" text-anchor="middle">${escapeXml(safeTag(topic.micro).replace(/-/g, ' '))}</text>
  <text x="400" y="372" font-family="'Syne', sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="3">${escapeXml(fitText(blog.title.toUpperCase(), 30))}</text>
  <text x="400" y="400" font-family="'IBM Plex Mono', monospace" font-size="11" fill="${palette.accentAlt}" opacity="0.82" text-anchor="middle" letter-spacing="2">INBOXFIXER VISUAL // POST-${postNo}</text>`);
    case 'search-panel':
      return renderFrame(palette, index, `
  <circle cx="${orbLeftX}" cy="${110 + Math.floor(driftC / 3)}" r="${88 + (index % 4) * 5}" fill="${palette.accent}" opacity="0.07" />
  <circle cx="${orbRightX}" cy="${325 + Math.floor(driftB / 5)}" r="${118 + (index % 4) * 6}" fill="${palette.accentAlt}" opacity="0.06" />
  <rect x="${panelX + 10}" y="110" width="${panelWidth - 12}" height="210" rx="24" fill="${palette.panel}" stroke="${palette.accent}" stroke-opacity="0.25" />
  <path d="M${panelX + 50} 160h${170 + driftA}M${panelX + 50} 195h${225 + driftB}M${panelX + 50} 230h${145 + driftC}M${panelX + 50} 265h${190 + driftA}" stroke="${palette.line}" stroke-width="8" stroke-linecap="round" opacity="0.45" />
  <circle cx="${panelRight - 58}" cy="${215 + Math.floor(driftB / 4)}" r="${48 + (index % 4) * 3}" fill="none" stroke="${palette.accent}" stroke-width="10" />
  <path d="M${panelRight - 22} ${251 + Math.floor(driftB / 4)}l38 38" stroke="${palette.accentAlt}" stroke-width="12" stroke-linecap="round" />
  ${tagMarkup}
  <text x="400" y="372" font-family="'Syne', sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="3">${escapeXml(topic.label)}</text>
  <text x="400" y="400" font-family="'IBM Plex Mono', monospace" font-size="11" fill="${palette.accent}" opacity="0.8" text-anchor="middle" letter-spacing="2">BLOG SEARCH PREVIEW // POST-${postNo}</text>`);
    case 'record-stack':
      return renderFrame(palette, index, `
  <circle cx="${orbLeftX}" cy="${100 + Math.floor(driftC / 2)}" r="${80 + (index % 4) * 3}" fill="${palette.accent}" opacity="0.07" />
  <circle cx="${orbRightX + 8}" cy="${318 + Math.floor(driftB / 5)}" r="${104 + (index % 5) * 4}" fill="${palette.accentAlt}" opacity="0.06" />
  <rect x="${178 + Math.floor(driftA / 5)}" y="104" width="${400 + Math.floor(driftB / 2)}" height="70" rx="18" fill="${palette.panel}" stroke="${palette.accent}" stroke-opacity="0.26" />
  <rect x="${198 + Math.floor(driftB / 5)}" y="170" width="${400 + Math.floor(driftC / 2)}" height="70" rx="18" fill="${palette.panel}" stroke="${palette.accentAlt}" stroke-opacity="0.24" />
  <rect x="${218 + Math.floor(driftC / 4)}" y="236" width="${400 + Math.floor(driftA / 2)}" height="70" rx="18" fill="${palette.panel}" stroke="${palette.accent}" stroke-opacity="0.22" />
  <path d="M${228 + Math.floor(driftA / 5)} 138h${184 + driftC}M${248 + Math.floor(driftB / 5)} 204h${208 + driftA}M${268 + Math.floor(driftC / 4)} 270h${155 + driftB}" stroke="${palette.line}" stroke-width="8" stroke-linecap="round" opacity="0.45" />
  <g transform="translate(${panelRight - 52} 205)">
    ${symbol}
  </g>
  <text x="400" y="372" font-family="'Syne', sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="3">${escapeXml(headlineLine1)}</text>
  <text x="400" y="400" font-family="'IBM Plex Mono', monospace" font-size="11" fill="${palette.accent}" opacity="0.8" text-anchor="middle" letter-spacing="2">${escapeXml(headlineLine2 || topic.micro)} // POST-${postNo}</text>`);
    case 'mail-route':
    default:
      return renderFrame(palette, index, `
  <circle cx="${150 + driftB}" cy="${92 + Math.floor(driftC / 2)}" r="${80 + (index % 4) * 4}" fill="${palette.accent}" opacity="0.07" />
  <circle cx="${orbRightX}" cy="${330 + Math.floor(driftA / 5)}" r="${112 + (index % 5) * 5}" fill="${palette.accentAlt}" opacity="0.06" />
  <rect x="${panelX}" y="108" width="${panelWidth}" height="224" rx="26" fill="${palette.panel}" stroke="${palette.accent}" stroke-opacity="0.22" />
  <path d="M${panelX + 72} 184h${138 + driftA}M${panelX + 72} 224h${198 + driftB}M${panelX + 72} 264h${108 + driftC}" stroke="${palette.line}" stroke-width="9" stroke-linecap="round" opacity="0.45" />
  <path d="M${panelRight - 162} 174c22-34 78-34 100 0 22 34-6 84-50 84-20 0-34 10-34 28" fill="none" stroke="${palette.accent}" stroke-width="10" stroke-linecap="round" />
  <path d="M${panelRight - 150} 290l-14 34 34-14" fill="none" stroke="${palette.accentAlt}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
  ${tagMarkup}
  <text x="400" y="372" font-family="'Syne', sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="3">${escapeXml(topic.label)}</text>
  <text x="400" y="400" font-family="'IBM Plex Mono', monospace" font-size="11" fill="${palette.accent}" opacity="0.82" text-anchor="middle" letter-spacing="2">DELIVERY PATH GUIDE // POST-${postNo}</text>`);
  }
}

for (const [offset, blog] of targetBlogs.entries()) {
  const index = offset + 1;
  const palette = palettes[offset % palettes.length];
  const template = templateTypes[offset % templateTypes.length];
  const svg = renderTemplate(template, blog, palette, index);
  fs.writeFileSync(path.join(IMAGES_DIR, `blog-${index}.svg`), svg);
}

console.log(`Generated ${targetBlogs.length} upgraded SVG blog images in ${IMAGES_DIR}`);

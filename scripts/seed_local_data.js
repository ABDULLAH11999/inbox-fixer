const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');
const VISITS_FILE = path.join(DATA_DIR, 'visits.json');
const PLANS_FILE = path.join(DATA_DIR, 'plans.json');

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function syncTable(pool, tableName, rows) {
  if (!process.env.DATABASE_URL) {
    console.warn(`DATABASE_URL is missing. Skipping DB sync for ${tableName}.`);
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${quoteIdentifier(tableName)} (
      id BIGSERIAL PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`DELETE FROM ${quoteIdentifier(tableName)}`);

  if (rows.length > 0) {
    await pool.query(
      `INSERT INTO ${quoteIdentifier(tableName)} (data)
       SELECT value
       FROM jsonb_array_elements($1::jsonb) AS value`,
      [JSON.stringify(rows)]
    );
  }
}

function buildBlog({ id, slug, title, summary, keyword, angle, tag, image, createdAt }) {
  return {
    id,
    slug,
    title,
    short_desc: summary,
    content: [
      `<h2>${title}</h2>`,
      `<p>${summary}</p>`,
      `<h3>Why this matters</h3>`,
      `<p>${angle} When email authentication, DNS alignment, or sender reputation slips, inbox placement and organic visibility both suffer.</p>`,
      `<h3>Practical steps</h3>`,
      `<ol>`,
      `<li>Audit the current ${keyword} configuration and record every failure source.</li>`,
      `<li>Apply the recommended DNS or sending fix in one controlled change set.</li>`,
      `<li>Re-test, monitor propagation, and document the outcome for future recovery.</li>`,
      `</ol>`,
      `<h3>Quick checklist</h3>`,
      `<ul>`,
      `<li>Keep records clean, concise, and aligned with your sending domain.</li>`,
      `<li>Use a single canonical source of truth for each email policy.</li>`,
      `<li>Review analytics after every update to catch regressions early.</li>`,
      `</ul>`,
      `<p>For teams managing deliverability at scale, a repeatable workflow is the fastest path to better inbox results and stronger search visibility.</p>`,
    ].join(''),
    image,
    tags: [tag, 'deliverability', 'seo'],
    seo_title: `${title} | InboxFixer`,
    seo_desc: summary,
    seo_keywords: `${keyword}, ${tag}, email deliverability, inbox placement, SEO`,
    created_at: createdAt,
  };
}

function createVisits(targetCount) {
  const paths = ['/', '/pricing', '/blog', '/about', '/contact', '/dashboard', '/results/example.com'];
  const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'India', 'Pakistan', 'Singapore'];
  const records = [];
  const visitorCount = Math.max(120, Math.ceil(targetCount / 3));
  const now = Date.now();

  for (let i = 0; i < targetCount; i += 1) {
    const visitorIndex = i % visitorCount;
    const revisitRound = Math.floor(i / visitorCount);
    const visitorId = `sig_${String(visitorIndex).padStart(4, '0')}`;
    const ipOctet = (visitorIndex % 245) + 10;
    records.push({
      id: `vst_seed_${String(i + 1).padStart(4, '0')}`,
      visitor_id: visitorId,
      ip: `203.0.113.${ipOctet}`,
      path: paths[i % paths.length],
      country: countries[i % countries.length],
      revisited: revisitRound > 0,
      created_at: new Date(now - (i * 17 + revisitRound * 90) * 60 * 1000).toISOString(),
    });
  }

  return records;
}

function ensurePlans(plans) {
  return plans.map((plan) => ({
    ...plan,
    enabled: plan.enabled !== false,
  }));
}

function ensureExtraBlogs(existingBlogs) {
  const generatedTopics = [
    ['spf-flattening-for-marketing-platforms', 'SPF Flattening for Marketing Platforms', 'How to flatten nested SPF lookups safely without breaking Mailchimp, SendGrid, or Google Workspace.', 'SPF flattening', 'spf'],
    ['dkim-selector-naming-conventions', 'DKIM Selector Naming Conventions That Improve Deliverability', 'A clean selector strategy makes DKIM maintenance easier for growing teams.', 'DKIM selector', 'dkim'],
    ['dmarc-policy-rollout-checklist', 'DMARC Policy Rollout Checklist for Busy Admins', 'Move from monitoring to enforcement with fewer surprises and cleaner reporting.', 'DMARC rollout', 'dmarc'],
    ['mx-record-priority-fixes', 'MX Record Priority Fixes for Better Mail Routing', 'Keep backup hosts in the right order so incoming mail always lands where it should.', 'MX records', 'mx'],
    ['reverse-dns-ptr-record-guide', 'Reverse DNS and PTR Record Guide for Sending IPs', 'A matching PTR record is still one of the easiest trust signals to verify.', 'reverse DNS', 'rdns'],
    ['blacklist-monitoring-for-founders', 'Blacklist Monitoring for Founders Who Need Fast Answers', 'Use blocklist checks to catch reputation problems before campaigns stall.', 'blacklist monitoring', 'blacklist'],
    ['gmail-postmaster-health-score-basics', 'Gmail Postmaster Health Score Basics Explained', 'A simple way to interpret spam rates, domain reputation, and delivery signals.', 'Google Postmaster Tools', 'gmail'],
    ['yahoo-feedback-loop-setup', 'Yahoo Feedback Loop Setup Without the Headache', 'Set up complaint reporting early so unsubscribe issues do not snowball.', 'feedback loop', 'yahoo'],
    ['outlook-junk-folder-recovery', 'Outlook Junk Folder Recovery for Transactional Senders', 'Small DNS issues can push password resets and alerts into junk.', 'Outlook junk', 'outlook'],
    ['bimi-logo-readiness', 'BIMI Logo Readiness Checklist for Brand Teams', 'Prepare your logo, DNS, and policy prerequisites before publishing BIMI.', 'BIMI', 'bimi'],
    ['smtp-relay-provider-comparison', 'SMTP Relay Provider Comparison for Growing Businesses', 'Pick a relay based on reputation, support, and authentication flexibility.', 'SMTP relay', 'smtp'],
    ['list-unsubscribe-header-implementation', 'List-Unsubscribe Header Implementation That Reduces Complaints', 'Add one-click unsubscribe headers so recipients can opt out cleanly.', 'List-Unsubscribe', 'unsubscribe'],
    ['cold-email-domain-warmup', 'Cold Email Domain Warmup for Safer Outreach', 'Ramp volume slowly and keep engagement signals healthy from day one.', 'cold email warmup', 'cold email'],
    ['transactional-mail-delivery-audit', 'Transactional Mail Delivery Audit for Product Teams', 'Protect critical product emails with a repeatable authentication checklist.', 'transactional email', 'transactional'],
    ['dns-propagation-timeline', 'DNS Propagation Timeline: What to Expect After a Change', 'Understand why some fixes appear fast while others need a full TTL cycle.', 'DNS propagation', 'dns'],
    ['spf-lookup-limit-troubleshooting', 'SPF Lookup Limit Troubleshooting for Fast Fixes', 'Stay under the 10-lookup limit and keep SPF evaluation predictable.', 'SPF lookup limit', 'spf'],
    ['dmarc-aggregate-report-analysis', 'DMARC Aggregate Report Analysis for Small Teams', 'Read rua reports without getting buried in XML noise.', 'DMARC aggregate reports', 'dmarc'],
    ['sender-reputation-recovery-plan', 'Sender Reputation Recovery Plan After a Spam Spike', 'Recover trust with list hygiene, monitoring, and better throttling.', 'sender reputation', 'reputation'],
    ['shared-vs-dedicated-ip-strategy', 'Shared vs Dedicated IP Strategy for Email Growth', 'Choose the right IP model before volume starts to climb.', 'dedicated IP', 'ip reputation'],
    ['email-list-hygiene-routine', 'Email List Hygiene Routine That Keeps Bounce Rates Down', 'Regular cleaning is one of the easiest ways to protect deliverability.', 'list hygiene', 'hygiene'],
    ['sendgrid-domain-authentication', 'SendGrid Domain Authentication Best Practices', 'Validate SPF, DKIM, and CNAME records before launching a campaign.', 'SendGrid authentication', 'sendgrid'],
    ['mailchimp-spf-dkim-check', 'Mailchimp SPF and DKIM Check for Reliable Sending', 'Make sure your Mailchimp setup aligns with your sending domain.', 'Mailchimp SPF DKIM', 'mailchimp'],
    ['google-workspace-spf-fixes', 'Google Workspace SPF Fixes for Teams With Multiple Tools', 'Merge includes carefully so the record still passes validation.', 'Google Workspace SPF', 'google workspace'],
    ['smtp-bounce-code-550-guide', 'SMTP Bounce Code 550 Guide for Support Teams', 'Decode 550 responses faster and route fixes to the right owner.', 'SMTP bounce code 550', 'smtp errors'],
    ['deliverability-dashboard-metrics', 'Deliverability Dashboard Metrics Every Marketer Should Track', 'Track complaint rate, bounce rate, and authentication pass rates in one place.', 'deliverability metrics', 'analytics'],
    ['spam-trigger-word-audit', 'Spam Trigger Word Audit for Better Subject Lines', 'Review copy with a simple checklist instead of guessing what filters dislike.', 'spam trigger words', 'content'],
    ['newsletter-compliance-basics', 'Newsletter Compliance Basics for Busy Founders', 'Keep unsubscribe, identity, and authentication standards aligned.', 'newsletter compliance', 'compliance'],
    ['brand-trust-inbox-placement', 'Brand Trust and Inbox Placement Go Hand in Hand', 'Consistency across domain, logo, and authentication improves recognition.', 'inbox placement', 'brand'],
    ['email-authentication-roadmap', 'Email Authentication Roadmap for New Domains', 'Build SPF, DKIM, and DMARC in the right order from the start.', 'email authentication', 'roadmap'],
    ['postmaster-tools-setup', 'Postmaster Tools Setup for Reliable Email Oversight', 'Use Google signals alongside your own reporting for clearer decisions.', 'Postmaster Tools', 'postmaster'],
  ];

  const existingSlugs = new Set(existingBlogs.map((blog) => blog.slug));
  const nextIndex = existingBlogs.reduce((max, blog) => {
    const match = String(blog.id || '').match(/blog-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  const images = [
    '/blog-images/blog-1.svg',
    '/blog-images/blog-2.svg',
    '/blog-images/blog-3.svg',
    '/blog-images/blog-4.svg',
    '/blog-images/blog-5.svg',
    '/blog-images/blog-6.svg',
    '/blog-images/blog-7.svg',
    '/blog-images/blog-8.svg',
    '/blog-images/blog-9.svg',
  ];

  const additions = [];
  for (let i = 0; i < generatedTopics.length; i += 1) {
    const [slugPart, title, summary, keyword, tag] = generatedTopics[i];
    const slug = `seo-${slugPart}`;
    if (existingSlugs.has(slug)) {
      continue;
    }

    additions.push(
      buildBlog({
        id: `blog-${nextIndex + additions.length + 1}`,
        slug,
        title,
        summary,
        keyword,
        angle: summary,
        tag,
        image: images[i % images.length],
        createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      })
    );
  }

  return existingBlogs.concat(additions);
}

async function main() {
  const blogs = readJson(BLOGS_FILE, []);
  const plans = readJson(PLANS_FILE, []);
  const updatedBlogs = ensureExtraBlogs(blogs);
  const updatedPlans = ensurePlans(plans);
  const updatedVisits = createVisits(450);

  writeJson(BLOGS_FILE, updatedBlogs);
  writeJson(PLANS_FILE, updatedPlans);
  writeJson(VISITS_FILE, updatedVisits);

  console.log(`Seeded blogs: ${updatedBlogs.length}`);
  console.log(`Seeded plans: ${updatedPlans.length}`);
  console.log(`Seeded visits: ${updatedVisits.length}`);

  if (process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '')
        ? false
        : { rejectUnauthorized: false },
    });

    try {
      await syncTable(pool, 'blogs', updatedBlogs);
      await syncTable(pool, 'plans', updatedPlans);
      await syncTable(pool, 'visits', updatedVisits);
      console.log('Database sync completed.');
    } finally {
      await pool.end();
    }
  } else {
    console.warn('DATABASE_URL is missing. Local JSON was updated only.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { NextRequest, NextResponse } from 'next/server';
import { checkSPF } from '@/lib/checks/spf';
import { checkDKIM } from '@/lib/checks/dkim';
import { checkDMARC } from '@/lib/checks/dmarc';
import { checkMX } from '@/lib/checks/mx';
import { checkBlacklist } from '@/lib/checks/blacklist';
import { checkRDNS } from '@/lib/checks/rdns';
import { calculateScore } from '@/lib/scorer';
import { generateScanSummary } from '@/lib/ai-explainer';
import { checkRateLimit } from '@/lib/rate-limit';
import { getSession } from '@/lib/auth';
import { getScans, writeScans } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
    }

    // Clean and validate the domain name
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .trim();

    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json({ error: 'Invalid domain name format' }, { status: 400 });
    }

    // Get user session from local cookie session
    let user = null;
    let tier: 'guest' | 'free' | 'pro' = 'guest';
    try {
      const session = await getSession();
      if (session) {
        user = session;
        tier = session.plan;
      }
    } catch (e) {
      console.warn('Local session auth check failed, treating as guest:', e);
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const identifier = user?.id || clientIp;

    // Check rate limit
    const { allowed, remaining } = await checkRateLimit(identifier, tier);
    if (!allowed) {
      return NextResponse.json({
        error: 'Daily scan limit reached.',
        message: tier === 'guest'
          ? 'Sign up for a free account to get 10 scans per day.'
          : 'Upgrade to Pro for unlimited scans and monitoring.',
        scansLeft: 0,
      }, { status: 429 });
    }

    // Run all 6 deliverability checks in parallel for ultra-fast performance
    const [spf, dkim, dmarc, mx, blacklist, rdns] = await Promise.all([
      checkSPF(cleanDomain),
      checkDKIM(cleanDomain),
      checkDMARC(cleanDomain),
      checkMX(cleanDomain),
      checkBlacklist(cleanDomain),
      checkRDNS(cleanDomain),
    ]);

    const checks = { spf, dkim, dmarc, mx, blacklist, rdns };
    
    // Calculate deliverability score and grade
    const { score, grade } = calculateScore(checks);

    // Count summary of checks status
    const checkValues = Object.values(checks);
    const summary = {
      critical: checkValues.filter(c => c.status === 'fail' || c.status === 'missing').length,
      warnings: checkValues.filter(c => c.status === 'warning').length,
      passed: checkValues.filter(c => c.status === 'pass').length,
    };

    // Detect email provider
    const emailProvider = mx.details?.detectedProvider || 'Unknown';

    const results = {
      domain: cleanDomain,
      scannedAt: new Date().toISOString(),
      score,
      grade,
      checks,
      summary,
      emailProvider,
    };

    // Generate plain-english summary from Llama 70B or Gemini fallback
    const aiSummary = await generateScanSummary(cleanDomain, results);

    // Save scan to local JSON database if user is authenticated
    if (user) {
      try {
        const scans = getScans();
        scans.push({
          id: 'scn_' + Math.random().toString(36).substring(2, 11),
          user_id: user.id,
          domain: cleanDomain,
          score,
          spf_status: spf.status,
          dkim_status: dkim.status,
          dmarc_status: dmarc.status,
          mx_status: mx.status,
          blacklist_status: blacklist.status,
          rdns_status: rdns.status,
          raw_results: results,
          created_at: new Date().toISOString()
        });
        writeScans(scans);
      } catch (dbErr) {
        console.error('Failed to save scan to database:', dbErr);
      }
    }

    return NextResponse.json({
      ...results,
      aiSummary,
      scansRemaining: remaining,
    });

  } catch (error: any) {
    console.error('API Scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan domain. Please check the domain spelling and try again.' },
      { status: 500 }
    );
  }
}

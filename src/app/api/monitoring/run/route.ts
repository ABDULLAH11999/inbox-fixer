import { NextRequest, NextResponse } from 'next/server';
import { getMonitoring, writeMonitoring, getUsers, getScans, writeScans } from '@/lib/db';
import { checkSPF } from '@/lib/checks/spf';
import { checkDKIM } from '@/lib/checks/dkim';
import { checkDMARC } from '@/lib/checks/dmarc';
import { checkMX } from '@/lib/checks/mx';
import { checkBlacklist } from '@/lib/checks/blacklist';
import { checkRDNS } from '@/lib/checks/rdns';
import { calculateScore } from '@/lib/scorer';
import nodemailer from 'nodemailer';

// Initialize SMTP transporter with environment variables
const smtpHost = process.env.SMTP_HOST || '';
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASSWORD || '';
const smtpFrom = process.env.SMTP_FROM || 'InboxFixer Alerts <alerts@inboxfixer.com>';

const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for 587 or 25
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  const cronSecret = process.env.CRON_SECRET || 'inboxfixer_cron_secret';

  // Secure Cron Route from unauthorized public triggering
  if (key !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized cron key.' }, { status: 401 });
  }

  try {
    // Fetch monitored domains and match with user email profiles
    const allMonitoring = getMonitoring();
    const activeMonitored = allMonitoring.filter(m => m.is_active === true);
    const users = getUsers();

    const monitoredItems = activeMonitored.map(item => {
      const user = users.find(u => u.id === item.user_id);
      return {
        ...item,
        profiles: user ? { email: user.email } : null
      };
    });

    if (monitoredItems.length === 0) {
      return NextResponse.json({ message: 'No active domains to monitor.' });
    }

    const scanResults: any[] = [];

    // Run scans for active domains
    for (const item of monitoredItems) {
      const domain = item.domain;
      const userId = item.user_id;
      const previousScore = item.last_score;
      const userEmail = item.profiles?.email;

      try {
        // Run all 6 deliverability checks in parallel
        const [spf, dkim, dmarc, mx, blacklist, rdns] = await Promise.all([
          checkSPF(domain),
          checkDKIM(domain),
          checkDMARC(domain),
          checkMX(domain),
          checkBlacklist(domain),
          checkRDNS(domain),
        ]);

        const checks = { spf, dkim, dmarc, mx, blacklist, rdns };
        const { score, grade } = calculateScore(checks);

        // Update local database monitoring log
        const latestMon = getMonitoring();
        const monIdx = latestMon.findIndex(m => m.id === item.id);
        if (monIdx !== -1) {
          latestMon[monIdx].last_checked_at = new Date().toISOString();
          latestMon[monIdx].last_score = score;
          writeMonitoring(latestMon);
        }

        // Save scan history record
        const scans = getScans();
        scans.push({
          id: 'scn_' + Math.random().toString(36).substring(2, 11),
          user_id: userId,
          domain,
          score,
          spf_status: spf.status,
          dkim_status: dkim.status,
          dmarc_status: dmarc.status,
          mx_status: mx.status,
          blacklist_status: blacklist.status,
          rdns_status: rdns.status,
          raw_results: {
            domain,
            scannedAt: new Date().toISOString(),
            score,
            grade,
            checks,
            summary: {
              critical: Object.values(checks).filter(c => c.status === 'fail' || c.status === 'missing').length,
              warnings: Object.values(checks).filter(c => c.status === 'warning').length,
              passed: Object.values(checks).filter(c => c.status === 'pass').length,
            },
            emailProvider: mx.details?.detectedProvider || 'Unknown',
          },
          created_at: new Date().toISOString()
        });
        writeScans(scans);

        // Trigger alert email if the score dropped and email alerts are active
        const scoreDropped = previousScore !== null && score < previousScore;
        
        if (scoreDropped && item.alert_on_change && userEmail && transporter) {
          try {
            await transporter.sendMail({
              from: smtpFrom,
              to: userEmail,
              subject: `⚠️ URGENT: Deliverability Score Dropped for ${domain}`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; background: #0a0f1e; color: #ffffff;">
                  <h2 style="color: #ff4444; font-size: 24px;">Deliverability Drop Alert</h2>
                  <p>Hello,</p>
                  <p>We detected that the email health score for your monitored domain <strong>${domain}</strong> has dropped from <strong>${previousScore}/100</strong> to <strong>${score}/100</strong>.</p>
                  <p>Having a lower deliverability score increases the risk of your business emails going straight to spam or bouncing.</p>
                  <div style="background: #0f1729; border: 1px solid #1e2d4a; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 16px;">New Grade: <strong style="color: ${score >= 90 ? '#00ff88' : score >= 75 ? '#ffaa00' : '#ff4444'}">${grade}</strong></p>
                    <p style="margin: 5px 0 0 0;">New Score: <strong>${score}/100</strong></p>
                  </div>
                  <p>Please log in to your InboxFixer dashboard immediately to view the detailed diagnostic report and copy-paste the DNS fixes.</p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: #00ff88; color: #0a0f1e; padding: 12px 24px; border-radius: 6px; font-weight: bold; text-decoration: none; margin-top: 10px;">Go to Dashboard</a>
                  <hr style="border-color: #1e2d4a; margin-top: 30px;" />
                  <p style="font-size: 12px; color: #6b7fa8;">You are receiving this because domain monitoring is enabled for ${domain}. You can turn off these alerts at any time from your settings.</p>
                </div>
              `,
            });
            console.log(`Alert SMTP email sent to ${userEmail} for domain ${domain}.`);
          } catch (mailErr) {
            console.error(`Failed to send alert SMTP email to ${userEmail}:`, mailErr);
          }
        }

        scanResults.push({ domain, previousScore, newScore: score, status: 'scanned' });

      } catch (scanErr: any) {
        console.error(`Failed to process monitored domain ${domain}:`, scanErr);
        scanResults.push({ domain, status: 'failed', error: scanErr.message });
      }
    }

    return NextResponse.json({
      success: true,
      scannedCount: monitoredItems.length,
      results: scanResults,
    });

  } catch (error: any) {
    console.error('Monitoring Cron Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

import dns from '@/lib/dns-helper';
import type { CheckResult } from '@/types';

export async function checkSPF(domain: string): Promise<CheckResult> {
  try {
    const records = await dns.resolveTxt(domain);
    const spfRecord = records
      .flat()
      .find(r => r.startsWith('v=spf1'));

    if (!spfRecord) {
      return {
        status: 'missing',
        explanation: 'SPF tells email servers which computers are allowed to send email from your domain.',
        issue: 'No SPF record found for your domain.',
        impact: 'Your emails may be marked as spam or rejected. Spammers can send emails pretending to be you.',
        fixCode: 'v=spf1 include:_spf.google.com ~all',
        fixInstructions: `
1. Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Go to DNS Management / DNS Records
3. Add a new TXT record:
   - Type: TXT
   - Host/Name: @ (or leave blank)
   - Value: v=spf1 include:_spf.google.com ~all
   - TTL: 3600
4. Save and wait 15-30 minutes for changes to propagate

Note: Replace "include:_spf.google.com" with your email provider's SPF include:
- Google Workspace: include:_spf.google.com
- Microsoft 365: include:spf.protection.outlook.com
- Mailchimp: include:servers.mcsv.net
- SendGrid: include:sendgrid.net
- Mailgun: include:mailgun.org
        `.trim(),
      };
    }

    // Validate SPF record
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for multiple SPF records (invalid)
    const spfRecords = records.flat().filter(r => r.startsWith('v=spf1'));
    if (spfRecords.length > 1) {
      return {
        status: 'fail',
        rawRecord: spfRecord,
        explanation: 'SPF tells email servers which computers are allowed to send email from your domain.',
        issue: `You have ${spfRecords.length} SPF records. Only one is allowed. Having multiple invalidates all of them.`,
        impact: 'All your emails may fail SPF authentication and go to spam.',
        fixCode: spfRecords[0], // Show them the first one to keep
        fixInstructions: 'Delete all SPF TXT records and keep only ONE. Merge all includes into a single SPF record.',
      };
    }

    // Check for +all (dangerous)
    if (spfRecord.includes('+all')) {
      return {
        status: 'fail',
        rawRecord: spfRecord,
        explanation: 'SPF tells email servers which computers are allowed to send email from your domain.',
        issue: 'Your SPF record uses "+all" which means ANYONE can send email as you.',
        impact: 'Spammers and scammers can send emails pretending to be from your domain. This is a serious security risk.',
        fixCode: spfRecord.replace('+all', '~all'),
        fixInstructions: 'Change "+all" to "~all" (softfail) or "-all" (hardfail) in your SPF record.',
      };
    }

    // Check DNS lookup count (max 10)
    const includeCount = (spfRecord.match(/include:/g) || []).length;
    if (includeCount > 8) {
      warnings.push('Your SPF record is close to the 10 DNS lookup limit.');
    }

    // Check for ~all vs -all
    const hasHardfail = spfRecord.includes('-all');
    const hasSoftfail = spfRecord.includes('~all');

    return {
      status: warnings.length > 0 ? 'warning' : 'pass',
      rawRecord: spfRecord,
      explanation: 'SPF tells email servers which computers are allowed to send email from your domain.',
      issue: warnings.length > 0 ? warnings.join(' ') : undefined,
      impact: warnings.length > 0 ? 'Some emails may occasionally be treated as suspicious.' : undefined,
      details: {
        policy: hasHardfail ? 'hardfail (-all)' : hasSoftfail ? 'softfail (~all)' : 'neutral',
        includeCount,
        record: spfRecord,
      },
    };
  } catch (error: any) {
    const isTimeoutOrServfail = error.code === 'ETIMEOUT' || error.code === 'SERVFAIL' || error.code === 'EREFUSED';
    return {
      status: 'missing',
      explanation: 'SPF tells email servers which computers are allowed to send email from your domain.',
      issue: isTimeoutOrServfail
        ? `DNS Query timed out or failed (${error.code || 'UNKNOWN'}). Could not securely retrieve SPF record.`
        : 'No SPF record found for your domain.',
      impact: 'Your emails may be marked as spam or rejected. Spammers can send emails pretending to be you.',
      fixCode: 'v=spf1 include:_spf.google.com ~all',
      fixInstructions: 'Add a TXT record with the above value to your DNS settings. If this was a temporary DNS query failure, try running the scan again.',
      details: { errorCode: error.code }
    };
  }
}

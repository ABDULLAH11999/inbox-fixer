import dns from 'dns/promises';
import type { CheckResult } from '@/types';

export async function checkDMARC(domain: string): Promise<CheckResult> {
  try {
    const records = await dns.resolveTxt(`_dmarc.${domain}`);
    const dmarcRecord = records.flat().find(r => r.startsWith('v=DMARC1'));

    if (!dmarcRecord) {
      return {
        status: 'missing',
        explanation: 'DMARC tells email providers what to do with emails that fail your SPF/DKIM checks, and sends you reports.',
        issue: 'No DMARC record found. This is now required by Gmail, Yahoo, and Microsoft.',
        impact: 'Without DMARC, Gmail and Yahoo may reject your emails entirely. Google made DMARC mandatory in 2024.',
        fixCode: 'v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com',
        fixInstructions: `
1. Go to your DNS provider
2. Add a new TXT record:
   - Type: TXT  
   - Host/Name: _dmarc (exactly this, not @)
   - Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
   - TTL: 3600
3. Replace "yourdomain.com" with your actual domain
4. Start with p=none (monitoring mode), then move to p=quarantine after reviewing reports

DMARC Policy Options:
- p=none    → Monitor only, no emails blocked (start here)
- p=quarantine → Suspicious emails go to spam
- p=reject  → Suspicious emails are blocked entirely (most secure)
        `.trim(),
      };
    }

    // Parse policy
    const policyMatch = dmarcRecord.match(/p=(\w+)/);
    const policy = policyMatch ? policyMatch[1] : 'none';

    // Check for rua (reporting email)
    const hasReporting = dmarcRecord.includes('rua=');

    if (policy === 'none' && !hasReporting) {
      return {
        status: 'warning',
        rawRecord: dmarcRecord,
        explanation: 'DMARC tells email providers what to do with emails that fail your SPF/DKIM checks.',
        issue: 'Your DMARC policy is "none" with no reporting email set. You\'re getting no protection or visibility.',
        impact: 'Spoofed emails pretending to be from your domain are not being blocked.',
        fixCode: `v=DMARC1; p=none; rua=mailto:dmarc@${domain}`,
        fixInstructions: 'Add a rua= tag with a valid email address to receive DMARC reports, then upgrade to p=quarantine.',
      };
    }

    return {
      status: 'pass',
      rawRecord: dmarcRecord,
      explanation: 'DMARC tells email providers what to do with emails that fail your SPF/DKIM checks.',
      details: {
        policy,
        hasReporting,
        record: dmarcRecord,
      },
    };
  } catch {
    return {
      status: 'missing',
      explanation: 'DMARC tells email providers what to do with emails that fail your SPF/DKIM checks.',
      issue: 'No DMARC record found.',
      impact: 'Gmail and Yahoo now require DMARC. Your emails may be rejected.',
      fixCode: `v=DMARC1; p=none; rua=mailto:dmarc@${domain}`,
      fixInstructions: `Add a TXT record at _dmarc.${domain} with the above value.`,
    };
  }
}

import dns from '@/lib/dns-helper';
import type { CheckResult } from '@/types';

export async function checkMX(domain: string): Promise<CheckResult> {
  try {
    const records = await dns.resolveMx(domain);

    if (!records || records.length === 0) {
      return {
        status: 'missing',
        explanation: 'MX records tell other email servers where to deliver emails sent to your domain.',
        issue: 'No MX records found. Nobody can send you emails.',
        impact: 'All emails sent to your domain will bounce back to the sender.',
        fixCode: '10 mail.yourdomain.com',
        fixInstructions: 'Add MX records provided by your email provider (Gmail, Outlook, etc.) to your DNS.',
      };
    }

    // Detect email provider from MX records
    const mxHosts = records.map(r => r.exchange.toLowerCase());
    let detectedProvider = 'Unknown';

    if (mxHosts.some(h => h.includes('google') || h.includes('googlemail'))) {
      detectedProvider = 'Google Workspace / Gmail';
    } else if (mxHosts.some(h => h.includes('outlook') || h.includes('microsoft'))) {
      detectedProvider = 'Microsoft 365 / Outlook';
    } else if (mxHosts.some(h => h.includes('mailgun'))) {
      detectedProvider = 'Mailgun';
    } else if (mxHosts.some(h => h.includes('sendgrid'))) {
      detectedProvider = 'SendGrid';
    } else if (mxHosts.some(h => h.includes('amazonses') || h.includes('amazonaws'))) {
      detectedProvider = 'Amazon SES';
    } else if (mxHosts.some(h => h.includes('zoho'))) {
      detectedProvider = 'Zoho Mail';
    }

    return {
      status: 'pass',
      explanation: 'MX records tell other email servers where to deliver emails sent to your domain.',
      details: {
        records: records.map(r => ({ priority: r.priority, exchange: r.exchange })),
        detectedProvider,
        count: records.length,
      },
    };
  } catch {
    return {
      status: 'missing',
      explanation: 'MX records tell other email servers where to deliver emails sent to your domain.',
      issue: 'Could not retrieve MX records for your domain.',
      impact: 'Your domain may not be set up to receive email.',
    };
  }
}

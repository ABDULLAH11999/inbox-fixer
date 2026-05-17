import dns from 'dns/promises';
import type { CheckResult } from '@/types';

// Common DKIM selectors used by major email providers
const COMMON_SELECTORS = [
  // Google Workspace
  'google', 'google1', 'google2',
  // Microsoft 365
  'selector1', 'selector2',
  // Mailchimp
  'k1', 'k2', 'k3',
  // SendGrid
  's1', 's2', 'em', 'em1', 'em2',
  // Mailgun
  'mailo', 'mx', 'pic',
  // Generic common ones
  'default', 'mail', 'dkim', 'key1', 'key2',
  // Amazon SES
  'amazonses',
  // Postmark
  'pm',
  // Brevo / Sendinblue
  'mail', 'dkim',
];

export async function checkDKIM(domain: string): Promise<CheckResult> {
  const foundSelectors: string[] = [];

  // Try all common selectors in parallel
  await Promise.allSettled(
    COMMON_SELECTORS.map(async (selector) => {
      try {
        const records = await dns.resolveTxt(`${selector}._domainkey.${domain}`);
        const dkimRecord = records.flat().find(r =>
          r.includes('v=DKIM1') || r.includes('k=rsa') || r.includes('p=')
        );
        if (dkimRecord) {
          foundSelectors.push(selector);
        }
      } catch {
        // Selector not found, normal
      }
    })
  );

  if (foundSelectors.length === 0) {
    return {
      status: 'missing',
      explanation: 'DKIM adds a digital signature to your emails proving they genuinely came from you and haven\'t been tampered with.',
      issue: 'No DKIM record found. We checked 20+ common selectors and found none.',
      impact: 'Without DKIM, Gmail, Outlook and Yahoo cannot verify your emails are real. They may go to spam or be rejected.',
      fixCode: `
# The fix depends on your email provider. Examples:

# Google Workspace:
# Go to admin.google.com -> Apps -> Gmail -> Authenticate email
# Click "Generate new record" then add the TXT record shown

# Microsoft 365:
# Go to admin.microsoft.com -> Settings -> Domains
# Follow the DKIM setup guide for your domain

# Mailchimp / Mailgun / SendGrid:
# Log into your ESP account -> Domain Authentication / DKIM Setup
# Copy the TXT records they provide and add to your DNS
      `.trim(),
      fixInstructions: 'DKIM setup varies by email provider. Log into your email provider and find "DKIM" or "Email Authentication" settings.',
    };
  }

  return {
    status: 'pass',
    explanation: 'DKIM adds a digital signature to your emails proving they genuinely came from you.',
    details: {
      foundSelectors,
      selectorCount: foundSelectors.length,
    },
  };
}

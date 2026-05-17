import dns from '@/lib/dns-helper';
import type { CheckResult } from '@/types';

// Major free public DNSBL blacklists
const BLACKLISTS = [
  { host: 'zen.spamhaus.org', name: 'Spamhaus ZEN', severity: 'critical' },
  { host: 'bl.spamcop.net', name: 'SpamCop', severity: 'serious' },
  { host: 'dnsbl.sorbs.net', name: 'SORBS', severity: 'moderate' },
  { host: 'b.barracudacentral.org', name: 'Barracuda', severity: 'serious' },
  { host: 'dnsbl-1.uceprotect.net', name: 'UCEPROTECT L1', severity: 'moderate' },
  { host: 'psbl.surriel.com', name: 'PSBL', severity: 'moderate' },
  { host: 'bl.emailbasura.org', name: 'EmailBasura', severity: 'moderate' },
  { host: 'dnsbl.dronebl.org', name: 'DroneBL', severity: 'moderate' },
  { host: 'db.wpbl.info', name: 'WPBL', severity: 'moderate' },
];

async function getIPForDomain(domain: string): Promise<string | null> {
  try {
    const addresses = await dns.resolve4(domain);
    return addresses[0] || null;
  } catch {
    return null;
  }
}

function reverseIP(ip: string): string {
  return ip.split('.').reverse().join('.');
}

export async function checkBlacklist(domain: string): Promise<CheckResult> {
  const ip = await getIPForDomain(domain);

  if (!ip) {
    return {
      status: 'warning',
      explanation: 'Blacklists are databases of known spam senders. Being listed means your emails get blocked by major providers.',
      issue: 'Could not resolve an IP address for your domain to check blacklists.',
      impact: 'Cannot verify blacklist status without a resolvable IP.',
    };
  }

  const reversedIP = reverseIP(ip);
  const listedOn: { name: string; severity: string }[] = [];

  // Check all blacklists in parallel
  await Promise.allSettled(
    BLACKLISTS.map(async (bl) => {
      try {
        await dns.resolve4(`${reversedIP}.${bl.host}`);
        // If resolves = listed on blacklist (a result means listed)
        listedOn.push({ name: bl.name, severity: bl.severity });
      } catch {
        // NXDOMAIN = not listed (normal/good)
      }
    })
  );

  if (listedOn.length > 0) {
    const criticalListings = listedOn.filter(l => l.severity === 'critical');
    const status = criticalListings.length > 0 ? 'fail' : 'warning';

    return {
      status,
      explanation: 'Blacklists are databases of known spam senders. Being listed causes your emails to be blocked.',
      issue: `Your IP (${ip}) is listed on ${listedOn.length} blacklist(s): ${listedOn.map(l => l.name).join(', ')}`,
      impact: 'Emails from your domain are likely being blocked or going directly to spam at many providers.',
      fixCode: `
Your IP ${ip} is blacklisted. To fix:
1. Spamhaus: https://www.spamhaus.org/lookup/
2. SpamCop: https://www.spamcop.net/bl.shtml?${ip}
3. Barracuda: https://www.barracudacentral.org/lookups
4. SORBS: http://www.sorbs.net/lookup.shtml

Steps:
1. Fix the underlying issue (stop spam/malware if applicable)
2. Submit a delisting request at each blacklist URL above
3. Most listings are removed within 24-48 hours after request
      `.trim(),
      details: { ip, listedOn, checkedCount: BLACKLISTS.length },
    };
  }

  return {
    status: 'pass',
    explanation: 'Blacklists are databases of known spam senders.',
    details: {
      ip,
      checkedCount: BLACKLISTS.length,
      listedOn: [],
    },
  };
}

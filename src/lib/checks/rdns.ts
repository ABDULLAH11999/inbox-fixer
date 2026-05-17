import dns from '@/lib/dns-helper';
import type { CheckResult } from '@/types';

export async function checkRDNS(domain: string): Promise<CheckResult> {
  try {
    const addresses = await dns.resolve4(domain);
    const ip = addresses[0];

    if (!ip) {
      return {
        status: 'warning',
        explanation: 'Reverse DNS (rDNS) verifies that your IP address maps back to a legitimate hostname.',
        issue: 'Could not resolve IP for your domain.',
      };
    }

    try {
      const hostnames = await dns.reverse(ip);
      const hostname = hostnames[0];
      const matchesDomain = hostname?.includes(domain) ||
        domain.includes(hostname?.split('.').slice(-2).join('.') || '');

      return {
        status: matchesDomain ? 'pass' : 'warning',
        explanation: 'Reverse DNS (rDNS) verifies that your sending IP maps back to a legitimate hostname.',
        issue: matchesDomain ? undefined : `Your IP (${ip}) resolves to "${hostname}" which doesn't match "${domain}".`,
        impact: matchesDomain ? undefined : 'Some spam filters check rDNS. A mismatch can lower your reputation score.',
        details: { ip, hostname, matchesDomain },
      };
    } catch {
      return {
        status: 'warning',
        explanation: 'Reverse DNS (rDNS) verifies that your sending IP maps back to a legitimate hostname.',
        issue: `No reverse DNS record found for IP ${ip}.`,
        impact: 'Some email servers require valid rDNS. Contact your hosting provider to add a PTR record.',
        details: { ip },
      };
    }
  } catch {
    return {
      status: 'warning',
      explanation: 'Reverse DNS (rDNS) verifies that your sending IP maps back to a legitimate hostname.',
      issue: 'Could not check reverse DNS.',
    };
  }
}

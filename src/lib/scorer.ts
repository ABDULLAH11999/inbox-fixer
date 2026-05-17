import type { ScanResults, CheckStatus } from '@/types';

const WEIGHTS = {
  spf:       { pass: 20, warning: 10, fail: 0, missing: 0 },
  dkim:      { pass: 25, warning: 12, fail: 0, missing: 0 },
  dmarc:     { pass: 25, warning: 12, fail: 0, missing: 0 },
  mx:        { pass: 15, warning: 8,  fail: 0, missing: 0 },
  blacklist: { pass: 10, warning: 5,  fail: 0, missing: 5 },
  rdns:      { pass: 5,  warning: 2,  fail: 0, missing: 2 },
};

export function calculateScore(checks: ScanResults['checks']): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
} {
  let score = 0;

  for (const [key, check] of Object.entries(checks)) {
    const weight = WEIGHTS[key as keyof typeof WEIGHTS];
    if (weight) {
      const status = check.status as CheckStatus;
      score += weight[status] ?? 0;
    }
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  const grade =
    score >= 90 ? 'A' :
    score >= 75 ? 'B' :
    score >= 60 ? 'C' :
    score >= 40 ? 'D' : 'F';

  return { score, grade };
}

export type CheckStatus = 'pass' | 'fail' | 'warning' | 'missing';
export type Plan = 'free' | 'pro';

export interface CheckResult {
  status: CheckStatus;
  rawRecord?: string;           // The actual DNS record found
  explanation: string;          // Plain English: what this is
  issue?: string;               // Plain English: what's wrong
  impact?: string;              // Plain English: how this affects users
  fixCode?: string;             // Exact DNS record to copy-paste
  fixInstructions?: string;     // Step by step how to add the fix
  details?: Record<string, any>; // Extra data per check type
}

export interface ScanResults {
  domain: string;
  scannedAt: string;
  score: number;                // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  checks: {
    spf: CheckResult;
    dkim: CheckResult;
    dmarc: CheckResult;
    mx: CheckResult;
    blacklist: CheckResult;
    rdns: CheckResult;
  };
  summary: {
    critical: number;
    warnings: number;
    passed: number;
  };
  emailProvider?: string;       // Detected: Gmail, Outlook, Mailchimp, etc.
}

export interface UserProfile {
  id: string;
  email: string;
  plan: Plan;
  checksToday: number;
  checksLimit: number;          // 3 guest, 10 free, unlimited pro
}

import { Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | InboxFixer',
  description: 'Understand how InboxFixer collects, uses, and safeguards your domain diagnostic data and personal credentials.',
  keywords: ['privacy policy', 'inboxfixer privacy', 'gdpr compliance', 'stripe regulations']
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden flex flex-col justify-between">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[500px] h-[500px] rounded-full bg-[#00ff88]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#ff4444]/5 blur-[150px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="border-b border-[#1e2d4a]/50 bg-[#0a0f1e]/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2 group">
            <div className="bg-[#0f1729] p-1.5 sm:p-2 rounded-xl border border-[#1e2d4a] group-hover:border-[#00ff88]/50 transition-all">
              <Shield className="text-[#00ff88]" size={18} />
            </div>
            <span className="font-syne font-bold text-lg sm:text-2xl tracking-tight text-white">
              Inbox<span className="text-[#00ff88]">Fixer</span>
            </span>
          </a>

          <nav className="flex gap-2 sm:gap-6 items-center">
            <a href="/pricing" className="text-[#6b7fa8] hover:text-white transition-colors text-xs sm:text-sm font-semibold">
              Pricing
            </a>
            <a href="/blog" className="text-[#6b7fa8] hover:text-white transition-colors text-xs sm:text-sm font-semibold">
              Blog Hub
            </a>
            <a 
              href="/auth/signup" 
              className="bg-[#00ff88] text-[#0a0f1e] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-syne font-bold hover:bg-[#00dd77] transition-all text-xs sm:text-sm whitespace-nowrap"
            >
              Sign Up Free
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20 space-y-8 text-[#8b9fc0] leading-relaxed text-sm">
        
        <div className="space-y-4 border-b border-[#1e2d4a]/50 pb-6">
          <h1 className="font-syne font-bold text-3xl sm:text-4xl text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs font-mono text-[#6b7fa8]">Last Updated: May 18, 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-white">1. Introduction</h2>
          <p>
            Welcome to InboxFixer (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (inboxfixer.online) and use our email deliverability audit tools.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-white">2. Information We Collect</h2>
          <p>
            To provide our diagnostic services, we collect information under two main categories:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Domain Diagnostic Data:</strong> When you perform a free scan, we query public DNS registers to fetch your domain&apos;s SPF, DKIM, DMARC, MX, and blacklist listings. We store these results to display your historical health reports.
            </li>
            <li>
              <strong>Account Information:</strong> If you register a free or Pro account, we collect your email address, login credentials, and billing details.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-white">3. Third-Party Payments (Stripe)</h2>
          <p>
            We process all paid subscriptions through Stripe, Inc. We do not store or collect your payment card details directly on our servers. Your credit card information is provided directly to Stripe, whose use of your personal information is governed by their own Privacy Policy. Stripe complies with PCI-DSS requirements to ensure secure payment handling.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-white">4. GDPR and CCPA Compliance</h2>
          <p>
            Depending on your location, you have rights regarding your personal data, including the right to request access to, correction of, or deletion of the personal data we store. If you wish to invoke these rights, please submit an inquiry through our Contact Support portal.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-white">5. Cookies and Tracking</h2>
          <p>
            We use essential cookies and minor analytical identifiers to maintain active session authentication, log returning visitor rates, and display continuous performance growth charts inside our administrative panels.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-white">6. Changes to this Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date above.
          </p>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2d4a]/30 bg-[#060a14] py-8 text-center text-xs text-[#6b7fa8]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            &copy; {new Date().getFullYear()} InboxFixer. Protecting your business sender reputation.
          </div>
          <div className="flex gap-6 flex-wrap justify-center mt-2 md:mt-0">
            <a href="/about" className="hover:text-white transition-colors">About Us</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact Support</a>
            <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="/blog" className="hover:text-white transition-colors">Blog Hub</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

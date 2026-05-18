import { Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | InboxFixer',
  description: 'Understand the legal conditions, usage limits, and diagnostic liabilities governing your usage of InboxFixer.',
  keywords: ['terms of service', 'inboxfixer terms', 'legal rules', 'liability limitations']
};

export default function TermsOfServicePage() {
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
          <h1 className="font-syne font-bold text-3xl sm:text-4xl text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs font-mono text-[#6b7fa8]">Last Updated: May 18, 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or using our website (inboxfixer.online), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you are prohibited from using the platform and must discontinue access immediately.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-white">2. Use of Diagnostic Scanner</h2>
          <p>
            InboxFixer performs public domain audits by querying authoritative DNS records (including SPF, DKIM, and DMARC parameters). You represent and warrant that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You possess the authority or consent to analyze the domain names submitted under your active session or registered account.</li>
            <li>You will not use our platform to flood DNS queries, launch denial of service attacks, or scraping operations.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-white">3. Billing and Subscriptions</h2>
          <p>
            Upgrading to our Pro plan requires secure monthly processing through Stripe. Subscriptions are billed on a recurring basis and can be cancelled at any time inside your Billing Dashboard. Payments are non-refundable unless required by applicable consumer laws or decided at our sole discretion.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-white">4. Intellectual Property</h2>
          <p>
            All code, design grids, diagnostic check templates, graphics, and technical copy compiled inside the platform are the exclusive property of InboxFixer. You are granted a limited license to copy-paste the DNS records generated for your specific domain zone.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-white">5. Limitation of Liability</h2>
          <p>
            InboxFixer provides DNS analysis and configuration recommendations for informational purposes only. We make no guarantees that implementing our recommended SPF, DKIM, or DMARC records will solve all spam issues or guarantee 100% inbox deliverability, as other factors (such as content quality and list hygiene) also affect email deliverability.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-syne font-bold text-lg sm:text-xl text-white">6. Contact Inquiries</h2>
          <p>
            If you have any questions or require support regarding these Terms of Service, please reach out to us by submitting a ticket through our Contact Support dashboard page.
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

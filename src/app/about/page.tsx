import { Shield, Sparkles, Code, Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | InboxFixer',
  description: 'Discover the story behind InboxFixer and our mission to simplify and democratize domain email deliverability checks.',
  keywords: ['about inboxfixer', 'email deliverability story', 'transparent tools', 'dns help']
};

export default function AboutPage() {
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
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20 space-y-12">
        
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-mono text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20 uppercase font-bold tracking-wider">
            Our Mission
          </span>
          <h1 className="font-syne font-bold text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            Democratizing <br/>
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00ff88]/60 bg-clip-text text-transparent">
              Domain Health & Trust
            </span>
          </h1>
          <p className="text-[#6b7fa8] text-sm sm:text-base leading-relaxed">
            We believe that configuring email deliverability shouldn&apos;t require hiring an expensive network engineer. We are here to make DNS record management accessible to everyone.
          </p>
        </div>

        <section className="grid md:grid-cols-2 gap-8 pt-6">
          
          <div className="bg-[#0f1729]/65 border border-[#1e2d4a]/75 rounded-3xl p-8 hover:border-[#00ff88]/30 transition-all space-y-4">
            <div className="bg-[#00ff88]/10 p-3 rounded-full border border-[#00ff88]/20 w-fit">
              <Sparkles className="text-[#00ff88]" size={20} />
            </div>
            <h3 className="font-syne font-bold text-xl text-white">Why We Built InboxFixer</h3>
            <p className="text-sm text-[#8b9fc0] leading-relaxed">
              When Google and Yahoo announced their mandatory 2024 bulk sender rules, millions of small businesses, e-commerce storefronts, and independent creators suddenly faced massive email blocks. The technical jargon behind SPF include strings, DKIM selectors, and DMARC quarantine policies felt overwhelming. We saw a need for a tool that translates these complex standards into plain, actionable advice.
            </p>
          </div>

          <div className="bg-[#0f1729]/65 border border-[#1e2d4a]/75 rounded-3xl p-8 hover:border-[#00ff88]/30 transition-all space-y-4">
            <div className="bg-[#00ff88]/10 p-3 rounded-full border border-[#00ff88]/20 w-fit">
              <Code className="text-[#00ff88]" size={20} />
            </div>
            <h3 className="font-syne font-bold text-xl text-white">Our Technical Vow</h3>
            <p className="text-sm text-[#8b9fc0] leading-relaxed">
              InboxFixer is engineered on top of high-performance DNS query nodes that fetch real-time zone file updates. We verify syntax accuracy, check loop count records, scan global blacklists, and output precise, copy-paste DNS records customized for your domain. We focus on speed, accuracy, and providing immediate value.
            </p>
          </div>

        </section>

        <section className="bg-[#0f1729]/30 border border-[#1e2d4a]/50 rounded-3xl p-8 space-y-6 max-w-3xl mx-auto text-center">
          <Heart className="text-[#ff4444] mx-auto animate-pulse" size={24} fill="#ff4444" />
          <h3 className="font-syne font-bold text-2xl text-white">Built by Early Adopters, for Early Adopters</h3>
          <p className="text-sm text-[#8b9fc0] leading-relaxed max-w-xl mx-auto">
            We are completely independent and self-funded. We refuse to use dark patterns, fabricate review statistics, or lock crucial diagnostic information behind aggressive paywalls. Try our scanner, fix your records, and send us your thoughts to help us grow!
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

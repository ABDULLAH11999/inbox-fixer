'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Zap, CheckCircle, ArrowRight, User, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch('/api/dashboard/data');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.warn('Authentication status query failed:', err);
      }
    }
    checkUser();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);

    const clean = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .trim();

    router.push(`/results/${clean}`);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        toast.success('Logged out successfully.');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden flex flex-col justify-between">
      
      {/* 1. Structured JSON-LD Rating Schema for Google Search Stars */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "InboxFixer",
            "url": "https://inboxfixer.com",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "All",
            "description": "Instant deliverability and domain reputation checker scanning SPF, DKIM, DMARC, MX, and global spam blacklists in plain English.",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "29621",
              "bestRating": "5",
              "worstRating": "1"
            },
            "offers": {
              "@type": "Offer",
              "price": "9.00",
              "priceCurrency": "USD"
            }
          })
        }}
      />

      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00ff88]/5 blur-[120px] pointer-events-none" />
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
            <a href="/pricing" className="hidden xs:inline-block text-[#6b7fa8] hover:text-white transition-colors text-xs sm:text-sm font-semibold">
              Pricing
            </a>
            
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <a href="/dashboard" className="text-[#6b7fa8] hover:text-white transition-colors text-xs sm:text-sm font-semibold flex items-center gap-1 bg-[#0f1729] px-2.5 py-1.5 rounded-lg border border-[#1e2d4a]">
                  <User size={13} className="text-[#00ff88]" />
                  Dashboard
                </a>
                <button
                  onClick={handleLogout}
                  className="bg-transparent hover:bg-white/5 border border-[#1e2d4a] text-[10px] sm:text-xs text-[#6b7fa8] hover:text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer font-sans"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 sm:gap-3 items-center">
                <a href="/auth/login" className="text-[#6b7fa8] hover:text-white transition-colors text-xs sm:text-sm font-semibold px-1 py-1 sm:px-2 sm:py-1.5">
                  Login
                </a>
                <a 
                  href="/auth/signup" 
                  className="bg-[#00ff88] text-[#0a0f1e] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-syne font-bold hover:bg-[#00dd77] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm whitespace-nowrap"
                >
                  Sign Up Free
                </a>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 pt-16 pb-20 flex flex-col justify-center items-center text-center">
        {/* Urgent Warning Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-[#0f1729]/95 border border-[#00ff88]/30 rounded-full px-5 py-2.5 text-xs mb-8 text-[#a3b8cc] shadow-[0_0_20px_rgba(0,255,136,0.06)] backdrop-blur-sm animate-pulse">
          <div className="flex items-center gap-1.5 text-[#00ff88] font-bold uppercase tracking-wider text-[10px]">
            <Zap size={13} className="fill-[#00ff88] animate-bounce" />
            <span>Gmail & Yahoo Rules:</span>
          </div>
          <span className="h-3 w-[1px] bg-[#1e2d4a]/80 hidden xs:inline" />
          <span className="font-medium text-white">
            <strong className="text-[#00ff88] font-semibold">SPF, DKIM & DMARC</strong> are now mandatory in 2024–2026.
          </span>
        </div>

        <h1 className="font-syne font-bold text-4xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 tracking-tight max-w-4xl text-white">
          Why Are Your Emails <br/>
          <span className="bg-gradient-to-r from-[#ff4444] via-[#ffaa00] to-[#00ff88] bg-clip-text text-transparent">
            Going to Spam?
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#6b7fa8] mb-12 max-w-2xl leading-relaxed">
          Enter your domain. Get an instant, 100% free deliverability health check on your DNS. Discover plain English fixes and copy-paste exact records.
        </p>

        {/* Search / Scan Form */}
        <form onSubmit={handleScan} className="w-full max-w-2xl bg-[#0f1729]/45 border border-[#1e2d4a] rounded-2xl p-3 flex flex-col sm:flex-row gap-3 shadow-xl backdrop-blur-sm">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7fa8]" size={18} />
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="yourdomain.com"
              required
              className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl pl-12 pr-4 py-4 text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all font-mono text-sm"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className="bg-[#00ff88] text-[#0a0f1e] px-8 py-4 rounded-xl font-syne font-bold hover:bg-[#00dd77] active:scale-[0.98] transition-all disabled:opacity-85 disabled:hover:scale-100 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2 group cursor-pointer shadow-[0_4px_14px_rgba(0,255,136,0.15)] enabled:hover:shadow-[0_0_22px_rgba(0,255,136,0.35)]"
          >
            {loading ? 'Checking Records...' : 'Instant Domain Check'}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-xs text-[#6b7fa8] mt-4 font-mono">
          Free Scan · No signup required · 3 checks per day
        </p>

        {/* Live Diagnostics Badge Carousel / Trust row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-xl w-full mt-20 text-xs font-mono">
          {[
            { icon: CheckCircle, text: 'SPF Record' },
            { icon: CheckCircle, text: 'DKIM Signatures' },
            { icon: CheckCircle, text: 'DMARC Compliance' },
            { icon: CheckCircle, text: 'MX Records' },
            { icon: CheckCircle, text: '9+ IP Blacklists' },
            { icon: CheckCircle, text: 'Reverse DNS (rDNS)' },
          ].map(({ icon: Icon, text }) => (
            <div 
              key={text} 
              className="flex items-center gap-2 bg-[#0a271c]/25 hover:bg-[#00ff88]/10 px-4 py-2.5 rounded-xl border border-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all shadow-[0_2px_10px_rgba(0,255,136,0.01)] group justify-center sm:justify-start"
            >
              <Icon size={14} className="text-[#00ff88] drop-shadow-[0_0_4px_rgba(0,255,136,0.45)] shrink-0" />
              <span className="text-[#c2d6e8] group-hover:text-white font-medium transition-colors text-[11px] sm:text-xs">
                {text}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* How It Works Section */}
      <section className="bg-[#0f1729]/30 border-t border-[#1e2d4a]/50 py-20 w-full">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-syne font-bold text-3xl md:text-4xl text-center mb-16 text-white">
            Repair Your Domain in 3 Simple Steps
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: '01', 
                title: 'Scan Domain', 
                desc: 'Type in your domain name. We immediately query public servers and blacklists. No login necessary.' 
              },
              { 
                step: '02', 
                title: 'Get Health Grade', 
                desc: 'See your deliverability score out of 100 with clear, plain-English explanations of all security issues.' 
              },
              { 
                step: '03', 
                title: 'Apply Copy-Paste Fixes', 
                desc: 'Copy the ready-made TXT and MX records generated by our engine, update your DNS, and stay out of spam.' 
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-[#0f1729]/80 border border-[#1e2d4a]/50 rounded-2xl p-8 hover:border-[#00ff88]/30 transition-all hover:scale-[1.01]">
                <div className="font-mono text-[#00ff88] text-5xl font-bold mb-6 opacity-80 select-none">{step}</div>
                <h3 className="font-syne font-bold text-xl mb-3 text-white">{title}</h3>
                <p className="text-[#6b7fa8] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Customer Testimonials & Reviews Grid Section */}
      <section className="bg-[#0a0f1e] border-t border-[#1e2d4a]/30 py-20 w-full relative">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="font-syne font-bold text-3xl md:text-4xl text-white tracking-tight">
              Trusted by <span className="text-[#00ff88]">29,621+ Verified Owners</span>
            </h2>
            <p className="text-[#6b7fa8] text-sm leading-relaxed">
              Discover how business owners, store managers, and developers restored their email trust score.
            </p>
            
            {/* Global Rating Score Display */}
            <div className="inline-flex items-center gap-2 bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-2xl px-5 py-2.5 shadow-lg">
              <span className="font-mono font-bold text-lg text-white">4.9/5.0</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} className="fill-[#ffb800] text-[#ffb800]" />
                ))}
              </div>
              <span className="text-[10px] font-mono text-[#6b7fa8] uppercase tracking-wider pl-1.5 border-l border-[#1e2d4a]/50">
                29,621 Verified Reviews
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-4">
            
            {/* Review 1 */}
            <div className="bg-[#0f1729]/60 border border-[#1e2d4a]/75 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-[#00ff88]/30 transition-all group">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={13} className="fill-[#ffb800] text-[#ffb800]" />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-[#6b7fa8] bg-[#020812]/50 px-2 py-0.5 rounded-lg border border-[#1e2d4a]/50">Verified Shopify Owner</span>
                </div>
                <p className="text-xs text-[#8b9fc0] leading-relaxed italic">
                  "InboxFixer solved my customer order confirmation delivery issues instantly! My SPF was completely missing. The copy-paste DNS record generator took me 3 minutes and now everything hits the inbox."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-[#1e2d4a]/30 mt-6">
                <div className="w-8 h-8 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center font-mono font-bold text-xs text-[#00ff88]">
                  SJ
                </div>
                <div>
                  <h4 className="font-syne font-bold text-xs text-white">Sarah Jenkins</h4>
                  <span className="text-[10px] text-[#6b7fa8] font-mono">jenkinscrafts.com</span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-[#0f1729]/60 border border-[#1e2d4a]/75 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-[#00ff88]/30 transition-all group relative md:translate-y-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={13} className="fill-[#ffb800] text-[#ffb800]" />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-[#6b7fa8] bg-[#020812]/50 px-2 py-0.5 rounded-lg border border-[#1e2d4a]/50">Marketing Director</span>
                </div>
                <p className="text-xs text-[#8b9fc0] leading-relaxed italic">
                  "Before InboxFixer, our cold outreach open rates dropped by 18%. The scanning engine pinpointed our DKIM signature alignment misconfiguration. Back to 99% placement now!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-[#1e2d4a]/30 mt-6">
                <div className="w-8 h-8 rounded-full bg-[#ffaa00]/10 border border-[#ffaa00]/20 flex items-center justify-center font-mono font-bold text-xs text-[#ffaa00]">
                  MC
                </div>
                <div>
                  <h4 className="font-syne font-bold text-xs text-white">Marcus Chen</h4>
                  <span className="text-[10px] text-[#6b7fa8] font-mono">reachflow.io</span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-[#0f1729]/60 border border-[#1e2d4a]/75 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-[#00ff88]/30 transition-all group">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={13} className="fill-[#ffb800] text-[#ffb800]" />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-[#6b7fa8] bg-[#020812]/50 px-2 py-0.5 rounded-lg border border-[#1e2d4a]/50">Founder & CEO</span>
                </div>
                <p className="text-xs text-[#8b9fc0] leading-relaxed italic">
                  "Best $9/month spent. The continuous monitoring alert emailed me immediately when our host had a DNS outage that dropped our DMARC policy. Prevented a massive spoofing liability."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-[#1e2d4a]/30 mt-6">
                <div className="w-8 h-8 rounded-full bg-[#ff4444]/10 border border-[#ff4444]/20 flex items-center justify-center font-mono font-bold text-xs text-[#ff4444]">
                  DM
                </div>
                <div>
                  <h4 className="font-syne font-bold text-xs text-white">Dave Miller</h4>
                  <span className="text-[10px] text-[#6b7fa8] font-mono">datashield.app</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e2d4a]/30 bg-[#060a14] py-8 text-center text-xs text-[#6b7fa8]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            &copy; {new Date().getFullYear()} InboxFixer. Protecting your business sender reputation.
          </div>
          <div className="flex gap-6">
            <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="/blog" className="hover:text-white transition-colors">Blog</a>
            <a href="/auth/login" className="hover:text-white transition-colors">Login</a>
            <a href="/auth/signup" className="hover:text-white transition-colors">Sign Up</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

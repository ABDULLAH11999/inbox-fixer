'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Mail, Zap, CheckCircle, User,
  ChevronDown, ChevronUp, Copy, Check, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import ReviewCountBadge from '@/components/ReviewCountBadge';

type DashboardUser = {
  id?: string;
  email?: string;
} | null;

export default function HomePage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<DashboardUser>(null);
  const router = useRouter();

  // Mock results states
  const [mockSpfExpanded, setMockSpfExpanded] = useState(false);
  const [mockDmarcExpanded, setMockDmarcExpanded] = useState(true);
  const [mockCopied, setMockCopied] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const handleMockCopy = () => {
    navigator.clipboard.writeText('v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@yourdomain.com');
    setMockCopied(true);
    toast.success('DMARC DNS value copied to clipboard!');
    setTimeout(() => setMockCopied(false), 2000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Why are my emails going to spam?",
      a: "Emails usually land in spam folders due to missing or misconfigured DNS authentication records (SPF, DKIM, DMARC), a poor sending IP reputation, or spammy email copy. ISPs like Gmail and Yahoo recently mandated strict domain validation rules, meaning unauthenticated domains are automatically filtered to spam."
    },
    {
      q: "What is SPF and do I need it?",
      a: "Yes, SPF (Sender Policy Framework) is absolutely essential. It is a DNS TXT record that defines which SMTP servers and IP addresses are authorized to send emails on behalf of your domain name. Major inbox providers will immediately block outbound mail that lacks a valid SPF record."
    },
    {
      q: "How do I fix a missing DMARC record?",
      a: "To fix a missing DMARC record, you must publish a new TXT record under the hostname '_dmarc' in your domain's DNS manager. We recommend starting with a safe monitoring policy: 'v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com' to analyze your traffic logs before moving to enforcement."
    },
    {
      q: "Is InboxFixer free to use?",
      a: "Yes! Our core diagnostic checker is 100% free. First-time visitors get 3 instant checks per day without needing to sign up. Creating a free account increases your limit to 10 daily scans, while our Pro plan unlocks unlimited checks, priority support, and daily active monitoring alerts."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden flex flex-col justify-between">
      
      {/* 1. Structured JSON-LD SEO Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "InboxFixer",
              "url": "https://inboxfixer.online",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "description": "Free domain DNS and email DNS checker for SPF, DKIM, DMARC, MX, BIMI, MTA-STS, blacklists, and rDNS with copy-paste fix records.",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": f.a
                }
              }))
            }
          ])
        }}
      />

      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00ff88]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#ff4444]/5 blur-[150px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="border-b border-[#1e2d4a]/50 bg-[#0a0f1e]/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#0f1729] p-1.5 sm:p-2 rounded-xl border border-[#1e2d4a] group-hover:border-[#00ff88]/50 transition-all">
              <Shield className="text-[#00ff88]" size={18} />
            </div>
            <span className="font-syne font-bold text-lg sm:text-2xl tracking-tight text-white">
              Inbox<span className="text-[#00ff88]">Fixer</span>
            </span>
          </Link>

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
                  className="bg-white/5 text-white hover:bg-white/10 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-syne font-bold transition-all text-xs sm:text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <a href="/auth/login" className="text-[#6b7fa8] hover:text-white transition-colors text-xs sm:text-sm font-semibold">
                  Login
                </a>
                <a 
                  href="/auth/signup" 
                  className="bg-[#00ff88] text-[#0a0f1e] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-syne font-bold hover:bg-[#00dd77] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm whitespace-nowrap"
                >
                  Sign Up Free
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-20 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          
          <ReviewCountBadge />

          <h1 className="font-syne font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight tracking-tight">
            Free Domain DNS Check. <br/>
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00ff88]/60 bg-clip-text text-transparent">
              Fix Email Delivery Fast.
            </span>
          </h1>

          <p className="text-[#6b7fa8] text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Run a free email DNS check for SPF, DKIM, DMARC, MX, BIMI, MTA-STS, rDNS, and blacklist issues. Get a technical health score plus exact DNS records to fix emails not delivering.
          </p>
        </div>

        {/* Scan input Form */}
        <div className="max-w-2xl mx-auto">
          <form 
            onSubmit={handleScan}
            className="flex flex-col sm:flex-row gap-3 bg-[#0f1729]/80 border border-[#1e2d4a]/85 p-2 rounded-2xl md:rounded-3xl shadow-2xl relative"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-0">
              <Mail className="text-[#6b7fa8] shrink-0" size={18} />
              <input 
                type="text" 
                placeholder="yourdomain.com (e.g. gmail.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={loading}
                className="bg-transparent border-0 text-white placeholder-[#6b7fa8] focus:ring-0 focus:outline-none w-full text-sm font-semibold font-mono"
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#00ff88] text-[#0a0f1e] font-syne font-bold px-6 py-3.5 rounded-xl md:rounded-2xl hover:bg-[#00dd77] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                  Auditing DNS...
                </>
              ) : (
                <>
                  <Zap size={14} className="fill-current" />
                  Check DNS Free
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Diagnostics Badges Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
          {[
            { icon: CheckCircle, text: 'SPF Record' },
            { icon: CheckCircle, text: 'DKIM Align' },
            { icon: CheckCircle, text: 'DMARC Policy' },
            { icon: CheckCircle, text: 'MX Integrity' },
            { icon: CheckCircle, text: 'BIMI Brand' },
            { icon: CheckCircle, text: 'MTA-STS Check' },
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

        {/* Interactive Mock Results Card Preview */}
        <div className="bg-[#0f1729]/50 border border-[#1e2d4a]/70 rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1e2d4a]/50 pb-6">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/20 uppercase font-bold tracking-wider">
                Live Audit Preview
              </span>
              <h3 className="font-syne font-bold text-xl text-white">yourdomain.com</h3>
              <p className="text-[11px] text-[#6b7fa8] font-mono">Simulated DNS Zone Diagnostic Results</p>
            </div>
            
            <div className="flex items-center gap-4 bg-[#020812]/50 p-4 rounded-2xl border border-[#1e2d4a]/50">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="#1e2d4a" strokeWidth="3" fill="transparent" />
                  <circle cx="24" cy="24" r="20" stroke="#ffb800" strokeWidth="3" fill="transparent" strokeDasharray="125" strokeDashoffset="31.25" />
                </svg>
                <span className="text-white font-mono font-bold text-sm">75</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-[#6b7fa8] uppercase block">Health Grade</span>
                <span className="text-[#ffb800] font-syne font-bold text-sm">C - Action Required</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* SPF Accordion Card (Passing) */}
            <div className="bg-[#020812]/40 border border-[#1e2d4a]/45 rounded-2xl overflow-hidden transition-all">
              <button 
                onClick={() => setMockSpfExpanded(!mockSpfExpanded)}
                className="w-full flex justify-between items-center p-4 hover:bg-white/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#00ff88]" />
                  <div>
                    <h4 className="font-syne font-bold text-xs text-white">SPF Record Verification</h4>
                    <p className="text-[10px] text-[#6b7fa8] font-mono">Found: v=spf1 include:_spf.google.com ~all</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/20 font-bold uppercase">
                    Pass
                  </span>
                  {mockSpfExpanded ? <ChevronUp size={14} className="text-[#6b7fa8]" /> : <ChevronDown size={14} className="text-[#6b7fa8]" />}
                </div>
              </button>
              
              {mockSpfExpanded && (
                <div className="p-4 pt-0 border-t border-[#1e2d4a]/30 bg-[#060a14]/30 space-y-2 text-xs text-[#8b9fc0] leading-relaxed">
                  <p><strong>What this checks:</strong> Sender Policy Framework (SPF) restricts who can send mail on behalf of your domain name.</p>
                  <p className="text-[#00ff88]">Your SPF record syntax is structurally clean and has exactly 1 DNS lookup (limit is 10).</p>
                </div>
              )}
            </div>

            {/* DMARC Accordion Card (Failing) */}
            <div className="bg-[#020812]/40 border border-[#ff4444]/20 rounded-2xl overflow-hidden transition-all">
              <button 
                onClick={() => setMockDmarcExpanded(!mockDmarcExpanded)}
                className="w-full flex justify-between items-center p-4 hover:bg-white/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#ff4444] animate-pulse" />
                  <div>
                    <h4 className="font-syne font-bold text-xs text-white">DMARC Spoofing Policy</h4>
                    <p className="text-[10px] text-[#6b7fa8] font-mono">Status: No DMARC TXT record detected</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-[#ff4444] bg-[#ff4444]/10 px-2 py-0.5 rounded border border-[#ff4444]/20 font-bold uppercase">
                    Critical
                  </span>
                  {mockDmarcExpanded ? <ChevronUp size={14} className="text-[#6b7fa8]" /> : <ChevronDown size={14} className="text-[#6b7fa8]" />}
                </div>
              </button>
              
              {mockDmarcExpanded && (
                <div className="p-4 pt-0 border-t border-[#1e2d4a]/30 bg-[#060a14]/30 space-y-4 text-xs text-[#8b9fc0] leading-relaxed">
                  <div className="space-y-1">
                    <p className="font-semibold text-white">Why this matters:</p>
                    <p>DMARC tells servers like Google and Outlook how to handle messages claiming to be from your domain but failing SPF/DKIM checks. Without it, spam filters cannot verify your headers, heavily penalizing your outreach reputation.</p>
                  </div>

                  <div className="bg-[#020812] border border-[#1e2d4a]/50 p-4 rounded-xl space-y-3 font-mono">
                    <div className="flex justify-between items-center border-b border-[#1e2d4a]/30 pb-2">
                      <span className="text-[10px] text-[#6b7fa8] uppercase">Recommended DNS TXT Record</span>
                      <button 
                        onClick={handleMockCopy}
                        className="text-[#00ff88] hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold"
                      >
                        {mockCopied ? <Check size={11} /> : <Copy size={11} />}
                        {mockCopied ? 'Copied!' : 'Copy Fix'}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] sm:text-xs">
                      <div>
                        <span className="text-[#6b7fa8] block uppercase text-[9px]">Host / Name</span>
                        <span className="text-white">_dmarc</span>
                      </div>
                      <div>
                        <span className="text-[#6b7fa8] block uppercase text-[9px]">Type</span>
                        <span className="text-white">TXT</span>
                      </div>
                      <div className="col-span-3 sm:col-span-1">
                        <span className="text-[#6b7fa8] block uppercase text-[9px]">Value</span>
                        <span className="text-[#00ff88] break-all">v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@yourdomain.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
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
                title: 'Scan Domain DNS', 
                desc: 'Enter your sending domain to run a free live check across email DNS, MX, blacklist, and authentication records.' 
              },
              { 
                step: '02', 
                title: 'Find Delivery Problems', 
                desc: 'See which DNS records are missing, broken, or misaligned with plain-English explanations for every issue.' 
              },
              { 
                step: '03', 
                title: 'Apply Copy-Paste Fixes', 
                desc: 'Copy the recommended TXT and MX records, publish them in your DNS provider, and improve inbox placement.' 
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

      {/* 2. Honest Mission & Community Drive Section */}
      <section className="bg-[#0a0f1e] border-t border-[#1e2d4a]/30 py-20 w-full relative">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20 uppercase font-bold tracking-wider">
              Our Founding Promise
            </span>
            <h2 className="font-syne font-bold text-3xl md:text-4xl text-white tracking-tight">
              A Project Built on Transparency
            </h2>
            <p className="text-[#6b7fa8] text-sm leading-relaxed">
              We launched InboxFixer to make email deliverability audits simple, accessible, and 100% honest. Here is our vow to you.
            </p>
          </div>

          <div className="max-w-2xl mx-auto pt-4">
            <div className="bg-[#0f1729]/65 border border-[#1e2d4a]/75 rounded-3xl p-8 hover:border-[#00ff88]/30 transition-all">
              <h3 className="font-syne font-bold text-xl text-white mb-3 flex items-center gap-2 justify-center sm:justify-start">
                <span className="h-2 w-2 rounded-full bg-[#00ff88]" /> Plain-English Simplicity
              </h3>
              <p className="text-[#8b9fc0] text-sm leading-relaxed text-center sm:text-left">
                Email server configurations can be incredibly confusing. We built InboxFixer to decode complex cryptographic key selectors, includes, and record syntax errors into plain, simple instructions, empowering you to manage your own domain authentication records.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#00ff88]/5 to-transparent border border-[#00ff88]/20 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-syne font-bold text-lg text-white">Join InboxFixer Today</h3>
              <p className="text-xs text-[#8b9fc0] max-w-xl">
                Be a part of a community that values honest, reliable, and secure domain auditing software. Try our tool completely free today, and protect your email sender reputation!
              </p>
            </div>
            <a 
              href="/auth/signup" 
              className="bg-[#00ff88] text-[#0a0f1e] px-6 py-3 rounded-xl font-syne font-bold hover:bg-[#00dd77] active:scale-[0.98] transition-all text-sm whitespace-nowrap shrink-0"
            >
              Get Started Free
            </a>
          </div>

        </div>
      </section>

      {/* 3. FAQ Accordion Section (Big SEO Opportunity) */}
      <section className="bg-[#0f1729]/15 border-t border-[#1e2d4a]/30 py-20 w-full relative">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <HelpCircle className="text-[#00ff88] mx-auto animate-bounce" size={28} />
            <h2 className="font-syne font-bold text-3xl md:text-4xl text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-[#6b7fa8] text-sm leading-relaxed">
              Find answers to the most common email deliverability and DNS zone authorization inquiries.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-[#0f1729]/65 border border-[#1e2d4a]/75 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-white/5 transition-all text-white font-syne font-bold text-sm sm:text-base gap-4"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp size={16} className="text-[#00ff88] shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-[#6b7fa8] shrink-0" />
                  )}
                </button>
                
                {openFaq === index && (
                  <div className="p-5 pt-0 border-t border-[#1e2d4a]/30 bg-[#060a14]/30 text-xs sm:text-sm text-[#8b9fc0] leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

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
            <Link href="/blog" className="hover:text-white transition-colors">Blog Hub</Link>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

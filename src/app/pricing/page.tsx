'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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
        console.warn('Profile fetch error:', err);
      }
    }
    checkUser();
  }, []);

  const handleCheckout = async () => {
    if (!user) {
      toast.info('Sign up required first', {
        description: 'Please create a free account before upgrading to Pro.',
      });
      router.push('/auth/signup?next=/pricing');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Checkout initiation failed.');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error('Payment Portal Error', {
        description: err.message || 'Stripe payments are not fully configured yet. Contact the administrator.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pass/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00ff88]/5 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="border-b border-[#1e2d4a]/50 bg-[#0a0f1e]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
          <a href="/" className="font-syne font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
            <Shield className="text-[#00ff88]" size={16} />
            <span>Inbox<span className="text-[#00ff88]">Fixer</span></span>
          </a>
          <div className="flex gap-3 sm:gap-4 items-center">
            <a href="/" className="text-xs text-[#6b7fa8] hover:text-white transition-colors font-semibold">
              ← Home
            </a>
            {user && (
              <a href="/dashboard" className="text-xs text-[#00ff88] hover:underline font-mono">
                Go to Dashboard
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Pricing Header */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="font-syne font-bold text-4xl md:text-5xl text-white tracking-tight">
            Plans Designed to <span className="text-[#00ff88]">Protect Your Inbox</span>
          </h1>
          <p className="text-[#6b7fa8] text-sm md:text-base leading-relaxed">
            Keep your business domain authentic, avoid spam filters, and unlock automated daily blacklists monitoring. Completely transparent Pricing.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch pt-6">
          {/* Guest Tier */}
          <div className="bg-[#0f1729]/50 border border-[#1e2d4a]/60 rounded-3xl p-6 flex flex-col justify-between relative">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#6b7fa8]">Free / Guest</span>
                <h3 className="font-syne font-bold text-2xl text-white">No Signup</h3>
                <p className="text-xs text-[#6b7fa8] leading-relaxed">Quick tool evaluation for immediate spam diagnostic needs.</p>
              </div>

              <div className="py-2 border-y border-[#1e2d4a]/40">
                <span className="font-syne text-4xl font-bold text-white">$0</span>
                <span className="text-xs text-[#6b7fa8] font-mono"> / forever</span>
              </div>

              <ul className="space-y-3.5 text-xs text-[#8b9fc0]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span>3 domain scans per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span>SPF, DKIM, and DMARC analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span>Plain English DNS explanations</span>
                </li>
                <li className="flex items-center gap-2 text-white/40 line-through">
                  <span className="shrink-0 font-bold">✗</span>
                  <span>Scan history saving</span>
                </li>
                <li className="flex items-center gap-2 text-white/40 line-through">
                  <span className="shrink-0 font-bold">✗</span>
                  <span>PDF audit exports</span>
                </li>
                <li className="flex items-center gap-2 text-white/40 line-through">
                  <span className="shrink-0 font-bold">✗</span>
                  <span>Continuous daily domain alerts</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <a 
                href="/" 
                className="w-full block text-center bg-[#1e2d4a]/60 hover:bg-[#1e2d4a] text-white border border-[#1e2d4a] px-4 py-3 rounded-xl text-xs font-syne font-bold transition-all cursor-pointer"
              >
                Scan Now
              </a>
            </div>
          </div>

          {/* Free Account Tier */}
          <div className="bg-[#0f1729]/50 border border-[#1e2d4a]/60 rounded-3xl p-6 flex flex-col justify-between relative">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#00ff88]">Recommended</span>
                <h3 className="font-syne font-bold text-2xl text-white">Free Account</h3>
                <p className="text-xs text-[#6b7fa8] leading-relaxed">Perfect for small shop owners and individual marketers.</p>
              </div>

              <div className="py-2 border-y border-[#1e2d4a]/40">
                <span className="font-syne text-4xl font-bold text-white">$0</span>
                <span className="text-xs text-[#6b7fa8] font-mono"> / signup</span>
              </div>

              <ul className="space-y-3.5 text-xs text-[#8b9fc0]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span>10 domain scans per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span>SPF, DKIM, DMARC, MX check</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span>Scan history (Last 30 days)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span>Copy-paste DNS record fixes</span>
                </li>
                <li className="flex items-center gap-2 text-white/40 line-through">
                  <span className="shrink-0 font-bold">✗</span>
                  <span>PDF audit exports</span>
                </li>
                <li className="flex items-center gap-2 text-white/40 line-through">
                  <span className="shrink-0 font-bold">✗</span>
                  <span>Daily monitoring alerts</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <a 
                href="/auth/signup" 
                className="w-full block text-center bg-white/10 hover:bg-white/15 text-white border border-[#1e2d4a] px-4 py-3 rounded-xl text-xs font-syne font-bold transition-all cursor-pointer"
              >
                Create Account
              </a>
            </div>
          </div>

          {/* Pro Tier (Featured / Paid) */}
          <div className="bg-[#0f1729] border-2 border-[#00ff88] rounded-3xl p-6 flex flex-col justify-between relative shadow-2xl">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#00ff88] text-[#0a0f1e] text-[9px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Popular Plan
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#00ff88] flex items-center gap-1">
                  <Zap size={10} className="fill-[#00ff88]" /> Premium Protection
                </span>
                <h3 className="font-syne font-bold text-2xl text-white">InboxFixer Pro</h3>
                <p className="text-xs text-[#6b7fa8] leading-relaxed">Built for freelancers, agencies, and online brand owners.</p>
              </div>

              <div className="py-2 border-y border-[#1e2d4a]/40">
                <span className="font-syne text-4xl font-bold text-white">$9</span>
                <span className="text-xs text-[#6b7fa8] font-mono"> / month</span>
              </div>

              <ul className="space-y-3.5 text-xs text-[#8b9fc0]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span className="text-white font-semibold">Unlimited domain scans</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span>Daily automated monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span>Score dropped warnings (SMTP)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span className="text-white font-semibold">Unlimited PDF exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span>Bulk check (up to 10 domains at once)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00ff88] shrink-0" />
                  <span>Priority email support</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#00ff88] text-[#0a0f1e] hover:bg-[#00dd77] border border-[#00ff88] px-4 py-3 rounded-xl text-xs font-syne font-bold transition-all cursor-pointer active:scale-[0.98]"
              >
                {loading ? 'Initiating Checkout...' : 'Upgrade to Pro — $9/mo'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2d4a]/20 bg-[#060a14] py-8 text-center text-xs text-[#6b7fa8] mt-12">
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

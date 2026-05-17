'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Shield, 
  History, 
  Search, 
  Zap, 
  Activity, 
  Trash2, 
  ExternalLink,
  Loader2,
  Lock,
  User,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

function DashboardContent() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [monitored, setMonitored] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Subscription Billing States
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardInput, setCardInput] = useState('');
  const [cardBrand, setCardBrand] = useState('visa');
  const [submittingCard, setSubmittingCard] = useState(false);

  const handleLinkOrChangeCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = cardInput.replace(/\s/g, '');
    if (cleanDigits.length !== 16) {
      toast.error('Please enter a valid 16-digit card number.');
      return;
    }

    setSubmittingCard(true);
    try {
      const res = await fetch('/api/stripe/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardLast4: cleanDigits.slice(-4),
          cardBrand: cardBrand
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update billing card.');
      }

      setProfile({
        ...profile,
        plan: data.profile.plan,
        card_last4: data.profile.card_last4,
        card_brand: data.profile.card_brand
      });

      setShowCardModal(false);
      setCardInput('');
      toast.success(profile?.card_last4 ? 'Card details updated successfully!' : 'Card linked & Pro Subscription Activated!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Billing linking failed.');
    } finally {
      setSubmittingCard(false);
    }
  };

  const handleRemoveCard = async () => {
    if (!confirm('Are you sure you want to remove your card? Removing your card will immediately cancel your Pro subscription and downgrade you to the Free plan.')) {
      return;
    }

    try {
      const res = await fetch('/api/stripe/billing', {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove card.');
      }

      setProfile({
        ...profile,
        plan: data.profile.plan,
        card_last4: data.profile.card_last4,
        card_brand: data.profile.card_brand
      });

      toast.success('Payment card removed. Subscription downgraded to Free.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Billing removal failed.');
    }
  };

  useEffect(() => {
    async function initDashboard() {
      try {
        const res = await fetch('/api/dashboard/data');
        
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard data');
        }

        setUser(data.user);
        setProfile(data.profile);
        setScans(data.scans || []);
        setMonitored(data.monitoring || []);

        // Check if just upgraded
        if (searchParams.get('upgraded') === 'true') {
          toast.success('Congratulations! Welcome to Pro', {
            description: 'Your InboxFixer Pro subscription is now active. Daily monitoring is unlocked.',
            duration: 8000,
          });
        }

      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        toast.error('Failed to fetch dashboard logs.');
      } finally {
        setLoading(false);
      }
    }
    
    initDashboard();
  }, [router, searchParams]);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    const clean = newDomain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .trim();

    router.push(`/results/${clean}`);
  };

  const handleDeleteScan = async (scanId: string) => {
    try {
      const res = await fetch(`/api/dashboard/data?id=${scanId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }

      setScans(scans.filter(s => s.id !== scanId));
      toast.success('Scan removed from history.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete scan record.');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('Logged out successfully.');
        router.push('/');
        router.refresh();
      } else {
        toast.error('Logout failed.');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const filteredScans = scans.filter(scan => 
    scan.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={36} className="text-[#00ff88] animate-spin mx-auto" />
          <p className="text-sm font-mono text-[#6b7fa8]">Loading secure dashboard panel...</p>
        </div>
      </div>
    );
  }

  const isPro = profile?.plan === 'pro';

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[#1e2d4a]/50 bg-[#0a0f1e]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
          <a href="/" className="font-syne font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
            <Shield className="text-[#00ff88]" size={16} />
            <span>Inbox<span className="text-[#00ff88]">Fixer</span></span>
          </a>
          <div className="flex gap-2 sm:gap-4 items-center">
            {user?.role === 'superadmin' && (
              <a href="/admin" className="text-[10px] sm:text-xs text-[#00ff88] hover:underline font-mono">
                <span className="hidden xs:inline">Admin Control Panel</span>
                <span className="xs:hidden">Admin</span>
              </a>
            )}
            <a href="/pricing" className="hidden xs:inline-block text-[10px] sm:text-xs text-[#6b7fa8] hover:text-white transition-colors">Pricing</a>
            <button
              onClick={handleLogout}
              className="bg-transparent hover:bg-white/5 border border-[#1e2d4a] text-[10px] sm:text-xs text-[#6b7fa8] hover:text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        
        {/* User Card */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#0f1729]/80 border border-[#1e2d4a]/70 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-xl">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#00ff88] tracking-widest font-semibold">User Profile</span>
              <h2 className="font-mono text-xl md:text-2xl font-bold text-white tracking-tight break-all">
                {user?.email}
              </h2>
              <div className="flex items-center gap-2.5">
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-semibold uppercase ${
                  isPro 
                    ? 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10' 
                    : 'text-[#6b7fa8] border-[#1e2d4a] bg-[#020812]'
                }`}>
                  Plan: {profile?.plan || 'Free'}
                </span>
                <span className="text-xs text-[#6b7fa8] font-mono">Scans limit: {isPro ? 'Unlimited' : '10 / day'}</span>
              </div>
            </div>
            
            {!isPro && (
              <a 
                href="/pricing"
                className="bg-[#00ff88] text-[#0a0f1e] hover:bg-[#00dd77] px-5 py-2.5 rounded-xl text-xs font-syne font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap size={13} className="fill-[#0a0f1e]" />
                Upgrade to Pro
              </a>
            )}
          </div>

          {/* Quick Check Input */}
          <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/70 rounded-3xl p-6 shadow-xl flex flex-col justify-center">
            <h3 className="text-sm font-syne font-bold text-white mb-3 flex items-center gap-1.5">
              <Search size={14} className="text-[#00ff88]" />
              Run Quick Audit
            </h3>
            <form onSubmit={handleScanSubmit} className="flex gap-2">
              <input
                type="text"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                placeholder="domain.com"
                required
                className="flex-1 bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] font-mono"
              />
              <button
                type="submit"
                className="bg-[#00ff88] text-[#0a0f1e] hover:bg-[#00dd77] px-4 py-2.5 rounded-xl text-xs font-syne font-bold transition-all cursor-pointer"
              >
                Scan
              </button>
            </form>
          </div>
        </div>

        {/* Billing & Subscription Settings */}
        <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/70 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff88]/5 rounded-full filter blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h3 className="font-syne font-bold text-lg text-white flex items-center gap-2">
                <span className="p-1.5 bg-[#00ff88]/10 text-[#00ff88] rounded-lg">
                  <Shield size={16} />
                </span>
                Subscription Billing Manager
              </h3>
              <p className="text-xs text-[#6b7fa8] max-w-xl">
                Securely manage payment methods linked with your Pro account. If you remove your payment card, your subscription benefits will immediately pause until a card is linked.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              {profile?.card_last4 ? (
                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-2xl p-4 w-full sm:w-64 shadow-lg flex flex-col justify-between h-32 relative overflow-hidden font-mono text-white text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[10px] tracking-widest text-[#00ff88] uppercase">SECURE PASS</span>
                    <span className="text-[10px] text-[#6b7fa8] uppercase font-bold">{profile.card_brand || 'VISA'}</span>
                  </div>
                  <div className="text-sm font-semibold tracking-widest my-2">
                    ••••  ••••  ••••  {profile.card_last4}
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-[#6b7fa8]">
                    <div>
                      <p className="text-[8px] text-[#475569] uppercase font-semibold">Holder</p>
                      <p className="font-semibold text-white text-[10px]">PRO MEMBER</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-[#475569] uppercase font-semibold">Status</p>
                      <p className="font-bold text-[#00ff88]">ACTIVE</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#020812]/50 border border-dashed border-[#1e2d4a] rounded-2xl p-4 flex flex-col items-center justify-center text-center w-full sm:w-64 h-32">
                  <span className="text-xs text-[#6b7fa8] mb-2 font-mono">No payment card linked</span>
                  <span className="text-[10px] text-[#6b7fa8]/60 leading-relaxed font-mono">Pro services require a secure link</span>
                </div>
              )}

              <div className="flex flex-col gap-2.5 justify-center w-full sm:w-auto">
                {profile?.card_last4 ? (
                  <>
                    <button
                      onClick={() => {
                        setCardBrand(profile.card_brand || 'visa');
                        setShowCardModal(true);
                      }}
                      className="bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] px-4 py-2.5 rounded-xl text-xs font-syne font-bold transition-all cursor-pointer text-center"
                    >
                      Change Card
                    </button>
                    <button
                      onClick={handleRemoveCard}
                      className="bg-[#ff4444]/10 hover:bg-[#ff4444]/20 border border-[#ff4444]/30 text-[#ff4444] px-4 py-2.5 rounded-xl text-xs font-syne font-bold transition-all cursor-pointer text-center"
                    >
                      Remove Card
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setCardBrand('visa');
                      setShowCardModal(true);
                    }}
                    className="bg-[#00ff88] text-[#0a0f1e] hover:bg-[#00dd77] px-5 py-2.5 rounded-xl text-xs font-syne font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#00ff88]/10 text-center"
                  >
                    Link Payment Card
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Monitoring & Alerts Feature Row */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Daily Monitoring Module */}
          <div className="md:col-span-1 bg-[#0f1729]/80 border border-[#1e2d4a]/70 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-syne font-bold text-base text-white flex items-center gap-2">
                <Activity size={18} className="text-[#00ff88]" />
                Domain Monitoring
              </h3>
              {isPro && (
                <a 
                  href="/dashboard/monitoring" 
                  className="text-xs text-[#00ff88] hover:underline font-mono"
                >
                  Manage
                </a>
              )}
            </div>

            {isPro ? (
              <div className="space-y-3">
                {monitored.length === 0 ? (
                  <div className="text-center p-6 bg-[#020812]/40 rounded-2xl border border-[#1e2d4a]/40">
                    <p className="text-xs text-[#6b7fa8]">You are not monitoring any domains yet.</p>
                    <a 
                      href="/dashboard/monitoring"
                      className="mt-3 inline-block bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] px-3.5 py-1.5 rounded-lg text-xs font-mono"
                    >
                      + Add Monitored Domain
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {monitored.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-[#020812]/50 px-3.5 py-2.5 rounded-xl border border-[#1e2d4a]/50 text-xs">
                        <span className="font-mono text-white font-semibold truncate pr-2">{item.domain}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          item.last_score >= 90 ? 'text-[#00ff88] bg-[#00ff88]/10' : item.last_score >= 75 ? 'text-[#ffaa00] bg-[#ffaa00]/10' : 'text-[#ff4444] bg-[#ff4444]/10'
                        }`}>
                          Score: {item.last_score ?? 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Upgrade Teaser for Free account users */
              <div className="bg-[#020812]/50 border border-dashed border-[#1e2d4a] rounded-2xl p-5 text-center space-y-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-[#ff4444]/10 text-[#ff4444] p-1 rounded-full">
                  <Lock size={12} />
                </div>
                <h4 className="font-syne font-bold text-sm text-white flex items-center justify-center gap-1.5">
                  Automated Daily Monitoring
                </h4>
                <p className="text-xs text-[#6b7fa8] leading-relaxed">
                  Unlock daily deliverability audits. Get instant email alerts via SMTP when your SPF, DKIM, DMARC, or Blacklist status changes.
                </p>
                <a 
                  href="/pricing"
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] px-4 py-2.5 rounded-xl text-xs font-syne font-bold transition-all cursor-pointer"
                >
                  <Zap size={12} className="fill-[#00ff88]" />
                  Unlock with Pro ($9/mo)
                </a>
              </div>
            )}
          </div>

          {/* Audit History Module */}
          <div className="md:col-span-2 bg-[#0f1729]/80 border border-[#1e2d4a]/70 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-syne font-bold text-base text-white flex items-center gap-2">
                <History size={18} className="text-[#00ff88]" />
                Recent Diagnostic Scans
              </h3>

              {/* Filter */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7fa8]" size={13} />
                <input
                  type="text"
                  placeholder="Filter domain..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] font-mono"
                />
              </div>
            </div>

            {/* Scan List */}
            {scans.length === 0 ? (
              <div className="text-center p-12 bg-[#020812]/35 border border-dashed border-[#1e2d4a] rounded-2xl">
                <p className="text-xs text-[#6b7fa8] leading-relaxed">No audits found in your history log.</p>
                <p className="text-[10px] text-[#6b7fa8]/60 font-mono mt-1">Audit domains from the top checks form to construct a database log.</p>
              </div>
            ) : filteredScans.length === 0 ? (
              <div className="text-center p-10 bg-[#020812]/35 rounded-2xl">
                <p className="text-xs text-[#6b7fa8]">No scan matches search filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1e2d4a]/40 max-h-96 overflow-y-auto pr-1">
                {filteredScans.map((scan) => (
                  <div key={scan.id} className="py-4 flex justify-between items-center gap-4 flex-wrap sm:flex-nowrap">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-mono text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                          {scan.domain}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          scan.score >= 90 ? 'text-[#00ff88] bg-[#00ff88]/10' : scan.score >= 75 ? 'text-[#ffaa00] bg-[#ffaa00]/10' : 'text-[#ff4444] bg-[#ff4444]/10'
                        }`}>
                          Score: {scan.score}/100
                        </span>
                      </div>
                      <div className="flex gap-2.5 text-[10px] font-mono text-[#6b7fa8]">
                        <span>SPF: {scan.spf_status?.toUpperCase()}</span>
                        <span>•</span>
                        <span>DKIM: {scan.dkim_status?.toUpperCase()}</span>
                        <span>•</span>
                        <span>DMARC: {scan.dmarc_status?.toUpperCase()}</span>
                        <span>•</span>
                        <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <a 
                        href={`/results/${scan.domain}`}
                        className="text-xs text-[#00ff88] hover:underline font-mono font-semibold flex items-center gap-1"
                      >
                        Review
                        <ExternalLink size={11} />
                      </a>
                      <button 
                        onClick={() => handleDeleteScan(scan.id)}
                        className="text-xs text-[#6b7fa8] hover:text-[#ff4444] transition-colors p-1 cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#1e2d4a]/20 bg-[#060a14] py-8 text-center text-xs text-[#6b7fa8] mt-12">
        <div className="max-w-7xl mx-auto px-6">
          &copy; {new Date().getFullYear()} InboxFixer. Keeping you out of the spam filter.
        </div>
      </footer>

      {/* Link/Change Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f1729] border border-[#1e2d4a] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full filter blur-2xl pointer-events-none" />
            <div className="space-y-2">
              <h3 className="font-syne font-bold text-lg text-white">
                {profile?.card_last4 ? 'Change Payment Card' : 'Link Payment Card'}
              </h3>
              <p className="text-xs text-[#6b7fa8]">
                Enter a 16-digit credit card number. For testing, you can use any valid test card (e.g. 16 digits of 4242).
              </p>
            </div>

            <form onSubmit={handleLinkOrChangeCard} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#6b7fa8] uppercase block font-mono">Card Brand</label>
                <select
                  value={cardBrand}
                  onChange={e => setCardBrand(e.target.value)}
                  className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] font-mono"
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                  <option value="discover">Discover</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-[#6b7fa8] uppercase block font-mono">Card Number</label>
                <input
                  type="text"
                  maxLength={19}
                  value={cardInput}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    const parts = [];
                    for (let i = 0; i < val.length; i += 4) {
                      parts.push(val.substring(i, i + 4));
                    }
                    setCardInput(parts.join(' '));
                  }}
                  placeholder="4242 4242 4242 4242"
                  required
                  className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCardModal(false);
                    setCardInput('');
                  }}
                  className="flex-1 bg-transparent hover:bg-white/5 border border-[#1e2d4a] text-xs text-[#6b7fa8] hover:text-white py-2.5 rounded-xl transition-all cursor-pointer font-syne font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCard}
                  className="flex-1 bg-[#00ff88] text-[#0a0f1e] hover:bg-[#00dd77] disabled:opacity-50 py-2.5 rounded-xl text-xs font-syne font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {submittingCard && <Loader2 size={12} className="animate-spin" />}
                  {profile?.card_last4 ? 'Update Card' : 'Activate Pro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={36} className="text-[#00ff88] animate-spin mx-auto" />
          <p className="text-sm font-mono text-[#6b7fa8]">Loading secure dashboard panel...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

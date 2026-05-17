'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  PlusCircle, 
  Trash2, 
  Activity, 
  Lock, 
  Loader2,
  ArrowLeft,
  Zap,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

export default function MonitoringPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [monitored, setMonitored] = useState<any[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadMonitoring() {
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

        if (data.profile?.plan === 'pro') {
          setMonitored(data.monitoring || []);
        }
      } catch (err) {
        console.error('Failed to load monitoring list:', err);
        toast.error('Failed to fetch monitoring list.');
      } finally {
        setLoading(false);
      }
    }
    loadMonitoring();
  }, [router]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to add domain to monitoring.');
      }

      setMonitored([data, ...monitored]);
      setNewDomain('');
      toast.success(`Successfully added ${data.domain} to daily monitoring list!`);
    } catch (err: any) {
      toast.error('Monitoring Error', {
        description: err.message || 'Failed to add domain.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveDomain = async (id: string, domainName: string) => {
    if (!confirm(`Are you sure you want to stop monitoring ${domainName}?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/monitoring?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Failed to remove domain.');
      }

      setMonitored(monitored.filter(item => item.id !== id));
      toast.success(`Successfully stopped monitoring ${domainName}.`);
    } catch (err: any) {
      toast.error('Removal failed', {
        description: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={36} className="text-[#00ff88] animate-spin mx-auto" />
          <p className="text-sm font-mono text-[#6b7fa8]">Loading active monitors...</p>
        </div>
      </div>
    );
  }

  const isPro = profile?.plan === 'pro';

  if (!isPro) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col justify-center items-center p-6 relative">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#ff4444]/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-md bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-sm text-center space-y-6">
          <div className="bg-[#00ff88]/10 p-4 rounded-full border border-[#00ff88]/20 w-fit mx-auto animate-pulse">
            <Lock className="text-[#00ff88]" size={36} />
          </div>
          
          <h2 className="font-syne font-bold text-2xl text-white tracking-tight">Feature Locked: Pro Required</h2>
          
          <p className="text-sm text-[#8b9fc0] leading-relaxed">
            Continuous daily deliverability monitoring, score drop alerts via SMTP, and IP spam database tracking are exclusive premium features.
          </p>

          <div className="bg-[#020812]/50 border border-[#1e2d4a] rounded-2xl p-4 text-left text-xs text-[#8b9fc0] space-y-2 font-mono">
            <div className="flex gap-2.5 items-center">
              <span className="text-[#00ff88]">✓</span>
              <span>Daily background DNS checking</span>
            </div>
            <div className="flex gap-2.5 items-center">
              <span className="text-[#00ff88]">✓</span>
              <span>SMTP notification warnings on score drops</span>
            </div>
            <div className="flex gap-2.5 items-center">
              <span className="text-[#00ff88]">✓</span>
              <span>Spam blacklist auto-probing</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <a 
              href="/pricing"
              className="bg-[#00ff88] text-[#0a0f1e] hover:bg-[#00dd77] py-3.5 rounded-xl font-syne font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap size={13} className="fill-[#0a0f1e]" />
              Upgrade to Pro for $9/mo
            </a>
            <a 
              href="/dashboard"
              className="text-xs text-[#6b7fa8] hover:text-white transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[#1e2d4a]/50 bg-[#0a0f1e]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="font-syne font-bold text-xl tracking-tight text-white flex items-center gap-2">
            <Shield className="text-[#00ff88]" size={18} />
            <span>Mail<span className="text-[#00ff88]">Guard</span></span>
          </a>
          <a 
            href="/dashboard" 
            className="flex items-center gap-1.5 text-xs text-[#6b7fa8] hover:text-white transition-colors bg-[#0f1729] px-3.5 py-1.5 rounded-lg border border-[#1e2d4a] font-semibold"
          >
            <ArrowLeft size={13} />
            Dashboard
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1e2d4a]/40 pb-6">
          <div className="space-y-1">
            <h1 className="font-syne font-bold text-3xl text-white tracking-tight flex items-center gap-2.5">
              <Activity size={24} className="text-[#00ff88]" />
              Active Domain Monitoring
            </h1>
            <p className="text-[#6b7fa8] text-xs font-mono">InboxFixer runs automated audits on your DNS records every 24 hours.</p>
          </div>
        </div>

        {/* Add Domain Form */}
        <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/70 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-syne font-bold text-white flex items-center gap-2">
            <PlusCircle size={16} className="text-[#00ff88]" />
            Add New Domain to Monitor
          </h3>
          
          <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7fa8]" size={15} />
              <input
                type="text"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                placeholder="yourdomain.com"
                required
                disabled={actionLoading}
                className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] transition-all font-mono"
              />
            </div>
            
            <button
              type="submit"
              disabled={actionLoading || !newDomain.trim()}
              className="bg-[#00ff88] text-[#0a0f1e] hover:bg-[#00dd77] px-6 py-3 rounded-xl text-xs font-syne font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-1.5"
            >
              {actionLoading ? 'Adding...' : 'Monitor Domain'}
            </button>
          </form>
        </div>

        {/* Monitored List */}
        <div className="space-y-4">
          <h3 className="font-syne font-bold text-lg text-white">Your Monitored Domains</h3>

          {monitored.length === 0 ? (
            <div className="text-center p-12 bg-[#0f1729]/40 border border-dashed border-[#1e2d4a] rounded-3xl">
              <p className="text-xs text-[#6b7fa8] leading-relaxed">You are not monitoring any domains currently.</p>
              <p className="text-[10px] text-[#6b7fa8]/60 font-mono mt-1">Add a domain above to unlock 24/7 background security audits.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {monitored.map(item => (
                <div key={item.id} className="bg-[#0f1729]/80 border border-[#1e2d4a]/75 rounded-2xl p-5 flex justify-between items-center shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00ff88]" />
                  
                  <div className="space-y-2 min-w-0 pr-3">
                    <h4 className="font-mono text-sm font-bold text-white truncate">{item.domain}</h4>
                    
                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#6b7fa8]">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                        Active
                      </span>
                      <span>•</span>
                      <span>Last checked: {item.last_checked_at ? new Date(item.last_checked_at).toLocaleDateString() : 'Pending'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                      item.last_score >= 90 ? 'text-[#00ff88] bg-[#00ff88]/10' : item.last_score >= 75 ? 'text-[#ffaa00] bg-[#ffaa00]/10' : 'text-[#ff4444] bg-[#ff4444]/10'
                    }`}>
                      {item.last_score ?? 'Scanning'}
                    </span>
                    <button 
                      onClick={() => handleRemoveDomain(item.id, item.domain)}
                      disabled={actionLoading}
                      className="p-2 border border-[#1e2d4a] hover:border-[#ff4444]/30 text-[#6b7fa8] hover:text-[#ff4444] rounded-xl transition-all hover:bg-[#ff4444]/5 cursor-pointer disabled:opacity-50"
                      title="Stop Monitoring"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[#1e2d4a]/20 bg-[#060a14] py-8 text-center text-xs text-[#6b7fa8] mt-12">
        <div className="max-w-7xl mx-auto px-6">
          &copy; {new Date().getFullYear()} InboxFixer. Active monitoring secures your domain authority.
        </div>
      </footer>
    </div>
  );
}

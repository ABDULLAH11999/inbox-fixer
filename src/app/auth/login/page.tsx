'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectTo = searchParams.get('next') || '/dashboard';
  const queryError = searchParams.get('error');

  useEffect(() => {
    if (queryError === 'auth-failed') {
      toast.error('Authentication Failed', {
        description: 'Failed to verify session. Please try logging in again.',
      });
    }
  }, [queryError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      toast.success('Logged in successfully!', {
        description: 'Welcome back to InboxFixer.',
      });

      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error('Authentication Error', {
        description: err.message || 'Invalid email or password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-sm space-y-8">
      {/* Header Logo */}
      <div className="text-center space-y-3">
        <a href="/" className="inline-flex items-center gap-2 group">
          <div className="bg-[#020812] p-2.5 rounded-xl border border-[#1e2d4a] group-hover:border-[#00ff88]/50 transition-all">
            <Shield className="text-[#00ff88]" size={24} />
          </div>
          <span className="font-syne font-bold text-2xl tracking-tight text-white">
            Inbox<span className="text-[#00ff88]">Fixer</span>
          </span>
        </a>
        <h2 className="font-syne font-bold text-xl text-white">Access Your Diagnostic History</h2>
        <p className="text-xs text-[#6b7fa8]">Log in to unlock 10 checks per day and view past domain audits.</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-[#6b7fa8] tracking-wider" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7fa8]" size={15} />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono uppercase text-[#6b7fa8] tracking-wider" htmlFor="password">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7fa8]" size={15} />
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all text-sm font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00ff88] text-[#0a0f1e] py-3.5 rounded-xl font-syne font-bold hover:bg-[#00dd77] active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer mt-6"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Validating Credentials...
            </>
          ) : (
            <>
              Log In
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      {/* Footer switch */}
      <div className="text-center text-xs text-[#6b7fa8] pt-2">
        Don't have an account?{' '}
        <a href={`/auth/signup?next=${encodeURIComponent(redirectTo)}`} className="text-[#00ff88] hover:underline font-semibold font-mono">
          Sign Up Free
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden flex flex-col justify-center items-center p-6">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#00ff88]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#ff4444]/5 blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-12 shadow-2xl flex flex-col items-center justify-center backdrop-blur-sm min-h-[400px]">
          <Loader2 size={36} className="text-[#00ff88] animate-spin" />
          <p className="text-xs text-[#6b7fa8] font-mono mt-3">Loading secure login form...</p>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}

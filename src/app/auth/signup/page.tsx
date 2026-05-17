'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Mail, Lock, ArrowRight, Loader2, Check, Key } from 'lucide-react';
import { toast } from 'sonner';

function SignupContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get('next') || '/dashboard';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (password.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters long.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit registration.');
      }

      setSuccess(true);
      toast.success('Registration Initiated!', {
        description: 'A 6-digit OTP verification code has been dispatched to your email.',
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      toast.error('Registration Error', {
        description: err.message || 'Failed to create a new account. Try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.warning('Please enter the 6-digit verification code.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid or expired OTP code.');
      }

      toast.success('Account Activated!', {
        description: 'Welcome to InboxFixer! Your profile is verified.',
      });

      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      console.error('OTP verify error:', err);
      toast.error('Verification Failed', {
        description: err.message || 'The code entered is invalid or expired.',
      });
    } finally {
      setOtpLoading(false);
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
        <h2 className="font-syne font-bold text-xl text-white">Protect Your Sender Reputation</h2>
        <p className="text-xs text-[#6b7fa8]">Sign up for a free account to unlock 10 daily scans + scan histories.</p>
      </div>

      {success ? (
        /* OTP VERIFICATION VIEW */
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-2xl p-4 text-center space-y-2">
            <div className="bg-[#00ff88]/10 p-2 rounded-full border border-[#00ff88]/20 w-fit mx-auto animate-pulse">
              <Key className="text-[#00ff88]" size={18} />
            </div>
            <h3 className="font-syne font-bold text-sm text-white">Enter OTP Verification Code</h3>
            <p className="text-[#6b7fa8] text-[11px] leading-relaxed">
              We dispatched a 6-digit code to <strong className="text-white font-mono break-all">{email}</strong>. Enter it below to unlock your account.
            </p>
          </div>

          <div className="space-y-1.5 font-mono">
            <label className="text-xs font-mono uppercase text-[#6b7fa8] tracking-wider block" htmlFor="otp">
              6-Digit Verification Code
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7fa8]" size={15} />
              <input
                id="otp"
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] transition-all text-sm font-mono tracking-widest text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={otpLoading || otp.length !== 6}
            className="w-full bg-[#00ff88] text-[#0a0f1e] py-3.5 rounded-xl font-syne font-bold hover:bg-[#00dd77] active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {otpLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verifying Account...
              </>
            ) : (
              <>
                Verify and Log In
                <ArrowRight size={15} />
              </>
            )}
          </button>
          
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="text-xs text-[#6b7fa8] hover:text-[#00ff88] underline font-mono"
            >
              Modify Email / Back
            </button>
          </div>
        </form>
      ) : (
        /* Sign up form */
        <form onSubmit={handleSignup} className="space-y-4">
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
            <label className="text-xs font-mono uppercase text-[#6b7fa8] tracking-wider" htmlFor="password">
              Choose Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7fa8]" size={15} />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
                Dispatched OTP Code...
              </>
            ) : (
              <>
                Register Account
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      )}

      {/* Switch back to login */}
      {!success && (
        <div className="text-center text-xs text-[#6b7fa8] pt-2">
          Already have an account?{' '}
          <a href={`/auth/login?next=${encodeURIComponent(redirectTo)}`} className="text-[#00ff88] hover:underline font-semibold font-mono">
            Log In
          </a>
        </div>
      )}
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden flex flex-col justify-center items-center p-6">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#00ff88]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#ff4444]/5 blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-12 shadow-2xl flex flex-col items-center justify-center backdrop-blur-sm min-h-[400px]">
          <Loader2 size={36} className="text-[#00ff88] animate-spin" />
          <p className="text-xs text-[#6b7fa8] font-mono mt-3">Loading secure signup form...</p>
        </div>
      }>
        <SignupContent />
      </Suspense>
    </div>
  );
}

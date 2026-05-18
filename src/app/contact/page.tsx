'use client';

import { useState } from 'react';
import { Shield, Mail, User, Info, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        toast.success('Your message was successfully received! We will respond shortly.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setError(data.error || 'Failed to submit contact request.');
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row gap-12 items-center">
        
        {/* Left Side text */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <span className="text-[10px] font-mono text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20 uppercase font-bold tracking-wider w-fit mx-auto md:mx-0 block">
            Contact Support
          </span>
          <h1 className="font-syne font-bold text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            How Can We <br/>
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00ff88]/60 bg-clip-text text-transparent">
              Help Your Deliverability?
            </span>
          </h1>
          <p className="text-[#6b7fa8] text-sm sm:text-base leading-relaxed">
            Have questions about SPF records, DKIM verification, or DMARC setup policies? Send us a ticket and our support specialists will investigate and get back to you shortly.
          </p>

          <div className="bg-[#0f1729]/30 border border-[#1e2d4a]/50 rounded-2xl p-6 space-y-3 hidden md:block">
            <h4 className="font-syne font-bold text-xs text-white uppercase tracking-wider">Helpful Resources</h4>
            <p className="text-xs text-[#8b9fc0] leading-relaxed">
              Check out our <a href="/blog" className="text-[#00ff88] hover:underline font-bold">Blog Hub</a> for in-depth DNS configuration tutorials and email reputation guides.
            </p>
          </div>
        </div>

        {/* Right Side Form Card */}
        <div className="flex-1 w-full max-w-md bg-[#0f1729]/65 border border-[#1e2d4a]/75 rounded-3xl p-6 md:p-8 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff88]/5 rounded-full blur-2xl pointer-events-none" />
          
          {success ? (
            <div className="text-center py-12 space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#00ff88]/10 p-4 rounded-full border border-[#00ff88]/20 w-fit mx-auto">
                <CheckCircle2 className="text-[#00ff88]" size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="font-syne font-bold text-xl text-white">Message Received!</h3>
                <p className="text-xs text-[#8b9fc0] max-w-sm mx-auto">
                  Thank you for reaching out. We have registered your ticket and our engineering specialists will email you an update within 24 hours.
                </p>
              </div>
              <button 
                onClick={() => setSuccess(false)}
                className="bg-white/5 hover:bg-white/10 border border-[#1e2d4a] text-white px-6 py-2.5 rounded-xl font-syne font-bold transition-all text-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {error && (
                <div className="bg-[#ff4444]/10 border border-[#ff4444]/20 rounded-xl p-3 flex items-center gap-2 text-xs text-[#ff4444]">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Full Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 text-[#6b7fa8]" size={14} />
                  <input 
                    type="text" 
                    placeholder="Sarah Jenkins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#020812] border border-[#1e2d4a]/75 focus:border-[#00ff88] focus:ring-0 focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-[#6b7fa8] font-mono transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 text-[#6b7fa8]" size={14} />
                  <input 
                    type="email" 
                    placeholder="sarah@yourdomain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#020812] border border-[#1e2d4a]/75 focus:border-[#00ff88] focus:ring-0 focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-[#6b7fa8] font-mono transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Subject</label>
                <div className="relative flex items-center">
                  <Info className="absolute left-3 text-[#6b7fa8]" size={14} />
                  <input 
                    type="text" 
                    placeholder="DMARC Record Setup Help"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#020812] border border-[#1e2d4a]/75 focus:border-[#00ff88] focus:ring-0 focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-[#6b7fa8] font-mono transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Message / Inquiry Details</label>
                <textarea 
                  placeholder="Tell us what deliverability issue you are experiencing..."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#020812] border border-[#1e2d4a]/75 focus:border-[#00ff88] focus:ring-0 focus:outline-none rounded-xl py-2.5 px-4 text-xs font-semibold text-white placeholder-[#6b7fa8] font-sans transition-colors resize-none leading-relaxed"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#00ff88] text-[#0a0f1e] font-syne font-bold py-3 rounded-xl hover:bg-[#00dd77] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0a0f1e] border-t-transparent rounded-full animate-spin" />
                    Submitting Ticket...
                  </>
                ) : (
                  <>
                    <Send size={12} className="fill-current" />
                    Submit Support Message
                  </>
                )}
              </button>

            </form>
          )}

        </div>

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

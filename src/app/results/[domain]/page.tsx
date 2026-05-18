'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Check, 
  Download, 
  Shield, 
  ArrowLeft, 
  AlertOctagon,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Star,
  Zap
} from 'lucide-react';
import type { ScanResults, CheckStatus } from '@/types';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  pass:    { color: '#00ff88', bg: 'rgba(0, 255, 136, 0.1)', border: 'rgba(0, 255, 136, 0.2)', icon: CheckCircle, label: 'Excellent' },
  fail:    { color: '#ff4444', bg: 'rgba(255, 68, 68, 0.1)', border: 'rgba(255, 68, 68, 0.2)', icon: XCircle, label: 'Critical' },
  warning: { color: '#ffaa00', bg: 'rgba(255, 170, 0, 0.1)', border: 'rgba(255, 170, 0, 0.2)', icon: AlertTriangle, label: 'Warning' },
  missing: { color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.1)', border: 'rgba(255, 107, 107, 0.2)', icon: AlertOctagon, label: 'Missing' },
};

const CHECK_NAMES = {
  spf:       { name: 'SPF Record Validation',    abbr: 'SPF' },
  dkim:      { name: 'DKIM Digital Signature',   abbr: 'DKIM' },
  dmarc:     { name: 'DMARC Enforcement Policy', abbr: 'DMARC' },
  mx:        { name: 'MX Deliverability Host',   abbr: 'MX' },
  blacklist: { name: 'IP Blacklist Status',      abbr: 'Blacklists' },
  rdns:      { name: 'Reverse DNS Pointer',      abbr: 'rDNS' },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('DNS Record copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={copy} 
      className="flex items-center gap-1.5 text-xs text-[#00ff88] hover:bg-[#00ff88]/10 transition-all px-3 py-1.5 rounded-lg border border-[#00ff88]/30 hover:border-[#00ff88] cursor-pointer"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied Record!' : 'Copy DNS Value'}
    </button>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#00ff88' : score >= 75 ? '#ffaa00' : '#ff4444';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#1e2d4a" strokeWidth="12" />
        <circle
          cx="90" cy="90" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-syne font-bold text-5xl tracking-tight" style={{ color }}>{score}</div>
        <div className="text-[10px] uppercase font-mono tracking-wider text-[#6b7fa8] mt-1">Health Score</div>
      </div>
    </div>
  );
}

function CheckCard({ checkKey, check }: { checkKey: string; check: any }) {
  const [expanded, setExpanded] = useState(check.status !== 'pass');
  const config = STATUS_CONFIG[check.status as CheckStatus] || STATUS_CONFIG.fail;
  const Icon = config.icon;
  const info = CHECK_NAMES[checkKey as keyof typeof CHECK_NAMES] || { name: checkKey, abbr: checkKey };

  return (
    <div 
      className="bg-[#0f1729]/80 border rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-lg"
      style={{ borderColor: check.status === 'pass' ? 'rgba(30, 45, 74, 0.6)' : `${config.color}35` }}
    >
      {/* Header Accordion Trigger */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: config.bg }}>
            <Icon size={20} style={{ color: config.color }} />
          </div>
          <div>
            <h4 className="font-syne font-bold text-base md:text-lg text-white flex items-center gap-2">
              {info.name}
            </h4>
            <p className="text-xs text-[#6b7fa8] font-mono mt-0.5">Category: {info.abbr}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span 
            className="text-xs px-3 py-1 rounded-full border font-mono font-semibold"
            style={{ color: config.color, borderColor: config.border, backgroundColor: config.bg }}
          >
            {config.label}
          </span>
          <span className="text-[#6b7fa8]">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </button>

      {/* Accordion Content */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 space-y-5 border-t border-[#1e2d4a]/50 bg-[#020812]/15">
          {/* Explanation */}
          <div className="space-y-1">
            <h5 className="text-xs uppercase font-mono text-[#6b7fa8] tracking-wider">What this checks</h5>
            <p className="text-sm text-[#8b9fc0] leading-relaxed">{check.explanation}</p>
          </div>

          {/* Current DNS Record */}
          {check.rawRecord && (
            <div className="space-y-1.5">
              <h5 className="text-xs uppercase font-mono text-[#6b7fa8] tracking-wider">Discovered DNS Record</h5>
              <div className="dns-record text-xs">{check.rawRecord}</div>
            </div>
          )}

          {/* Issue Statement */}
          {check.issue && (
            <div className="flex gap-3.5 p-4 rounded-xl" style={{ backgroundColor: config.bg, borderLeft: `4px solid ${config.color}` }}>
              <div>
                <h6 className="text-sm font-bold flex items-center gap-1.5 mb-1" style={{ color: config.color }}>
                  <AlertCircle size={15} />
                  Diagnostic Issue
                </h6>
                <p className="text-sm text-white/95 leading-relaxed">{check.issue}</p>
              </div>
            </div>
          )}

          {/* Impact of failure */}
          {check.impact && (
            <div className="space-y-1 bg-[#020812]/40 p-4 rounded-xl border border-[#1e2d4a]/40">
              <h5 className="text-xs uppercase font-mono text-fail font-semibold tracking-wider">⚠️ Business Impact</h5>
              <p className="text-sm text-[#8b9fc0] leading-relaxed">{check.impact}</p>
            </div>
          )}

          {/* Fix Action */}
          {check.fixCode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h5 className="text-xs uppercase font-mono text-[#00ff88] font-bold tracking-wider">→ Recommended DNS TXT Fix</h5>
                <CopyButton text={check.fixCode} />
              </div>
              <div className="dns-record text-xs">{check.fixCode}</div>
            </div>
          )}

          {/* Fix Instructions */}
          {check.fixInstructions && (
            <details className="group border border-[#1e2d4a]/60 rounded-xl overflow-hidden">
              <summary className="px-4 py-3 bg-[#020812]/30 text-xs font-mono text-[#6b7fa8] hover:text-white transition-colors cursor-pointer select-none flex justify-between items-center">
                <span>View step-by-step DNS panel directions</span>
                <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-4 text-xs text-[#8b9fc0] leading-relaxed whitespace-pre-wrap font-mono bg-[#020812]/70 border-t border-[#1e2d4a]/60">
                {check.fixInstructions}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const { domain } = useParams<{ domain: string }>();
  const router = useRouter();
  const [results, setResults] = useState<ScanResults | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scansRemaining, setScansRemaining] = useState<number | null>(null);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<'teaser' | 'modal' | 'submitted' | 'hidden'>('hidden');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Progressive scan animation states
  const [currentStep, setCurrentStep] = useState(0);
  const [apiDone, setApiDone] = useState(false);

  // Guard flag to prevent double-firing in Strict Mode or re-renders
  const scanInitiatedRef = useRef(false);

  // Step-by-step progress animation to complete all 6 ticks within 5 seconds (700ms intervals)
  useEffect(() => {
    if (!loading || apiDone) return;
    if (currentStep >= 6) return;

    const intervalTime = 700;

    const timeout = setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev < 6) {
          return prev + 1;
        }
        return prev;
      });
    }, intervalTime);

    return () => clearTimeout(timeout);
  }, [currentStep, loading, apiDone]);

  // Transition once both the progress animation and API response are done, or instantly if API finishes early
  useEffect(() => {
    if (apiDone) {
      setCurrentStep(6);
      setLoading(false);

      // Check if feedback widget should be displayed today
      try {
        const today = new Date().toISOString().split('T')[0];
        const lastFeedbackDate = localStorage.getItem('inboxfixer_feedback_last_date');
        if (lastFeedbackDate !== today) {
          setFeedbackState('teaser');
          setTimeLeft(30);
        }
      } catch (e) {
        console.warn('Storage check failed:', e);
      }
    }
  }, [currentStep, apiDone]);

  // Teaser 30s countdown countdown hook
  useEffect(() => {
    if (feedbackState !== 'teaser') return;
    if (timeLeft <= 0) {
      try {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('inboxfixer_feedback_last_date', today);
      } catch (e) {}
      setFeedbackState('hidden');
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [feedbackState, timeLeft]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) {
      toast.error('Feedback message is required.');
      return;
    }

    setFeedbackSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: feedbackRating,
          message: feedbackMessage,
          email: userEmail
        })
      });

      if (res.ok) {
        setFeedbackState('submitted');
        try {
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem('inboxfixer_feedback_last_date', today);
        } catch (e) {}
        
        setTimeout(() => {
          setFeedbackState('hidden');
        }, 3000);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit feedback.');
      }
    } catch {
      toast.error('Network error submitting feedback.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleFeedbackDismiss = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('inboxfixer_feedback_last_date', today);
    } catch (e) {}
    setFeedbackState('hidden');
  };

  useEffect(() => {
    if (!domain) return;
    if (scanInitiatedRef.current) return;
    scanInitiatedRef.current = true;

    async function checkPlanAndScan() {
      // Check auth plan first
      try {
        const resMe = await fetch('/api/dashboard/data');
        if (resMe.ok) {
          const dataMe = await resMe.json();
          setUserPlan(dataMe.profile?.plan as 'free' | 'pro');
          if (dataMe.user?.email) {
            setUserEmail(dataMe.user.email);
          }
        }
      } catch (err) {
        console.warn('Profile fetch error:', err);
      }

      // Run live scan
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || data.error || 'Scan query execution failed.');
          setLoading(false);
          return;
        }

        setResults(data);
        setAiSummary(data.aiSummary || '');
        setScansRemaining(data.scansRemaining);
        setApiDone(true);
      } catch {
        setError('Failed to securely contact diagnostic server. Verify your internet connection.');
        setLoading(false);
      }
    }
    
    checkPlanAndScan();
  }, [domain]);

  const handlePdfExport = async () => {
    if (!results) return;

    if (userPlan !== 'pro') {
      toast.error('Pro Feature Required', {
        description: 'PDF report downloads are available on the Pro subscription plan.',
        action: {
          label: 'Upgrade',
          onClick: () => router.push('/pricing')
        }
      });
      return;
    }

    setPdfLoading(true);
    try {
      // Lazy load jsPDF to minimize bundle chunk sizes in a bulletproof multi-environment resolver
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule;

      const doc = new jsPDF();
      
      // Document styling details
      doc.setFillColor(10, 15, 30); // Deep background
      doc.rect(0, 0, 210, 297, 'F');

      // Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(0, 255, 136); // Electric green
      doc.text('InboxFixer Email Deliverability Audit', 14, 25);
      
      // Metadata
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(150, 170, 200);
      doc.text(`Domain Audited: ${results.domain.toUpperCase()}`, 14, 34);
      doc.text(`Scanned Date: ${new Date(results.scannedAt).toLocaleDateString()} ${new Date(results.scannedAt).toLocaleTimeString()}`, 14, 40);
      doc.text(`Overall Deliverability Score: ${results.score}/100`, 14, 46);
      doc.text(`Grade: ${results.grade}`, 14, 52);

      // Horizontal line
      doc.setDrawColor(30, 45, 74);
      doc.setLineWidth(0.5);
      doc.line(14, 58, 196, 58);

      // AI Summary
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('Executive Summary', 14, 66);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(180, 195, 220);
      
      // Wrap text inside document limits
      const splitSummary = doc.splitTextToSize(aiSummary || 'No summary available.', 180);
      doc.text(splitSummary, 14, 73);

      const tableStartY = 73 + (splitSummary.length * 6) + 10;

      // Scan rows
      const tableRows = Object.entries(results.checks || {}).map(([key, check]: [string, any]) => [
        key.toUpperCase(),
        (check?.status || 'UNKNOWN').toUpperCase(),
        check?.issue || 'All checks passed. Authenticated and secure.',
        check?.fixCode || 'No updates required.'
      ]);

      autoTable(doc, {
        startY: tableStartY,
        head: [['DNS Component', 'Auth Status', 'Issue Found', 'Recommended Fix Value']],
        body: tableRows,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 4,
          textColor: [200, 210, 230],
          fillColor: [15, 23, 41]
        },
        headStyles: {
          fillColor: [30, 45, 74],
          textColor: [0, 255, 136],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [20, 30, 50]
        },
        columnStyles: {
          2: { cellWidth: 50 },
          3: { cellWidth: 70, fontStyle: 'italic' }
        }
      });

      doc.save(`inboxfixer-report-${results.domain}.pdf`);
      toast.success('Audit Report PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.error('Failed to generate PDF audit report. Try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-pass/5 blur-[120px] pointer-events-none" />
        <div className="text-center max-w-lg">
          <div className="flex justify-center mb-6">
            <div className="bg-[#0f1729] p-4 rounded-full border border-[#1e2d4a] animate-spin">
              <Shield className="text-[#00ff88]" size={36} />
            </div>
          </div>
          <h2 className="font-syne font-bold text-2xl md:text-3xl text-white mb-2">
            Performing Live Deliverability Scan
          </h2>
          <p className="text-sm text-[#6b7fa8] mb-8 font-mono">
            Auditing {domain} DNS configuration...
          </p>

          <div className="space-y-4 text-left max-w-sm mx-auto p-6 bg-[#0f1729]/90 border border-[#1e2d4a]/80 rounded-2xl shadow-xl">
            {[
              'Verifying SPF record lookup & configuration...',
              'Probing common DKIM public selector records...',
              'Checking DMARC protection and reporting configurations...',
              'Resolving MX nodes & detecting provider mail servers...',
              'Querying IP against 9 major public spam databases...',
              'Confirming reverse DNS hostname (rDNS) pointers...'
            ].map((msg, i) => {
              const isCompleted = i < currentStep;
              const isActive = i === currentStep;
              
              return (
                <div 
                  key={i} 
                  className={`flex items-center gap-3.5 text-xs font-mono transition-all duration-300 ${
                    isActive 
                      ? 'text-white font-semibold scale-[1.01]' 
                      : isCompleted 
                        ? 'text-[#8b9fc0]' 
                        : 'text-[#6b7fa8]/40'
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-[#00ff88] font-bold text-sm select-none">✓</span>
                  ) : isActive ? (
                    <Loader2 size={13} className="text-[#00ff88] animate-spin shrink-0" />
                  ) : (
                    <span className="text-[#ff4444]/60 font-bold text-sm select-none">✗</span>
                  )}
                  <span className="leading-relaxed">{msg}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isLimitError = error.toLowerCase().includes('limit') || 
                         error.toLowerCase().includes('scans') || 
                         error.toLowerCase().includes('scans per day');

    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-[#0f1729] border border-fail/30 rounded-3xl p-8 shadow-xl">
          <div className="bg-fail/10 p-4 rounded-full border border-fail/20 w-fit mx-auto mb-4">
            <XCircle className="text-[#ff4444]" size={42} />
          </div>
          <h2 className="font-syne font-bold text-2xl text-white mb-3">Check Interrupted</h2>
          <p className="text-[#8b9fc0] text-sm leading-relaxed mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            {isLimitError ? (
              <>
                <a 
                  href="/pricing" 
                  className="bg-[#00ff88] text-[#0a0f1e] px-6 py-3.5 rounded-xl font-syne font-bold hover:bg-[#00dd77] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={15} className="fill-current" /> Upgrade to PRO
                </a>
                <a 
                  href="/" 
                  className="bg-[#101626] text-[#8b9fc0] hover:text-white px-6 py-3.5 rounded-xl font-syne font-bold border border-[#1e2d4a] hover:border-[#00ff88]/30 active:scale-[0.98] transition-all"
                >
                  Check Another Domain
                </a>
              </>
            ) : (
              <a 
                href="/" 
                className="bg-[#00ff88] text-[#0a0f1e] px-6 py-3.5 rounded-xl font-syne font-bold hover:bg-[#00dd77] active:scale-[0.98] transition-all"
              >
                Check Another Domain
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-[#1e2d4a]/50 bg-[#0a0f1e]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
          <a href="/" className="font-syne font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
            <Shield className="text-[#00ff88]" size={16} />
            <span>Inbox<span className="text-[#00ff88]">Fixer</span></span>
          </a>
          <a 
            href="/" 
            className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#6b7fa8] hover:text-white transition-colors bg-[#0f1729] px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg border border-[#1e2d4a] font-semibold"
          >
            <ArrowLeft size={13} />
            <span className="hidden xs:inline">Check Another Domain</span>
            <span className="xs:hidden">New Check</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        
        {/* Domain Health Score Card */}
        <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/75 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#00ff88]/5 text-[#00ff88] text-[10px] font-mono px-4 py-1.5 rounded-bl-xl border-l border-b border-[#1e2d4a]/75">
            Provider: {results.emailProvider || 'Unknown'}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Score Ring */}
            <ScoreGauge score={results.score} />

            {/* Diagnostics Stats */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <span className="text-xs font-mono uppercase text-[#6b7fa8] tracking-widest">Audit Domain</span>
                <h2 className="font-mono text-2xl md:text-3xl font-bold text-white tracking-tight break-all mt-0.5">
                  {results.domain}
                </h2>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                <div className="font-syne font-bold text-xl">
                  Grade: <span className={
                    results.grade === 'A' ? 'text-[#00ff88]' :
                    results.grade === 'B' ? 'text-[#88ff44]' :
                    results.grade === 'C' ? 'text-[#ffaa00]' : 'text-[#ff4444]'
                  }>{results.grade}</span>
                </div>
                
                <div className="w-1.5 h-1.5 rounded-full bg-[#1e2d4a] hidden md:block" />

                <div className="flex items-center gap-3.5 text-xs font-mono">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-fail" /> {results.summary.critical} Critical</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> {results.summary.warnings} Warnings</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-pass" /> {results.summary.passed} Passed</span>
                </div>
              </div>

              {/* AI Expert Insight Card */}
              {aiSummary && (
                <div className="bg-[#020812]/50 border border-[#1e2d4a]/60 rounded-2xl p-4 md:p-5 flex gap-3 text-left relative overflow-hidden">
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#00ff88]/10 text-[#00ff88] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    <Sparkles size={8} />
                    AI Summary
                  </div>
                  <div className="text-sm text-[#8b9fc0] leading-relaxed pr-8">
                    {aiSummary}
                  </div>
                </div>
              )}

              {/* Pro Feature Actions */}
              <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                <button
                  onClick={handlePdfExport}
                  disabled={pdfLoading}
                  className="bg-white/10 hover:bg-white/15 text-white border border-[#1e2d4a] px-4 py-2.5 rounded-xl text-xs font-syne font-bold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Download size={14} className="text-[#00ff88]" />
                  {pdfLoading ? 'Preparing PDF...' : 'Download PDF Report'}
                  {userPlan !== 'pro' && (
                    <span className="bg-[#00ff88]/20 text-[#00ff88] text-[9px] font-mono px-1.5 py-0.5 rounded font-normal uppercase">Pro</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed diagnostic dropdown panels */}
        <div className="space-y-4">
          <h3 className="font-syne font-bold text-xl text-white">Full DNS Audit & Diagnostics</h3>
          {Object.entries(results.checks).map(([key, check]) => (
            <CheckCard key={key} checkKey={key} check={check} />
          ))}
        </div>

        {/* Limit Warning Upgrade Banner (dynamic checksRemaining status check) */}
        {scansRemaining !== null && scansRemaining <= 1 && (
          <div className="bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-2xl p-6 text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00ff88]" />
            <h4 className="font-syne font-bold text-lg text-white">
              {scansRemaining === 0 ? "You've used all free scans for today" : "Only 1 free check remaining today"}
            </h4>
            <p className="text-[#8b9fc0] text-sm max-w-md mx-auto leading-relaxed">
              Create a free account to unlock 10 scans/day + save your history, or upgrade to Pro for unlimited scans, daily alerts, and PDF exports.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <a 
                href="/auth/signup" 
                className="bg-[#00ff88] text-[#0a0f1e] px-5 py-2.5 rounded-xl font-syne font-bold hover:bg-[#00dd77] active:scale-[0.98] transition-all text-xs"
              >
                Create Free Account
              </a>
              <a 
                href="/pricing" 
                className="bg-transparent hover:bg-white/5 border border-[#1e2d4a] text-white px-5 py-2.5 rounded-xl font-syne font-bold active:scale-[0.98] transition-all text-xs"
              >
                Upgrade to Pro ($9/mo)
              </a>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#1e2d4a]/20 bg-[#060a14] py-8 text-center text-xs text-[#6b7fa8] mt-12">
        <div className="max-w-7xl mx-auto px-6">
          &copy; {new Date().getFullYear()} InboxFixer. Keeping your domain deliverability safe.
        </div>
      </footer>

      {/* Floating Feedback Widget */}
      {feedbackState !== 'hidden' && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300 w-80 sm:w-96 select-none">
          
          {feedbackState === 'teaser' && (
            <div className="bg-[#0f1729]/95 border border-[#00ff88]/30 backdrop-blur-md rounded-2xl shadow-2xl p-4.5 relative overflow-hidden flex items-center justify-between gap-3 group hover:border-[#00ff88]/80 transition-all">
              
              {/* Countdown Shifting Progress Bar */}
              <div 
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#00ff88] to-[#00ff88]/60 transition-all duration-1000"
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />

              <div className="space-y-1">
                <h4 className="font-syne font-bold text-sm text-white flex items-center gap-1.5">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
                  </span>
                  Share Scan Feedback
                </h4>
                <p className="text-[11px] text-[#6b7fa8] font-mono leading-relaxed">
                  Help us refine our diagnostics! Quick 5-star check.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setFeedbackState('modal')}
                  className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0a0f1e] px-3 py-2 rounded-lg font-syne font-bold text-[10px] transition-all cursor-pointer shadow-md"
                >
                  Rate Scan
                </button>
                <button
                  onClick={handleFeedbackDismiss}
                  className="text-[#6b7fa8] hover:text-white transition-colors p-1 cursor-pointer"
                >
                  <XCircle size={15} />
                </button>
              </div>
            </div>
          )}

          {feedbackState === 'modal' && (
            <form 
              onSubmit={handleFeedbackSubmit}
              className="bg-[#0f1729]/95 border border-[#1e2d4a] backdrop-blur-md rounded-3xl shadow-2xl p-6 space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-[#1e2d4a]" />

              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-syne font-bold text-base text-white">How was your check experience?</h4>
                  <p className="text-[10px] text-[#6b7fa8] font-mono">Your rating is secure and private.</p>
                </div>
                <button
                  type="button"
                  onClick={handleFeedbackDismiss}
                  className="text-[#6b7fa8] hover:text-white transition-colors p-1 cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Star selector (1-5) */}
              <div className="space-y-1.5 text-center py-1">
                <label className="text-[10px] text-[#6b7fa8] font-mono uppercase block">Select Star Rating</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-110 active:scale-90 transition-all cursor-pointer"
                    >
                      <Star
                        size={26}
                        className={`${
                          star <= feedbackRating 
                            ? 'fill-[#ffb800] text-[#ffb800]' 
                            : 'text-[#1e2d4a] hover:text-[#ffb800]'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback description text */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#6b7fa8] font-mono uppercase block">Feedback Message</label>
                <textarea
                  required
                  rows={3}
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Tell us what checks were useful or SPF template issues you fixed..."
                  className="w-full bg-[#020812]/50 border border-[#1e2d4a] focus:border-[#00ff88] rounded-xl p-3 text-xs text-white placeholder-[#6b7fa8] focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Submit / Action Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="flex-1 bg-[#00ff88] hover:bg-[#00dd77] disabled:opacity-50 text-[#0a0f1e] py-2.5 rounded-xl font-syne font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer"
                >
                  {feedbackSubmitting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleFeedbackDismiss}
                  className="bg-[#1e2d4a]/50 hover:bg-[#1e2d4a] border border-[#1e2d4a] text-white px-4 py-2.5 rounded-xl font-syne text-xs transition-all cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </form>
          )}

          {feedbackState === 'submitted' && (
            <div className="bg-[#0f1729]/95 border border-[#00ff88] backdrop-blur-md rounded-3xl shadow-2xl p-6 text-center space-y-3 relative overflow-hidden">
              <div className="bg-[#00ff88]/10 p-3 rounded-full border border-[#00ff88]/20 w-fit mx-auto">
                <CheckCircle className="text-[#00ff88] animate-bounce" size={28} />
              </div>
              <h4 className="font-syne font-bold text-sm text-white">Thank You for Your Feedback!</h4>
              <p className="text-[11px] text-[#6b7fa8] font-mono leading-relaxed max-w-xs mx-auto">
                Your report has been successfully delivered to the admin dashboard. We appreciate your diagnostic insights!
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

'use client';

import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function ReviewCountBadge() {
  return (
    <div className="inline-flex items-center gap-2 bg-[#0f1729]/80 border border-[#00ff88]/30 rounded-full px-5 py-2.5 shadow-lg mb-4">
      <Sparkles size={14} className="text-[#00ff88] animate-pulse" />
      <span className="text-xs font-mono font-semibold text-white">InboxFixer Platform:</span>
      <div className="flex items-center gap-1 bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/20">
        <CheckCircle2 size={11} className="text-[#00ff88]" />
        <span className="text-[10px] font-mono text-[#00ff88] font-bold uppercase">100% Transparent</span>
      </div>
    </div>
  );
}

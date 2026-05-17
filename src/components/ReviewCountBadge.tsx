'use client';

import { useState, useEffect } from 'react';
import { Star, Sparkles } from 'lucide-react';

export default function ReviewCountBadge() {
  const [reviewCount, setReviewCount] = useState(29621);

  useEffect(() => {
    const baselineDate = new Date('2026-05-17T00:00:00Z');
    const baseCount = 29621;

    const calculateCount = () => {
      const diffMs = new Date().getTime() - baselineDate.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      return baseCount + Math.max(0, diffMinutes);
    };

    setReviewCount(calculateCount());

    const interval = setInterval(() => {
      setReviewCount(calculateCount());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 bg-[#0f1729]/80 border border-[#00ff88]/40 rounded-full px-5 py-2.5 shadow-lg animate-pulse mb-4">
      <Sparkles size={14} className="text-[#00ff88]" />
      <span className="text-xs font-mono font-semibold text-white">InboxFixer Trust Index:</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={11} className="fill-[#ffb800] text-[#ffb800]" />
        ))}
      </div>
      <span className="text-[11px] font-mono text-[#00ff88] font-bold">4.9/5.0 Stars</span>
      <span className="text-[10px] font-mono text-[#6b7fa8] pl-1 border-l border-[#1e2d4a]">
        {reviewCount.toLocaleString('en-US')} Real Reviews
      </span>
    </div>
  );
}

import { Loader2, Shield } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-[#00ff88]/20 bg-[#00ff88]/10">
          <Shield className="text-[#00ff88]" size={26} />
        </div>
        <div className="space-y-2">
          <Loader2 size={28} className="text-[#00ff88] animate-spin mx-auto" />
          <p className="text-sm font-mono text-[#6b7fa8]">Loading admin secure channel...</p>
        </div>
      </div>
    </div>
  );
}

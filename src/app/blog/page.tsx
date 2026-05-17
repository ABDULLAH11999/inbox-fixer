import { getBlogs, getSettings } from '@/lib/db';
import { Shield, BookOpen, Star, ArrowRight, Sparkles, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import ReviewCountBadge from '@/components/ReviewCountBadge';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings();
  const title = settings?.seo?.site_title ? `Blog Hub - ${settings.seo.site_title}` : 'InboxFixer Deliverability & Email Fixer Blog Hub';
  const description = settings?.seo?.site_desc || 'Read expert insights on SPF syntax checking, DKIM signature alignment, and DMARC mail fix suggestions.';
  
  return {
    title,
    description,
    keywords: ['mail check', 'mail fixer', 'mail fix suggestion', 'spf error', 'dkim alignment', 'dmarc record'],
    alternates: {
      canonical: settings?.seo?.canonical_url ? `${settings.seo.canonical_url}/blog` : undefined,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'InboxFixer Deliverability & Email Fixer Blog Hub',
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png']
    }
  };
}

export default async function BlogHubPage() {
  const blogs = getBlogs().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const settings = getSettings();

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
            <a href="/pricing" className="hidden xs:inline-block text-[#6b7fa8] hover:text-white transition-colors text-xs sm:text-sm font-semibold">
              Pricing
            </a>
            <a href="/blog" className="hidden xs:inline-block text-white hover:text-[#00ff88] transition-colors text-xs sm:text-sm font-semibold border-b-2 border-[#00ff88] pb-1">
              Blog
            </a>
            <a 
              href="/auth/signup" 
              className="bg-[#00ff88] text-[#0a0f1e] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-syne font-bold hover:bg-[#00dd77] hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm whitespace-nowrap"
            >
              Sign Up Free
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Header */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-20 space-y-16">
        
        {/* Banner with 4.9 reviews rating */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <ReviewCountBadge />

          <h1 className="font-syne font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight tracking-tight">
            Email Deliverability & <br/>
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00ff88]/60 bg-clip-text text-transparent">
              Search Ranking Hub
            </span>
          </h1>

          <p className="text-[#6b7fa8] text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Stay ahead of spam folders. Read the latest organic guidelines, mail fix suggestions, and configuration audits written by leading postmasters and engineers.
          </p>
        </div>

        {/* Blogs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <article 
              key={blog.id} 
              className="bg-[#0f1729]/65 border border-[#1e2d4a]/75 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between hover:border-[#00ff88]/30 transition-all hover:scale-[1.01] group relative"
            >
              <div className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden border-b border-[#1e2d4a]/70">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {blog.tags?.map((t: string) => (
                      <span 
                        key={t} 
                        className="text-[9px] font-mono text-[#6b7fa8] bg-[#020812]/50 px-2 py-0.5 rounded border border-[#1e2d4a]/50 uppercase"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <h2 className="font-syne font-bold text-base md:text-lg text-white group-hover:text-[#00ff88] transition-colors leading-snug">
                    <a href={`/blog/${blog.slug}`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {blog.title}
                    </a>
                  </h2>

                  <p className="text-xs text-[#8b9fc0] leading-relaxed line-clamp-3">
                    {blog.short_desc}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 mt-2">
                <a 
                  href={`/blog/${blog.slug}`} 
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#00ff88] hover:text-white hover:translate-x-0.5 transition-all group/btn"
                >
                  Read Full Article
                  <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </article>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2d4a]/30 bg-[#060a14] py-8 text-center text-xs text-[#6b7fa8]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            &copy; {new Date().getFullYear()} InboxFixer. Protecting your business sender reputation.
          </div>
          <div className="flex gap-6">
            <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="/blog" className="hover:text-white transition-colors">Blog</a>
            <a href="/auth/login" className="hover:text-white transition-colors">Login</a>
            <a href="/auth/signup" className="hover:text-white transition-colors">Sign Up</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

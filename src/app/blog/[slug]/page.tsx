import { getBlogs, getSettings } from '@/lib/db';
import { Shield, ArrowLeft, Star, Clock, BookOpen, Calendar, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const blogs = getBlogs();
  const blog = blogs.find(b => b.slug === resolvedParams.slug);

  if (!blog) {
    return {
      title: 'Article Not Found | InboxFixer',
      description: 'The requested deliverability guide could not be located.'
    };
  }

  return {
    title: blog.seo_title || `${blog.title} | InboxFixer Guide`,
    description: blog.seo_desc || blog.short_desc,
    keywords: blog.seo_keywords ? blog.seo_keywords.split(',').map((k: string) => k.trim()) : ['mail fixer', 'mail check', 'dns help'],
    alternates: {
      canonical: `https://inboxfixer.com/blog/${blog.slug}`
    }
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const blogs = getBlogs();
  const blog = blogs.find(b => b.slug === resolvedParams.slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden flex flex-col justify-between">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-15%] w-[500px] h-[500px] rounded-full bg-[#00ff88]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#ff4444]/5 blur-[150px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="border-b border-[#1e2d4a]/50 bg-[#0a0f1e]/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="bg-[#0f1729] p-2 rounded-xl border border-[#1e2d4a] group-hover:border-[#00ff88]/50 transition-all">
              <Shield className="text-[#00ff88]" size={22} />
            </div>
            <span className="font-syne font-bold text-2xl tracking-tight text-white">
              Inbox<span className="text-[#00ff88]">Fixer</span>
            </span>
          </a>

          <nav className="flex gap-6 items-center">
            <a href="/pricing" className="text-[#6b7fa8] hover:text-white transition-colors text-sm font-semibold">
              Pricing
            </a>
            <a href="/blog" className="text-[#00ff88] hover:text-white transition-colors text-sm font-semibold border-b-2 border-[#00ff88] pb-1">
              Blog
            </a>
            <a 
              href="/auth/signup" 
              className="bg-[#00ff88] text-[#0a0f1e] px-4 py-2 rounded-xl font-syne font-bold hover:bg-[#00dd77] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              Sign Up Free
            </a>
          </nav>
        </div>
      </header>

      {/* Article Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-16 space-y-8">
        
        {/* Back Link */}
        <a 
          href="/blog" 
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#6b7fa8] hover:text-[#00ff88] transition-colors group cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Blog Hub
        </a>

        {/* Content Header Grid */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#6b7fa8]">
            <div className="flex items-center gap-1.5 bg-[#0f1729]/80 border border-[#1e2d4a]/50 px-3 py-1 rounded-full text-[10px]">
              <Calendar size={12} className="text-[#00ff88]" />
              <span>{new Date(blog.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-[#0f1729]/80 border border-[#1e2d4a]/50 px-3 py-1 rounded-full text-[10px]">
              <Clock size={12} className="text-[#00ff88]" />
              <span>4 Min Read</span>
            </div>
          </div>

          <h1 className="font-syne font-bold text-3xl md:text-5xl text-white leading-tight tracking-tight">
            {blog.title}
          </h1>

          <p className="text-[#8b9fc0] text-sm md:text-base leading-relaxed border-l-4 border-[#00ff88] pl-4 py-1 italic bg-[#0f1729]/30 rounded-r-2xl pr-4">
            "{blog.short_desc}"
          </p>
        </div>

        {/* Banner Cover Image */}
        <div className="aspect-video w-full overflow-hidden rounded-3xl border border-[#1e2d4a]/80 shadow-2xl relative">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body Content */}
        <article className="bg-[#0f1729]/55 border border-[#1e2d4a]/60 rounded-3xl p-6 md:p-10 shadow-xl space-y-6 prose prose-invert prose-emerald max-w-none text-[#8b9fc0] text-sm md:text-base leading-relaxed">
          
          <div 
            dangerouslySetInnerHTML={{ __html: blog.content }} 
            className="space-y-6 blog-content-renderer"
          />

          <div className="flex flex-wrap gap-1.5 pt-8 border-t border-[#1e2d4a]/30">
            {blog.tags?.map((t: string) => (
              <span 
                key={t} 
                className="text-[10px] font-mono text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20 uppercase"
              >
                #{t}
              </span>
            ))}
          </div>

        </article>

        {/* Global Star Rating CTA */}
        <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-syne font-bold text-base text-white">Check Your Own Domain Live</h3>
            <p className="text-xs text-[#6b7fa8] max-w-sm leading-relaxed">
              Scan SPF syntax configurations, trace DKIM alignments, and verify blacklist standings in 30 seconds.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} className="fill-[#00ff88] text-[#00ff88]" />
                ))}
              </div>
              <span className="text-xs font-mono font-bold text-white">4.9/5.0 Stars</span>
            </div>
            <a 
              href="/" 
              className="bg-[#00ff88] text-[#0a0f1e] px-6 py-2.5 rounded-xl font-syne font-bold text-xs hover:bg-[#00dd77] active:scale-[0.98] transition-all whitespace-nowrap shadow-md"
            >
              Scan Domain Free
            </a>
          </div>
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
            <a href="/auth/login" className="hover:text-white transition-colors">Login</a>
            <a href="/auth/signup" className="hover:text-white transition-colors">Sign Up</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

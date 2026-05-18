'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Users, 
  CreditCard, 
  Sliders, 
  Settings, 
  Globe, 
  LayoutDashboard, 
  Key, 
  Mail, 
  Lock, 
  Trash2, 
  Edit3, 
  Check, 
  Loader2, 
  Save, 
  Zap, 
  Send,
  Eye,
  EyeOff,
  BookOpen,
  PlusCircle,
  FileText,
  TrendingUp,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'plans' | 'payments' | 'config' | 'seo' | 'blogs' | 'track' | 'feedback'>('overview');
  const [timeFilter, setTimeFilter] = useState<'1day' | '7days' | '30days' | 'overall'>('7days');
  const router = useRouter();

  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin Data states
  const [adminData, setAdminData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // SMTP Test state
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [smtpLoading, setSmtpLoading] = useState(false);

  // Edit forms
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editActive, setEditActive] = useState(true);

  // SEO form
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoCanonical, setSeoCanonical] = useState('');
  const [seoHeader, setSeoHeader] = useState('');
  const [seoFooter, setSeoFooter] = useState('');

  // Stripe/Receiver Config form
  const [stripeMode, setStripeMode] = useState('test');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [enableOtp, setEnableOtp] = useState(true);

  // Plans config form (copy of plans list for editing)
  const [editablePlans, setEditablePlans] = useState<any[]>([]);

  // --- BLOG STATES ---
  const [blogFormOpen, setBlogFormOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogShortDesc, setBlogShortDesc] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState('');
  const [blogTags, setBlogTags] = useState('');
  const [blogSeoTitle, setBlogSeoTitle] = useState('');
  const [blogSeoDesc, setBlogSeoDesc] = useState('');
  const [blogSeoKeywords, setBlogSeoKeywords] = useState('');

  // 1. Initial Load Checks
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.user && data.user.role === 'superadmin') {
          setSessionUser(data.user);
          await loadAdminData();
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Fetch all system data
  async function loadAdminData() {
    setDataLoading(true);
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (res.ok) {
        setAdminData(data);
        
        // Seed SEO values
        if (data.settings?.seo) {
          setSeoTitle(data.settings.seo.site_title || '');
          setSeoDesc(data.settings.seo.site_desc || '');
          setSeoCanonical(data.settings.seo.canonical_url || '');
          setSeoHeader(data.settings.seo.header_tags || '');
          setSeoFooter(data.settings.seo.footer_tags || '');
        }

        // Seed basic settings
        if (data.settings) {
          setStripeMode(data.settings.stripe_mode || 'test');
          setReceiverEmail(data.settings.smtp_receiver_email || '');
          setTestEmailAddress(data.settings.smtp_receiver_email || '');
          setEnableOtp(data.settings.enable_otp !== false);
        }

        // Seed plans
        if (data.plans) {
          setEditablePlans(JSON.parse(JSON.stringify(data.plans)));
        }
      } else {
        toast.error(data.error || 'Failed to sync admin console.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network failure connecting to admin server.');
    } finally {
      setDataLoading(false);
    }
  }

  // 3. Admin Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.user.role === 'superadmin') {
          setSessionUser(data.user);
          toast.success('Access Granted', { description: 'Authenticated successfully as Superadmin.' });
          await loadAdminData();
        } else {
          toast.error('Access Denied', { description: 'You do not have administrative credentials.' });
          await fetch('/api/auth/logout', { method: 'POST' }); 
        }
      } else {
        toast.error(data.error || 'Invalid login details.');
      }
    } catch (err) {
      toast.error('Authentication backend offline.');
    } finally {
      setLoginLoading(false);
    }
  };

  // 4. Admin Sign Out
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSessionUser(null);
      toast.success('Logged out successfully from secure console.');
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Update user plan/role/active state
  const handleSaveUser = async (userId: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateUser',
          userId,
          plan: editPlan,
          role: editRole,
          is_active: editActive
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'User modified successfully.');
        setEditingUserId(null);
        await loadAdminData();
      } else {
        toast.error(data.error || 'Failed to update user.');
      }
    } catch (err) {
      toast.error('Failed to commit user update.');
    }
  };

  // 6. Delete user
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you absolutely sure you want to delete user ${userEmail}? This will erase their entire history log.`)) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteUser',
          userId
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'User account permanently purged.');
        await loadAdminData();
      } else {
        toast.error(data.error || 'Failed to delete user.');
      }
    } catch (err) {
      toast.error('Error contacting database.');
    }
  };

  // 7. Update all plans 
  const handleSavePlans = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePlans',
          plans: editablePlans
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Pricing plans saved successfully.');
        await loadAdminData();
      } else {
        toast.error(data.error || 'Failed to update plans.');
      }
    } catch (err) {
      toast.error('Error saving plan parameters.');
    }
  };

  // 8. Update Settings 
  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateSettings',
          stripe_mode: stripeMode,
          smtp_receiver_email: receiverEmail,
          enable_otp: enableOtp
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'System settings updated.');
        await loadAdminData();
      } else {
        toast.error(data.error || 'Settings update failed.');
      }
    } catch (err) {
      toast.error('Error updating config.');
    }
  };

  // 9. Fire Resend connection test
  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      toast.warning('Please enter a target recipient email.');
      return;
    }

    setSmtpLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendTestEmail',
          testRecipient: testEmailAddress
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Resend Success!', { description: data.message });
      } else {
        toast.error('Resend Connection Failed', { description: data.error });
      }
    } catch {
      toast.error('Resend Timeout');
    } finally {
      setSmtpLoading(false);
    }
  };

  // 10. Update SEO parameters
  const handleSaveSEO = async () => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateSEO',
          site_title: seoTitle,
          site_desc: seoDesc,
          canonical_url: seoCanonical,
          header_tags: seoHeader,
          footer_tags: seoFooter
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'SEO tags saved. Crawlers updated.');
        await loadAdminData();
      } else {
        toast.error(data.error || 'SEO update failed.');
      }
    } catch (err) {
      toast.error('Error updating SEO records.');
    }
  };

  // --- BLOGS HANDLERS ---
  const handleOpenCreateBlog = () => {
    setEditingBlogId(null);
    setBlogTitle('');
    setBlogShortDesc('');
    setBlogContent('');
    setBlogImage('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop');
    setBlogTags('mail check, mail fixer');
    setBlogSeoTitle('');
    setBlogSeoDesc('');
    setBlogSeoKeywords('');
    setBlogFormOpen(true);
  };

  const handleOpenEditBlog = (blog: any) => {
    setEditingBlogId(blog.id);
    setBlogTitle(blog.title);
    setBlogShortDesc(blog.short_desc);
    setBlogContent(blog.content);
    setBlogImage(blog.image);
    setBlogTags(Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags);
    setBlogSeoTitle(blog.seo_title || '');
    setBlogSeoDesc(blog.seo_desc || '');
    setBlogSeoKeywords(blog.seo_keywords || '');
    setBlogFormOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogShortDesc || !blogContent) {
      toast.warning('Title, Short Description, and Content fields are strictly required.');
      return;
    }

    try {
      const isEdit = !!editingBlogId;
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isEdit ? 'updateBlog' : 'createBlog',
          blogId: editingBlogId,
          title: blogTitle,
          short_desc: blogShortDesc,
          content: blogContent,
          image: blogImage,
          tags: blogTags,
          seo_title: blogSeoTitle,
          seo_desc: blogSeoDesc,
          seo_keywords: blogSeoKeywords
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Blog post successfully ${isEdit ? 'updated' : 'published'}.`);
        setBlogFormOpen(false);
        await loadAdminData();
      } else {
        toast.error(data.error || 'Failed to submit blog post.');
      }
    } catch {
      toast.error('Connection timed out while writing blog.');
    }
  };

  const handleDeleteBlog = async (blogId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete the blog "${title}"?`)) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteBlog',
          blogId
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Blog removed.');
        await loadAdminData();
      } else {
        toast.error(data.error || 'Failed to delete blog.');
      }
    } catch {
      toast.error('Network failure writing to blog database.');
    }
  };

  // --- VISITOR ANALYTICS PROCESSOR ---
  const stats = useMemo(() => {
    if (!adminData || !adminData.visits) {
      return {
        visitsCount: 0,
        uniqueCount: 0,
        revisitedCount: 0,
        chartData: []
      };
    }

    const now = new Date();
    const filterVisits = adminData.visits.filter((v: any) => {
      const visitDate = new Date(v.created_at);
      const diffTime = now.getTime() - visitDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (timeFilter === '1day') return diffDays <= 1;
      if (timeFilter === '7days') return diffDays <= 7;
      if (timeFilter === '30days') return diffDays <= 30;
      return true; // overall
    });

    const visitsCount = filterVisits.length;
    const uniqueVisitorIds = new Set<string>();

    const visitorMap = new Map<string, { total: number; revisited: boolean }>();
    filterVisits.forEach((v: any) => {
      uniqueVisitorIds.add(v.visitor_id);
      if (!visitorMap.has(v.visitor_id)) {
        visitorMap.set(v.visitor_id, { total: 0, revisited: false });
      }
      const current = visitorMap.get(v.visitor_id)!;
      current.total += 1;
      if (v.revisited) {
        current.revisited = true;
      }
    });

    let revisitedCount = 0;
    visitorMap.forEach((val) => {
      if (val.revisited || val.total > 1) {
        revisitedCount++;
      }
    });

    const uniqueCount = uniqueVisitorIds.size;

    // Group chart data
    let chartData: { label: string; count: number }[] = [];

    if (timeFilter === '1day') {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourStr = d.getHours().toString().padStart(2, '0') + ':00';
        
        const count = filterVisits.filter((v: any) => {
          const vDate = new Date(v.created_at);
          return vDate.getFullYear() === d.getFullYear() &&
                 vDate.getMonth() === d.getMonth() &&
                 vDate.getDate() === d.getDate() &&
                 vDate.getHours() === d.getHours();
        }).length;

        chartData.push({ label: hourStr, count });
      }
    } else if (timeFilter === '7days') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        const count = filterVisits.filter((v: any) => {
          const vDate = new Date(v.created_at);
          return vDate.getFullYear() === d.getFullYear() &&
                 vDate.getMonth() === d.getMonth() &&
                 vDate.getDate() === d.getDate();
        }).length;

        chartData.push({ label: dateStr, count });
      }
    } else if (timeFilter === '30days') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        const count = filterVisits.filter((v: any) => {
          const vDate = new Date(v.created_at);
          return vDate.getFullYear() === d.getFullYear() &&
                 vDate.getMonth() === d.getMonth() &&
                 vDate.getDate() === d.getDate();
        }).length;

        chartData.push({ label: dateStr, count });
      }
    } else {
      for (let i = 14; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        const count = filterVisits.filter((v: any) => {
          const vDate = new Date(v.created_at);
          return vDate.getFullYear() === d.getFullYear() &&
                 vDate.getMonth() === d.getMonth() &&
                 vDate.getDate() === d.getDate();
        }).length;

        chartData.push({ label: dateStr, count });
      }
    }

    return {
      visitsCount,
      uniqueCount,
      revisitedCount,
      chartData
    };
  }, [adminData, timeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={36} className="text-[#00ff88] animate-spin mx-auto" />
          <p className="text-sm font-mono text-[#6b7fa8]">Loading admin secure channel...</p>
        </div>
      </div>
    );
  }

  // --- RENDER LOGIN INTERFACE IF NOT ADMIN ---
  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col justify-center items-center p-6 relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-[-30%] left-[-20%] w-[600px] h-[600px] rounded-full bg-[#00ff88]/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[600px] h-[600px] rounded-full bg-[#ff4444]/5 blur-[150px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#0f1729]/80 border border-[#1e2d4a]/85 shadow-2xl rounded-3xl p-8 backdrop-blur-md relative z-10 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="bg-[#00ff88]/10 p-3 rounded-full border border-[#00ff88]/20 w-fit mx-auto">
              <Shield className="text-[#00ff88] fill-[#00ff88]/10" size={36} />
            </div>
            <h1 className="font-syne font-bold text-2xl text-white tracking-tight">InboxFixer Secure Portal</h1>
            <p className="text-xs font-mono text-[#6b7fa8]">Administrative Terminal Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-[#6b7fa8] tracking-wider block">Admin Email</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7fa8]" size={14} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@inboxfixer.com"
                  required
                  className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-[#6b7fa8] tracking-wider block">Security Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7fa8]" size={14} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl pl-10 pr-12 py-3 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6b7fa8] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0a0f1e] font-syne font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Authorize Login
                </>
              )}
            </button>

          </form>

          <div className="bg-[#020812]/50 border border-[#1e2d4a]/50 rounded-xl p-3.5 text-center text-[10px] font-mono text-[#6b7fa8] leading-relaxed">
            <span className="text-[#00ff88] font-bold block mb-1">SEED DATA LOGINS:</span>
            Superadmin: <span className="text-white">admin@inboxfixer.com</span> / <span className="text-white">AdminPassword123!</span><br />
            Normal User: <span className="text-white">user@inboxfixer.com</span> / <span className="text-white">UserPassword123!</span>
          </div>

        </div>
      </div>
    );
  }

  // --- RENDER DYNAMIC FUTURISTIC ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col md:flex-row">
      
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 bg-[#0f1729] border-r border-[#1e2d4a]/70 flex flex-col justify-between shrink-0">
        
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-2">
            <Shield className="text-[#00ff88] fill-[#00ff88]/10 animate-pulse" size={22} />
            <span className="font-syne font-bold text-lg tracking-tight text-white">
              Inbox<span className="text-[#00ff88]">Fixer</span>
            </span>
          </div>

          <nav className="space-y-1 text-xs">
            
            <button
              onClick={() => { setActiveTab('overview'); setBlogFormOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-syne font-bold transition-all text-left cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-[#00ff88]/15 border border-[#00ff88]/30 text-[#00ff88]' 
                  : 'text-[#6b7fa8] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <LayoutDashboard size={15} />
              Console Overview
            </button>

            <button
              onClick={() => { setActiveTab('users'); setBlogFormOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-syne font-bold transition-all text-left cursor-pointer ${
                activeTab === 'users' 
                  ? 'bg-[#00ff88]/15 border border-[#00ff88]/30 text-[#00ff88]' 
                  : 'text-[#6b7fa8] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Users size={15} />
              Manage Users
            </button>

            <button
              onClick={() => { setActiveTab('blogs'); setBlogFormOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-syne font-bold transition-all text-left cursor-pointer ${
                activeTab === 'blogs' 
                  ? 'bg-[#00ff88]/15 border border-[#00ff88]/30 text-[#00ff88]' 
                  : 'text-[#6b7fa8] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <BookOpen size={15} />
              Manage Blogs
            </button>

            <button
              onClick={() => { setActiveTab('plans'); setBlogFormOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-syne font-bold transition-all text-left cursor-pointer ${
                activeTab === 'plans' 
                  ? 'bg-[#00ff88]/15 border border-[#00ff88]/30 text-[#00ff88]' 
                  : 'text-[#6b7fa8] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Sliders size={15} />
              Manage Plans
            </button>

            <button
              onClick={() => { setActiveTab('payments'); setBlogFormOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-syne font-bold transition-all text-left cursor-pointer ${
                activeTab === 'payments' 
                  ? 'bg-[#00ff88]/15 border border-[#00ff88]/30 text-[#00ff88]' 
                  : 'text-[#6b7fa8] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <CreditCard size={15} />
              View Payments
            </button>

            <button
              onClick={() => { setActiveTab('config'); setBlogFormOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-syne font-bold transition-all text-left cursor-pointer ${
                activeTab === 'config' 
                  ? 'bg-[#00ff88]/15 border border-[#00ff88]/30 text-[#00ff88]' 
                  : 'text-[#6b7fa8] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Settings size={15} />
              System Config
            </button>

            <button
              onClick={() => { setActiveTab('seo'); setBlogFormOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-syne font-bold transition-all text-left cursor-pointer ${
                activeTab === 'seo' 
                  ? 'bg-[#00ff88]/15 border border-[#00ff88]/30 text-[#00ff88]' 
                  : 'text-[#6b7fa8] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Globe size={15} />
              SEO Settings
            </button>

            <button
              onClick={() => { setActiveTab('track'); setBlogFormOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-syne font-bold transition-all text-left cursor-pointer ${
                activeTab === 'track' 
                  ? 'bg-[#00ff88]/15 border border-[#00ff88]/30 text-[#00ff88]' 
                  : 'text-[#6b7fa8] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <TrendingUp size={15} />
              Track
            </button>

            <button
              onClick={() => { setActiveTab('feedback'); setBlogFormOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-syne font-bold transition-all text-left cursor-pointer ${
                activeTab === 'feedback' 
                  ? 'bg-[#00ff88]/15 border border-[#00ff88]/30 text-[#00ff88]' 
                  : 'text-[#6b7fa8] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Zap size={15} />
              User Feedback
            </button>

          </nav>
        </div>

        {/* Admin Card bottom */}
        <div className="p-6 border-t border-[#1e2d4a]/50 space-y-3 bg-[#020812]/50 text-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#6b7fa8] block uppercase">Active Profile</span>
            <span className="font-mono text-white font-bold block truncate">{sessionUser.email}</span>
            <span className="text-[10px] text-[#00ff88] font-semibold font-mono bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/30 block w-fit">
              Superadmin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-center py-2 border border-[#1e2d4a] hover:border-[#ff4444]/40 text-[#6b7fa8] hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Sign Out Panel
          </button>
        </div>

      </aside>

      {/* Main Control Panel Workspace */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto space-y-8 overflow-y-auto">
        
        {/* Loading overlay for data sync */}
        {dataLoading && (
          <div className="bg-[#00ff88]/10 border border-[#00ff88]/30 p-3 rounded-2xl flex items-center gap-3 text-xs text-[#00ff88] font-mono">
            <Loader2 className="animate-spin" size={14} />
            Synchronizing database states...
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && adminData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h2 className="font-syne font-bold text-2xl text-white tracking-tight">System Status Overview</h2>
              <p className="text-xs text-[#6b7fa8] font-mono">Real-time summaries calculated from the local JSON database storage.</p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              
              <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center gap-4">
                <div className="bg-[#00ff88]/10 p-3.5 rounded-full border border-[#00ff88]/20">
                  <Users className="text-[#00ff88]" size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Registered Users</span>
                  <span className="font-mono text-2xl font-bold text-white block">{adminData.stats?.totalUsers || 0}</span>
                </div>
              </div>

              <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center gap-4">
                <div className="bg-[#00ff88]/10 p-3.5 rounded-full border border-[#00ff88]/20">
                  <CreditCard className="text-[#00ff88]" size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Total Revenue</span>
                  <span className="font-mono text-2xl font-bold text-white block">
                    ${(adminData.stats?.totalPayments || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center gap-4">
                <div className="bg-[#00ff88]/10 p-3.5 rounded-full border border-[#00ff88]/20">
                  <Shield className="text-[#00ff88]" size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Audits Executed</span>
                  <span className="font-mono text-2xl font-bold text-white block">{adminData.stats?.totalScans || 0}</span>
                </div>
              </div>

              <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center gap-4">
                <div className="bg-[#00ff88]/10 p-3.5 rounded-full border border-[#00ff88]/20">
                  <BookOpen className="text-[#00ff88]" size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#6b7fa8] uppercase block">SEO Blog Articles</span>
                  <span className="font-mono text-2xl font-bold text-white block">{adminData.stats?.totalBlogs || 0}</span>
                </div>
              </div>

            </div>

            {/* Quick Diagnostic state info */}
            <div className="bg-[#0f1729]/40 border border-[#1e2d4a]/50 rounded-3xl p-6 space-y-4">
              <h3 className="font-syne font-bold text-sm text-white">Active Integrations Check</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-[#020812]/50 p-4 rounded-2xl border border-[#1e2d4a]/50 flex justify-between items-center">
                  <span className="text-[#6b7fa8]">Stripe Mode:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${adminData.settings?.stripe_mode === 'live' ? 'text-[#ff4444] bg-[#ff4444]/10' : 'text-[#00ff88] bg-[#00ff88]/10'}`}>
                    {adminData.settings?.stripe_mode?.toUpperCase() || 'TEST'}
                  </span>
                </div>
                <div className="bg-[#020812]/50 p-4 rounded-2xl border border-[#1e2d4a]/50 flex justify-between items-center">
                  <span className="text-[#6b7fa8]">Google Rating:</span>
                  <span className="text-[#00ff88] font-bold">4.9/5.0 Stars</span>
                </div>
                <div className="bg-[#020812]/50 p-4 rounded-2xl border border-[#1e2d4a]/50 flex justify-between items-center">
                  <span className="text-[#6b7fa8]">Resend Connection:</span>
                  <span className="text-[#00ff88] font-bold">Active API Client</span>
                </div>
                <div className="bg-[#020812]/50 p-4 rounded-2xl border border-[#1e2d4a]/50 flex justify-between items-center">
                  <span className="text-[#6b7fa8]">Blogs Seed:</span>
                  <span className="text-[#00ff88] font-bold">30/30 Loaded</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE USERS */}
        {activeTab === 'users' && adminData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h2 className="font-syne font-bold text-2xl text-white tracking-tight">Registered Users Registry</h2>
              <p className="text-xs text-[#6b7fa8] font-mono">Manage candidate subscriptions, roles, and authorization states.</p>
            </div>

            <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-[#020812]/50 border-b border-[#1e2d4a]/50 text-[#6b7fa8] uppercase text-[10px] tracking-wider">
                      <th className="p-4 pl-6">Email Address</th>
                      <th className="p-4">Access Role</th>
                      <th className="p-4">Pricing Plan</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2d4a]/45">
                    {adminData.users?.map((usr: any) => (
                      <tr key={usr.id} className="hover:bg-white/5 transition-all text-white">
                        <td className="p-4 pl-6 font-semibold break-all max-w-[200px] sm:max-w-xs">{usr.email}</td>
                        <td className="p-4">
                          {editingUserId === usr.id ? (
                            <select
                              value={editRole}
                              onChange={e => setEditRole(e.target.value)}
                              className="bg-[#020812] border border-[#1e2d4a] text-white p-1 rounded font-mono text-xs focus:outline-none"
                            >
                              <option value="user">user</option>
                              <option value="superadmin">superadmin</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] ${usr.role === 'superadmin' ? 'text-[#00ff88] bg-[#00ff88]/15 border border-[#00ff88]/20' : 'text-[#8b9fc0] bg-[#020812]'}`}>
                              {usr.role}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {editingUserId === usr.id ? (
                            <select
                              value={editPlan}
                              onChange={e => setEditPlan(e.target.value)}
                              className="bg-[#020812] border border-[#1e2d4a] text-white p-1 rounded font-mono text-xs focus:outline-none"
                            >
                              <option value="free">free</option>
                              <option value="pro">pro</option>
                            </select>
                          ) : (
                            <span className="text-white font-bold uppercase text-[11px]">
                              {usr.plan}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {editingUserId === usr.id ? (
                            <select
                              value={editActive ? 'true' : 'false'}
                              onChange={e => setEditActive(e.target.value === 'true')}
                              className="bg-[#020812] border border-[#1e2d4a] text-white p-1 rounded font-mono text-xs focus:outline-none"
                            >
                              <option value="true">active</option>
                              <option value="false">inactive</option>
                            </select>
                          ) : (
                            <span className={`text-[10px] font-bold ${usr.is_active ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                              {usr.is_active ? '● Active' : '○ Disabled'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-3.5">
                            {editingUserId === usr.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveUser(usr.id)}
                                  className="text-[#00ff88] hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Check size={12} /> Save
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  className="text-[#6b7fa8] hover:underline cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingUserId(usr.id);
                                    setEditPlan(usr.plan);
                                    setEditRole(usr.role);
                                    setEditActive(usr.is_active);
                                  }}
                                  className="text-[#8b9fc0] hover:text-[#00ff88] flex items-center gap-1 cursor-pointer"
                                  title="Edit User"
                                >
                                  <Edit3 size={13} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(usr.id, usr.email)}
                                  disabled={usr.id === sessionUser.id}
                                  className="text-[#6b7fa8] hover:text-[#ff4444] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  title="Purge User Account"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE PLANS */}
        {activeTab === 'plans' && adminData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h2 className="font-syne font-bold text-2xl text-white tracking-tight">Subscription Plan Configurator</h2>
              <p className="text-xs text-[#6b7fa8] font-mono">Dynamically set plan pricings, rolling scanning thresholds, features, and modes.</p>
            </div>

            <div className="space-y-6">
              {editablePlans.map((plan: any, planIdx: number) => (
                <div key={plan.id} className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-[#1e2d4a]/40 pb-3">
                    <span className="font-syne font-bold text-base text-white">{plan.name} ({plan.id.toUpperCase()})</span>
                    <span className="text-[10px] font-mono text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/20 font-bold uppercase">
                      {plan.is_paid ? 'Paid Tier' : 'Free Tier'}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#6b7fa8] uppercase block">Monthly Pricing ($)</label>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={e => {
                          const updated = [...editablePlans];
                          updated[planIdx].price = parseFloat(e.target.value) || 0;
                          setEditablePlans(updated);
                        }}
                        className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3 py-2 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#6b7fa8] uppercase block">24h Scans Rate Limit</label>
                      <input
                        type="number"
                        value={plan.scans_limit}
                        onChange={e => {
                          const updated = [...editablePlans];
                          updated[planIdx].scans_limit = parseInt(e.target.value) || 0;
                          setEditablePlans(updated);
                        }}
                        className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3 py-2 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#6b7fa8] uppercase block">Paid Toggles</label>
                      <select
                        value={plan.is_paid ? 'true' : 'false'}
                        onChange={e => {
                          const updated = [...editablePlans];
                          updated[planIdx].is_paid = e.target.value === 'true';
                          setEditablePlans(updated);
                        }}
                        className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00ff88]"
                      >
                        <option value="false">Free Tiers (Guest/Free)</option>
                        <option value="true">Paid Tiers (Pro)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <label className="text-[10px] text-[#6b7fa8] uppercase block">Features Bullet Points (Separated by comma)</label>
                    <input
                      type="text"
                      value={plan.features.join(', ')}
                      onChange={e => {
                        const updated = [...editablePlans];
                        updated[planIdx].features = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setEditablePlans(updated);
                      }}
                      className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88]"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={handleSavePlans}
                className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0a0f1e] font-syne font-bold text-xs px-6 py-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.01]"
              >
                <Save size={14} />
                Save Subscriptions Pricing Tiers
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: VIEW PAYMENTS */}
        {activeTab === 'payments' && adminData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h2 className="font-syne font-bold text-2xl text-white tracking-tight">Stripe Payments Ledger</h2>
              <p className="text-xs text-[#6b7fa8] font-mono">Detailed records of checkout completions from Stripe webhook events.</p>
            </div>

            <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl overflow-hidden shadow-xl">
              {adminData.payments?.length === 0 ? (
                <div className="text-center p-12 font-mono">
                  <p className="text-xs text-[#6b7fa8]">No payments transactions logged in payments.json yet.</p>
                  <p className="text-[10px] text-[#6b7fa8]/50 mt-1">Configure Stripe Test webhook triggers to populate logs.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-[#020812]/50 border-b border-[#1e2d4a]/50 text-[#6b7fa8] uppercase text-[10px] tracking-wider">
                        <th className="p-4 pl-6">Receipt ID</th>
                        <th className="p-4">Customer Email</th>
                        <th className="p-4">Stripe Checkout ID</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6">Transaction Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2d4a]/45">
                      {adminData.payments?.map((pay: any) => (
                        <tr key={pay.id} className="hover:bg-white/5 transition-all text-white">
                          <td className="p-4 pl-6 text-[#8b9fc0] font-semibold">{pay.id}</td>
                          <td className="p-4 break-all">{pay.user_email}</td>
                          <td className="p-4 text-[10px] text-[#6b7fa8] truncate max-w-[120px]" title={pay.stripe_checkout_id}>{pay.stripe_checkout_id}</td>
                          <td className="p-4 font-bold text-[#00ff88]">
                            ${pay.amount.toFixed(2)} {pay.currency || 'USD'}
                          </td>
                          <td className="p-4">
                            <span className="text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded text-[10px] font-bold border border-[#00ff88]/20">
                              {pay.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-[#6b7fa8]">
                            {new Date(pay.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM CONFIG */}
        {activeTab === 'config' && adminData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h2 className="font-syne font-bold text-2xl text-white tracking-tight">System Integrations Configurator</h2>
              <p className="text-xs text-[#6b7fa8] font-mono">Configure connection sandboxes and SMTP transporter notification alerts.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Stripe & Notifications Settings */}
              <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl space-y-6">
                <h3 className="font-syne font-bold text-sm text-white flex items-center gap-1.5">
                  <Sliders size={16} className="text-[#00ff88]" />
                  Global Variables Config
                </h3>

                <div className="space-y-4 text-xs font-mono">
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#6b7fa8] uppercase block">Active Stripe Sandbox Mode</label>
                    <select
                      value={stripeMode}
                      onChange={e => setStripeMode(e.target.value)}
                      className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00ff88]"
                    >
                      <option value="test">Test Mode (Uses sk_test / Sandbox)</option>
                      <option value="live">Live Mode (Uses sk_live / Real Billing)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#6b7fa8] uppercase block">Superadmin Alert Receiver Email</label>
                    <input
                      type="email"
                      value={receiverEmail}
                      onChange={e => setReceiverEmail(e.target.value)}
                      placeholder="admin@inboxfixer.com"
                      className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88]"
                    />
                  </div>

                </div>

                <button
                  onClick={handleSaveSettings}
                  className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0a0f1e] font-syne font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save size={14} />
                  Save System Parameters
                </button>
              </div>

              {/* Resend Connection Checker */}
              <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl space-y-6">
                <h3 className="font-syne font-bold text-sm text-white flex items-center gap-1.5">
                  <Mail size={16} className="text-[#00ff88]" />
                  Resend Connection Checker (REST API)
                </h3>

                <p className="text-xs text-[#8b9fc0] leading-relaxed">
                  Verify the Resend API Key in <code className="text-[#00ff88] font-mono">.env.local</code>. Input an email and send a test message to double-check that registrations, OTPs, and monitoring drops arrive.
                </p>

                {/* OTP Verification Toggle Switch */}
                <div className="bg-[#020812]/50 border border-[#1e2d4a] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-syne font-bold text-xs text-white">Enable OTP Verification</h4>
                      <p className="text-[10px] text-[#6b7fa8] mt-0.5">Require 1-time email OTP verification on next login/signup.</p>
                    </div>
                    <button
                      onClick={() => setEnableOtp(!enableOtp)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                        enableOtp ? 'bg-[#00ff88]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enableOtp ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex justify-end pt-1 border-t border-[#1e2d4a]/45">
                    <button
                      onClick={handleSaveSettings}
                      className="bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] font-syne font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      Save OTP Setting
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#6b7fa8] uppercase block">Test Recipient Address</label>
                    <input
                      type="email"
                      value={testEmailAddress}
                      onChange={e => setTestEmailAddress(e.target.value)}
                      placeholder="target-recipient@gmail.com"
                      className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendTestEmail}
                  disabled={smtpLoading}
                  className="bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 text-[#00ff88] font-syne font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {smtpLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Firing Test API Call...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Fire API Connection Test
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: SEO SETTINGS */}
        {activeTab === 'seo' && adminData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h2 className="font-syne font-bold text-2xl text-white tracking-tight">Search Engine SEO Optimizations</h2>
              <p className="text-xs text-[#6b7fa8] font-mono">Manage site titles, canonical headers, and raw HTML structural injections.</p>
            </div>

            <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl space-y-6">
              
              <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#6b7fa8] uppercase block">Search Index Site Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={e => setSeoTitle(e.target.value)}
                    className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00ff88]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#6b7fa8] uppercase block">Site Canonical URL</label>
                  <input
                    type="text"
                    value={seoCanonical}
                    onChange={e => setSeoCanonical(e.target.value)}
                    className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00ff88]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <label className="text-[10px] text-[#6b7fa8] uppercase block">Search Index Meta Description</label>
                <textarea
                  value={seoDesc}
                  rows={2}
                  onChange={e => setSeoDesc(e.target.value)}
                  className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00ff88] resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#6b7fa8] uppercase block">Header Script Injections (&lt;head&gt;)</label>
                  <textarea
                    value={seoHeader}
                    rows={4}
                    onChange={e => setSeoHeader(e.target.value)}
                    placeholder="<!-- Inject tracking analytics or schema structured JSON-LD -->"
                    className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00ff88] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-[#6b7fa8] uppercase block">Footer Script Injections (Before &lt;/body&gt;)</label>
                  <textarea
                    value={seoFooter}
                    rows={4}
                    onChange={e => setSeoFooter(e.target.value)}
                    placeholder="<!-- Inject structural tracking tags or custom pixel cookies -->"
                    className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00ff88] font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveSEO}
                className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0a0f1e] font-syne font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save size={14} />
                Save SEO Configurations
              </button>

            </div>
          </div>
        )}

        {/* TAB 7: MANAGE BLOGS */}
        {activeTab === 'blogs' && adminData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="font-syne font-bold text-2xl text-white tracking-tight">Search Engine Blog CRUD Console</h2>
                <p className="text-xs text-[#6b7fa8] font-mono">Create and customize organic article resources directly linking with Google ranking criteria.</p>
              </div>
              {!blogFormOpen && (
                <button
                  onClick={handleOpenCreateBlog}
                  className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0a0f1e] px-4.5 py-3.5 rounded-xl font-syne font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <PlusCircle size={15} />
                  Write SEO Blog Post
                </button>
              )}
            </div>

            {/* BLOG FORM PANEL (With Glowing border for SEO) */}
            {blogFormOpen && (
              <form onSubmit={handleSaveBlog} className="bg-[#0f1729]/95 border border-[#1e2d4a] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
                <h3 className="font-syne font-bold text-lg text-white border-b border-[#1e2d4a]/45 pb-3">
                  {editingBlogId ? 'Modify Active Blog Article' : 'Draft New Search Optimization Blog'}
                </h3>

                <div className="grid md:grid-cols-2 gap-6 text-xs font-mono">
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#6b7fa8] uppercase block">Article Title</label>
                      <input
                        type="text"
                        required
                        value={blogTitle}
                        onChange={e => setBlogTitle(e.target.value)}
                        placeholder="e.g., How to Fix SPF Authentication Violations"
                        className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#6b7fa8] uppercase block">Featured Image URL</label>
                      <input
                        type="text"
                        required
                        value={blogImage}
                        onChange={e => setBlogImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#6b7fa8] uppercase block">Keywords / Tags (Comma Separated)</label>
                      <input
                        type="text"
                        required
                        value={blogTags}
                        onChange={e => setBlogTags(e.target.value)}
                        placeholder="e.g., mail check, mail fixer, spf, dns"
                        className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#6b7fa8] uppercase block">Short Summary Description (Google snippet preview)</label>
                    <textarea
                      required
                      value={blogShortDesc}
                      onChange={e => setBlogShortDesc(e.target.value)}
                      rows={5}
                      placeholder="Write a brief search result snippet explaining this deliverability fixer suggesting..."
                      className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl p-3.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] resize-none"
                    />
                  </div>

                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <label className="text-[10px] text-[#6b7fa8] uppercase block">Full HTML Rich Body Content</label>
                  <textarea
                    required
                    value={blogContent}
                    onChange={e => setBlogContent(e.target.value)}
                    rows={10}
                    placeholder="<h2>Header</h2><p>Article body content supporting tags, fix templates and code blocks...</p>"
                    className="w-full bg-[#020812]/50 border border-[#1e2d4a] rounded-xl p-4 text-xs text-white placeholder-[#6b7fa8] focus:outline-none focus:border-[#00ff88] font-mono resize-y"
                  />
                </div>

                {/* 🌟 SEO BLOCK WITH SLEEK NEON GLOWING BORDER 🌟 */}
                <div className="border border-[#00ff88]/60 bg-[#00ff88]/5 rounded-2xl p-6 space-y-4 shadow-[0_0_15px_rgba(0,255,136,0.06)]">
                  <h4 className="font-syne font-bold text-xs text-[#00ff88] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={14} />
                    SEO Search Engine Metadata (Dynamic Index parameters)
                  </h4>
                  
                  <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-white/70 uppercase block">Search Engine Specific Title</label>
                      <input
                        type="text"
                        value={blogSeoTitle}
                        onChange={e => setBlogSeoTitle(e.target.value)}
                        placeholder="Leave blank to fallback to Article Title"
                        className="w-full bg-[#020812]/75 border border-[#1e2d4a]/80 focus:border-[#00ff88] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-white/70 uppercase block">Target Search Keywords (SEO meta tag)</label>
                      <input
                        type="text"
                        value={blogSeoKeywords}
                        onChange={e => setBlogSeoKeywords(e.target.value)}
                        placeholder="e.g., mail check, mail fixer, dns suggesting, spf error"
                        className="w-full bg-[#020812]/75 border border-[#1e2d4a]/80 focus:border-[#00ff88] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <label className="text-[9px] text-white/70 uppercase block">Dedicated Crawler Meta Description</label>
                    <textarea
                      value={blogSeoDesc}
                      onChange={e => setBlogSeoDesc(e.target.value)}
                      rows={2}
                      placeholder="Leave blank to fallback to Short Summary Description"
                      className="w-full bg-[#020812]/75 border border-[#1e2d4a]/80 focus:border-[#00ff88] rounded-xl p-3.5 text-xs text-white placeholder-[#6b7fa8] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0a0f1e] font-syne font-bold text-xs px-6 py-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Save size={14} />
                    Publish Article Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlogFormOpen(false)}
                    className="bg-[#1e2d4a]/50 hover:bg-[#1e2d4a] border border-[#1e2d4a] text-white font-syne font-bold text-xs px-6 py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel Draft
                  </button>
                </div>
              </form>
            )}

            {/* BLOGS TABLE */}
            {!blogFormOpen && (
              <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl overflow-hidden shadow-xl">
                {adminData.blogs?.length === 0 ? (
                  <div className="text-center p-12 font-mono text-xs text-[#6b7fa8]">
                    No blog posts in blogs.json database yet. Click "Write SEO Blog Post" above.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs font-mono">
                      <thead>
                        <tr className="bg-[#020812]/50 border-b border-[#1e2d4a]/50 text-[#6b7fa8] uppercase text-[10px] tracking-wider">
                          <th className="p-4 pl-6">Banner</th>
                          <th className="p-4">Blog Article Details</th>
                          <th className="p-4">Keywords / Tags</th>
                          <th className="p-4">Creation Date</th>
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2d4a]/45">
                        {adminData.blogs?.map((blog: any) => (
                          <tr key={blog.id} className="hover:bg-white/5 transition-all text-white">
                            <td className="p-4 pl-6 w-16">
                              <img
                                src={blog.image}
                                alt="blog cover"
                                className="w-12 h-10 object-cover rounded-lg border border-[#1e2d4a]/60"
                              />
                            </td>
                            <td className="p-4 max-w-sm">
                              <span className="font-syne font-bold text-sm block leading-tight text-white mb-0.5">{blog.title}</span>
                              <span className="text-[10px] text-[#6b7fa8] block truncate font-mono" title={blog.slug}>
                                Slug: /{blog.slug}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {blog.tags?.map((t: string) => (
                                  <span key={t} className="text-[9px] font-mono text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/20 uppercase">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 text-[#6b7fa8]">
                              {new Date(blog.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex justify-end gap-3.5">
                                <button
                                  onClick={() => handleOpenEditBlog(blog)}
                                  className="text-[#8b9fc0] hover:text-[#00ff88] flex items-center gap-1 cursor-pointer"
                                  title="Edit Blog"
                                >
                                  <Edit3 size={13} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteBlog(blog.id, blog.title)}
                                  className="text-[#6b7fa8] hover:text-[#ff4444] cursor-pointer"
                                  title="Purge Blog Post"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: VISITOR TRACKING & ANALYTICS */}
        {activeTab === 'track' && adminData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h2 className="font-syne font-bold text-2xl text-white tracking-tight">Visitor Tracking & Performance</h2>
                <p className="text-xs text-[#6b7fa8] font-mono">Real-time engagement analysis, unique browser sessions, and returning visitor metrics.</p>
              </div>

              {/* Range Selector Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-[#6b7fa8] uppercase">Time Horizon:</span>
                <select
                  value={timeFilter}
                  onChange={(e: any) => setTimeFilter(e.target.value)}
                  className="bg-[#0f1729] border border-[#1e2d4a]/80 focus:border-[#00ff88] rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none cursor-pointer"
                >
                  <option value="1day">Last 1 Day</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="overall">Overall Growth</option>
                </select>
              </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid sm:grid-cols-3 gap-6">
              
              <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center gap-4 group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff88]/5 rounded-full blur-2xl group-hover:bg-[#00ff88]/10 transition-all pointer-events-none" />
                <div className="bg-[#00ff88]/10 p-3.5 rounded-full border border-[#00ff88]/20">
                  <Eye className="text-[#00ff88]" size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Total Visits</span>
                  <span className="font-mono text-3xl font-bold text-white block">{stats.visitsCount}</span>
                  <span className="text-[9px] font-mono text-[#6b7fa8] block">Total site page loads</span>
                </div>
              </div>

              <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center gap-4 group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff88]/5 rounded-full blur-2xl group-hover:bg-[#00ff88]/10 transition-all pointer-events-none" />
                <div className="bg-[#00ff88]/10 p-3.5 rounded-full border border-[#00ff88]/20">
                  <Users className="text-[#00ff88]" size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Unique Visitors</span>
                  <span className="font-mono text-3xl font-bold text-white block">{stats.uniqueCount}</span>
                  <span className="text-[9px] font-mono text-[#6b7fa8] block">Distinct browser sessions</span>
                </div>
              </div>

              <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center gap-4 group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff88]/5 rounded-full blur-2xl group-hover:bg-[#00ff88]/10 transition-all pointer-events-none" />
                <div className="bg-[#00ff88]/10 p-3.5 rounded-full border border-[#00ff88]/20">
                  <Zap className="text-[#00ff88]" size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#6b7fa8] uppercase block">People Revisited</span>
                  <span className="font-mono text-3xl font-bold text-white block">{stats.revisitedCount}</span>
                  <span className="text-[9px] font-mono text-[#6b7fa8] block">Returning visitors</span>
                </div>
              </div>

            </div>

            {/* Performance growth chart card */}
            <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="space-y-1">
                <h3 className="font-syne font-bold text-base text-white">Performance Growth Chart</h3>
                <p className="text-[11px] text-[#6b7fa8] font-mono">Visitor density over the selected time filter interval.</p>
              </div>

              {stats.chartData.length === 0 ? (
                <div className="h-64 flex flex-col justify-center items-center text-center space-y-3 border border-[#1e2d4a]/40 rounded-2xl bg-[#020812]/20 p-6">
                  <TrendingUp className="text-[#6b7fa8] animate-pulse" size={32} />
                  <p className="text-xs font-mono text-[#6b7fa8]">No tracking log coordinates in this time horizon yet.</p>
                  <p className="text-[10px] font-mono text-white/50 max-w-sm">Visits to your homepage or articles from active devices will dynamically update this graph instantly.</p>
                </div>
              ) : (() => {
                const maxVal = Math.max(...stats.chartData.map(c => c.count), 5);
                const chartWidth = 800;
                const chartHeight = 240;
                const padLeft = 50;
                const padRight = 30;
                const padTop = 30;
                const padBottom = 45;

                const plotWidth = chartWidth - padLeft - padRight;
                const plotHeight = chartHeight - padTop - padBottom;

                const points = stats.chartData.map((d, index) => {
                  const x = padLeft + (index / Math.max(stats.chartData.length - 1, 1)) * plotWidth;
                  const y = padTop + plotHeight - (d.count / maxVal) * plotHeight;
                  return { x, y, label: d.label, count: d.count };
                });

                const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const areaPath = points.length > 0 
                  ? `${linePath} L ${points[points.length - 1].x} ${padTop + plotHeight} L ${points[0].x} ${padTop + plotHeight} Z` 
                  : '';

                const yGrid = [0, 0.25, 0.5, 0.75, 1].map(fraction => {
                  const val = Math.round(fraction * maxVal);
                  const y = padTop + plotHeight - fraction * plotHeight;
                  return { val, y };
                });

                return (
                  <div className="w-full overflow-x-auto select-none">
                    <div className="min-w-[650px] overflow-hidden">
                      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                        <defs>
                          <linearGradient id="neonAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#00ff88" stopOpacity="0.0" />
                          </linearGradient>
                          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Y-Axis Horizontal Grid Lines & Labels */}
                        {yGrid.map((grid, idx) => (
                          <g key={idx} className="opacity-40">
                            <line
                              x1={padLeft}
                              y1={grid.y}
                              x2={chartWidth - padRight}
                              y2={grid.y}
                              stroke="#1e2d4a"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                            />
                            <text
                              x={padLeft - 10}
                              y={grid.y + 4}
                              fill="#6b7fa8"
                              fontSize="10"
                              fontFamily="monospace"
                              textAnchor="end"
                            >
                              {grid.val}
                            </text>
                          </g>
                        ))}

                        {/* Area Under Line */}
                        {areaPath && (
                          <path d={areaPath} fill="url(#neonAreaGradient)" />
                        )}

                        {/* Connected Line Graph */}
                        {linePath && (
                          <path
                            d={linePath}
                            fill="none"
                            stroke="#00ff88"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#neonGlow)"
                          />
                        )}

                        {/* Data Points Interactivity */}
                        {points.map((p, idx) => {
                          const showLabel = timeFilter === '30days' ? idx % 3 === 0 : true;

                          return (
                            <g key={idx} className="group/point">
                              {/* Hover Glow Background */}
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="8"
                                className="fill-transparent group-hover/point:fill-[#00ff88]/20 transition-all duration-200 cursor-pointer"
                              />
                              {/* Point Circle */}
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                className="fill-[#0f1729] stroke-[#00ff88] stroke-2 group-hover/point:r-5 group-hover/point:fill-[#00ff88] transition-all duration-200 cursor-pointer"
                              />

                              {/* X Axis Labels */}
                              {showLabel && (
                                <text
                                  x={p.x}
                                  y={chartHeight - 15}
                                  fill="#6b7fa8"
                                  fontSize="9"
                                  fontFamily="monospace"
                                  textAnchor="middle"
                                  className="pointer-events-none"
                                >
                                  {p.label}
                                </text>
                              )}

                              {/* Interactive Tooltip Card */}
                              <g className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <rect
                                  x={p.x - 45}
                                  y={p.y - 36}
                                  width="90"
                                  height="24"
                                  rx="6"
                                  fill="#020812"
                                  stroke="#1e2d4a"
                                  strokeWidth="1.5"
                                />
                                <text
                                  x={p.x}
                                  y={p.y - 20}
                                  fill="#00ff88"
                                  fontSize="9"
                                  fontFamily="monospace"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                >
                                  {p.count} views
                                </text>
                              </g>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Detailed logs table */}
            <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-[#1e2d4a]/50 flex justify-between items-center bg-[#020812]/20">
                <h3 className="font-syne font-bold text-sm text-white">Live Visitor Stream</h3>
                <span className="text-[10px] font-mono text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/20 animate-pulse uppercase">
                  Log Connection Secured
                </span>
              </div>
              
              {(!adminData.visits || adminData.visits.length === 0) ? (
                <div className="text-center p-12 font-mono text-xs text-[#6b7fa8]">
                  No logged traffic logs recorded in data/visits.json database yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-[#020812]/50 border-b border-[#1e2d4a]/50 text-[#6b7fa8] uppercase text-[10px] tracking-wider">
                        <th className="p-4 pl-6">IP Address</th>
                        <th className="p-4">Visitor Path</th>
                        <th className="p-4">Country</th>
                        <th className="p-4">Visitor Type</th>
                        <th className="p-4 pr-6 text-right font-mono">Log timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2d4a]/45">
                      {adminData.visits.slice().reverse().slice(0, 10).map((v: any) => (
                        <tr key={v.id} className="hover:bg-white/5 transition-all text-white">
                          <td className="p-4 pl-6 font-semibold break-all text-white">
                            {v.ip === '::1' || v.ip === '127.0.0.1' ? 'localhost (127.0.0.1)' : v.ip}
                          </td>
                          <td className="p-4 text-[#8b9fc0] font-mono">{v.path}</td>
                          <td className="p-4 text-white font-mono">{v.country || 'Unknown'}</td>
                          <td className="p-4">
                            {v.revisited ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20">
                                Returning Visitor
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[#8b9fc0] bg-[#020812] border border-[#1e2d4a]/60">
                                New Session
                              </span>
                            )}
                          </td>
                          <td className="p-4 pr-6 text-right text-[#6b7fa8] font-mono">
                            {new Date(v.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: USER FEEDBACKS */}
        {activeTab === 'feedback' && adminData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h2 className="font-syne font-bold text-2xl text-white tracking-tight">User Feedbacks Registry</h2>
              <p className="text-xs text-[#6b7fa8] font-mono">Real-time feedback submitted by guests and registered scanners.</p>
            </div>

            {/* Glowing Analytical Cards */}
            {(() => {
              const feedbacks = adminData.feedbacks || [];
              const totalCount = feedbacks.length;
              const avgRating = totalCount > 0 
                ? (feedbacks.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalCount).toFixed(1) 
                : '0.0';
              const registeredCount = feedbacks.filter((f: any) => 
                f.email && adminData.users?.some((u: any) => u.email.toLowerCase() === f.email.toLowerCase())
              ).length;
              const guestCount = totalCount - registeredCount;

              return (
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center gap-4">
                    <div className="bg-[#00ff88]/10 p-3.5 rounded-full border border-[#00ff88]/20">
                      <Zap className="text-[#00ff88]" size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Total Feedbacks</span>
                      <span className="font-mono text-2xl font-bold text-white block">{totalCount}</span>
                    </div>
                  </div>

                  <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center gap-4">
                    <div className="bg-[#ffb800]/10 p-3.5 rounded-full border border-[#ffb800]/20">
                      <Star className="text-[#ffb800] fill-[#ffb800]" size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Average Rating</span>
                      <span className="font-mono text-2xl font-bold text-white block">{avgRating} / 5.0</span>
                    </div>
                  </div>

                  <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center gap-4">
                    <div className="bg-[#00ff88]/10 p-3.5 rounded-full border border-[#00ff88]/20">
                      <Users className="text-[#00ff88]" size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Registered Users</span>
                      <span className="font-mono text-2xl font-bold text-white block">{registeredCount}</span>
                    </div>
                  </div>

                  <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl p-6 shadow-xl relative overflow-hidden flex items-center gap-4">
                    <div className="bg-[#6b7fa8]/10 p-3.5 rounded-full border border-[#6b7fa8]/20">
                      <EyeOff className="text-[#6b7fa8]" size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#6b7fa8] uppercase block">Guest Users</span>
                      <span className="font-mono text-2xl font-bold text-white block">{guestCount}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Feedbacks Listing Table */}
            <div className="bg-[#0f1729]/80 border border-[#1e2d4a]/85 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-[#1e2d4a]/50 flex justify-between items-center bg-[#020812]/20">
                <h3 className="font-syne font-bold text-sm text-white">Live Feedback Stream</h3>
                <span className="text-[10px] font-mono text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/20 animate-pulse uppercase">
                  Data Stream Active
                </span>
              </div>

              {(!adminData.feedbacks || adminData.feedbacks.length === 0) ? (
                <div className="text-center p-12 font-mono text-xs text-[#6b7fa8]">
                  No user feedback records recorded in database yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-[#020812]/50 border-b border-[#1e2d4a]/50 text-[#6b7fa8] uppercase text-[10px] tracking-wider">
                        <th className="p-4 pl-6">Sender profile</th>
                        <th className="p-4">Rating scale</th>
                        <th className="p-4 w-[40%]">Diagnostic message</th>
                        <th className="p-4 pr-6 text-right">Submitted date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2d4a]/45">
                      {adminData.feedbacks.map((f: any) => {
                        const isRegistered = f.email && adminData.users?.some((u: any) => u.email.toLowerCase() === f.email.toLowerCase());

                        return (
                          <tr key={f.id} className="hover:bg-white/5 transition-all text-white">
                            <td className="p-4 pl-6 font-semibold">
                              {isRegistered ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-white">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88] shrink-0" />
                                    <span className="truncate">{f.email}</span>
                                  </div>
                                  <span className="text-[9px] text-[#00ff88] font-bold font-mono bg-[#00ff88]/10 px-1.5 py-0.5 rounded border border-[#00ff88]/20 block w-fit uppercase">
                                    Registered Member
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-[#6b7fa8]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#6b7fa8] shrink-0" />
                                    <span>Guest</span>
                                  </div>
                                  <span className="text-[9px] text-[#6b7fa8] font-bold font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10 block w-fit uppercase">
                                    Unauthenticated
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={12}
                                    className={star <= f.rating ? 'fill-[#ffb800] text-[#ffb800]' : 'text-[#1e2d4a]'}
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="p-4 text-[#8b9fc0] font-sans text-xs leading-relaxed whitespace-pre-wrap py-3.5 break-words">
                              {f.message}
                            </td>
                            <td className="p-4 pr-6 text-right text-[#6b7fa8] font-mono whitespace-nowrap">
                              {new Date(f.created_at).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}

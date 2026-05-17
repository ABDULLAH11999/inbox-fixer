import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { 
  getUsers, writeUsers, 
  getPlans, writePlans, 
  getPayments, 
  getSettings, writeSettings, 
  getScans,
  getBlogs, writeBlogs,
  getVisits,
  getFeedbacks
} from '@/lib/db';
import { sendEmail } from '@/lib/mail';
import { updateStaticSitemap } from '@/lib/sitemap';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized. Admin logins required.' }, { status: 403 });
    }

    const users = getUsers().map(u => ({ id: u.id, email: u.email, role: u.role, plan: u.plan, is_active: u.is_active, created_at: u.created_at }));
    const plans = getPlans();
    const payments = getPayments().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const settings = getSettings();
    const scansCount = getScans().length;
    const blogs = getBlogs().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const visits = getVisits();
    const feedbacks = getFeedbacks().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalPayments: payments.reduce((acc, curr) => acc + curr.amount, 0),
        totalScans: scansCount,
        totalBlogs: blogs.length
      },
      users,
      plans,
      payments,
      settings,
      blogs,
      visits,
      feedbacks
    });

  } catch (err: any) {
    console.error('Admin GET route error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required.' }, { status: 400 });
    }

    // --- USER CRUD ---
    if (action === 'updateUser') {
      const { userId, plan, role, is_active } = body;
      const users = getUsers();
      const userIdx = users.findIndex(u => u.id === userId);

      if (userIdx === -1) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      }

      if (userId === session.id && (role !== 'superadmin' || !is_active)) {
        return NextResponse.json({ error: 'You cannot demote or deactivate your own admin profile.' }, { status: 400 });
      }

      users[userIdx].plan = plan || users[userIdx].plan;
      users[userIdx].role = role || users[userIdx].role;
      users[userIdx].is_active = is_active !== undefined ? is_active : users[userIdx].is_active;

      writeUsers(users);
      return NextResponse.json({ success: true, message: 'User updated successfully.' });
    }

    if (action === 'deleteUser') {
      const { userId } = body;
      
      if (userId === session.id) {
        return NextResponse.json({ error: 'You cannot delete your own admin account.' }, { status: 400 });
      }

      const users = getUsers();
      const filtered = users.filter(u => u.id !== userId);
      writeUsers(filtered);
      return NextResponse.json({ success: true, message: 'User deleted successfully.' });
    }

    // --- PLANS CRUD ---
    if (action === 'updatePlans') {
      const { plans } = body;
      if (!Array.isArray(plans)) {
        return NextResponse.json({ error: 'Plans array is required.' }, { status: 400 });
      }

      writePlans(plans);
      return NextResponse.json({ success: true, message: 'Plans configuration updated successfully.' });
    }

    // --- CONFIG CRUD ---
    if (action === 'updateSettings') {
      const { stripe_mode, smtp_receiver_email, enable_otp } = body;
      const settings = getSettings();

      settings.stripe_mode = stripe_mode || settings.stripe_mode;
      settings.smtp_receiver_email = smtp_receiver_email || settings.smtp_receiver_email;
      settings.enable_otp = enable_otp !== undefined ? !!enable_otp : settings.enable_otp;

      writeSettings(settings);
      return NextResponse.json({ success: true, message: 'System configuration saved successfully.' });
    }

    if (action === 'sendTestEmail') {
      const { testRecipient } = body;
      if (!testRecipient) {
        return NextResponse.json({ error: 'Recipient email is required for the Resend test check.' }, { status: 400 });
      }

      await sendEmail({
        to: testRecipient,
        subject: '🚀 InboxFixer Resend API Connection Successful!',
        html: `
          <div style="font-family: sans-serif; padding: 25px; background: #0a0f1e; color: #ffffff; max-width: 500px; margin: 0 auto; border-radius: 12px; border: 1px solid #00ff88;">
            <h2 style="color: #00ff88; font-size: 22px; text-align: center;">Resend API Connection Active!</h2>
            <p>Hello,</p>
            <p>This is an automated delivery test email sent from the **InboxFixer Admin Control Panel**.</p>
            <p>If you are reading this email, it means your Resend API Key is **100% correctly configured** and fully operational on your Render hosting environment.</p>
          </div>
        `
      });

      return NextResponse.json({ success: true, message: `Test email successfully fired to ${testRecipient} via Resend.` });
    }

    // --- GLOBAL SEO CRUD ---
    if (action === 'updateSEO') {
      const { site_title, site_desc, canonical_url, header_tags, footer_tags } = body;
      const settings = getSettings();

      settings.seo = {
        site_title: site_title !== undefined ? site_title : settings.seo.site_title,
        site_desc: site_desc !== undefined ? site_desc : settings.seo.site_desc,
        canonical_url: canonical_url !== undefined ? canonical_url : settings.seo.canonical_url,
        header_tags: header_tags !== undefined ? header_tags : settings.seo.header_tags,
        footer_tags: footer_tags !== undefined ? footer_tags : settings.seo.footer_tags,
      };

      writeSettings(settings);
      return NextResponse.json({ success: true, message: 'SEO configuration updated successfully.' });
    }

    // --- BLOG CRUD ---
    if (action === 'createBlog') {
      const { title, short_desc, content, image, tags, seo_title, seo_desc, seo_keywords } = body;

      if (!title || !short_desc || !content) {
        return NextResponse.json({ error: 'Title, Short Description, and Content are required.' }, { status: 400 });
      }

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const blogs = getBlogs();

      // Ensure slug uniqueness
      let uniqueSlug = slug;
      let counter = 1;
      while (blogs.some(b => b.slug === uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      const newBlog = {
        id: `blog-${Date.now()}`,
        slug: uniqueSlug,
        title,
        short_desc,
        content,
        image: image || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop',
        tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : ['general'],
        seo_title: seo_title || title,
        seo_desc: seo_desc || short_desc,
        seo_keywords: seo_keywords || (Array.isArray(tags) ? tags.join(', ') : tags || 'email, deliverability'),
        created_at: new Date().toISOString()
      };

      blogs.push(newBlog);
      writeBlogs(blogs);
      updateStaticSitemap();

      return NextResponse.json({ success: true, message: 'Blog post created successfully.', blog: newBlog });
    }

    if (action === 'updateBlog') {
      const { blogId, title, short_desc, content, image, tags, seo_title, seo_desc, seo_keywords } = body;

      if (!blogId || !title || !short_desc || !content) {
        return NextResponse.json({ error: 'Blog ID, Title, Short Description, and Content are required.' }, { status: 400 });
      }

      const blogs = getBlogs();
      const idx = blogs.findIndex(b => b.id === blogId);

      if (idx === -1) {
        return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });
      }

      // Re-evaluate slug if title changed
      let uniqueSlug = blogs[idx].slug;
      if (blogs[idx].title !== title) {
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        
        uniqueSlug = slug;
        let counter = 1;
        while (blogs.some(b => b.slug === uniqueSlug && b.id !== blogId)) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }
      }

      blogs[idx].title = title;
      blogs[idx].slug = uniqueSlug;
      blogs[idx].short_desc = short_desc;
      blogs[idx].content = content;
      blogs[idx].image = image || blogs[idx].image;
      blogs[idx].tags = Array.isArray(tags) ? tags : tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : blogs[idx].tags;
      blogs[idx].seo_title = seo_title || title;
      blogs[idx].seo_desc = seo_desc || short_desc;
      blogs[idx].seo_keywords = seo_keywords || (Array.isArray(tags) ? tags.join(', ') : tags || '');

      writeBlogs(blogs);
      updateStaticSitemap();
      return NextResponse.json({ success: true, message: 'Blog post updated successfully.', blog: blogs[idx] });
    }

    if (action === 'deleteBlog') {
      const { blogId } = body;

      if (!blogId) {
        return NextResponse.json({ error: 'Blog ID is required.' }, { status: 400 });
      }

      const blogs = getBlogs();
      const filtered = blogs.filter(b => b.id !== blogId);

      if (blogs.length === filtered.length) {
        return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });
      }

      writeBlogs(filtered);
      updateStaticSitemap();
      return NextResponse.json({ success: true, message: 'Blog post deleted successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });

  } catch (err: any) {
    console.error('Admin POST route error:', err);
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}

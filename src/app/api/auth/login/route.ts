import { NextRequest, NextResponse } from 'next/server';
import { getUsers, getOTPs, writeOTPs, getSettings } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { sendEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const users = getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'Invalid email or password. Please try again.' }, { status: 401 });
    }

    const settings = getSettings();
    const enableOtp = settings.enable_otp !== false;

    // Check if OTP is enabled and user is not verified yet (only require for standard users, not admin/superadmin)
    const isAdmin = user.role === 'superadmin' || user.role === 'admin';
    if (enableOtp && !user.otp_verified && !isAdmin) {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

      // Save OTP to DB
      const otps = getOTPs();
      const filteredOtps = otps.filter(o => o.email.toLowerCase() !== email.toLowerCase());
      filteredOtps.push({
        email: email.toLowerCase(),
        password: user.password,
        otp,
        expires_at: expiresAt
      });
      writeOTPs(filteredOtps);

      // Send OTP code via email
      try {
        await sendEmail({
          to: user.email,
          subject: '🔑 Your InboxFixer Login Verification Code (OTP)',
          html: `
            <div style="font-family: sans-serif; padding: 20px; background: #0a0f1e; color: #ffffff; max-width: 500px; margin: 0 auto; border-radius: 12px; border: 1px solid #1e2d4a;">
              <h2 style="color: #00ff88; text-align: center; font-size: 24px; margin-bottom: 20px;">InboxFixer Login Security</h2>
              <p>Hello,</p>
              <p>To access your diagnostic history, email verification is required for this login attempt. Please use the following 6-digit verification code:</p>
              <div style="background: #0f1729; border: 1px solid #1e2d4a; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #00ff88; font-family: monospace;">${otp}</span>
              </div>
              <p style="color: #6b7fa8; font-size: 12px;">This code is highly sensitive and will expire in 15 minutes. Please do not share it with anyone.</p>
              <hr style="border-color: #1e2d4a; margin-top: 30px;" />
              <p style="font-size: 11px; color: #6b7fa8; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} InboxFixer. Keeping you out of the spam filter.</p>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('Failed to send login OTP email:', mailErr);
      }

      return NextResponse.json({
        success: true,
        otp_required: true,
        email: user.email
      });
    }

    // Set local session cookie
    await setSession(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan
      }
    });

  } catch (err: any) {
    console.error('Login API Error:', err);
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
}

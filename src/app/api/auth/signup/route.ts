import { NextRequest, NextResponse } from 'next/server';
import { getUsers, writeUsers, getOTPs, writeOTPs, getSettings } from '@/lib/db';
import { sendEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if email already registered and active
    const users = getUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser && existingUser.is_active) {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 400 });
    }

    const settings = getSettings();
    const enableOtp = settings.enable_otp !== false;

    if (!enableOtp) {
      // Direct registration bypassing OTP
      const newUserId = 'usr_' + Math.random().toString(36).substring(2, 11);
      const newUser = {
        id: newUserId,
        email: email.toLowerCase(),
        password,
        role: 'user',
        plan: 'free',
        is_active: true,
        otp_verified: false, // Will ask on next login if admin enables it later
        created_at: new Date().toISOString()
      };

      const filteredUsers = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
      filteredUsers.push(newUser);
      writeUsers(filteredUsers);

      // Trigger local session
      const { setSession } = await import('@/lib/auth');
      await setSession(newUser);

      // Send standard welcome email
      try {
        await sendEmail({
          to: email.toLowerCase(),
          subject: '🚀 Welcome to InboxFixer! Account Activated',
          html: `
            <div style="font-family: sans-serif; padding: 20px; background: #0a0f1e; color: #ffffff; max-width: 500px; margin: 0 auto; border-radius: 12px; border: 1px solid #1e2d4a;">
              <h2 style="color: #00ff88; text-align: center; font-size: 22px;">Welcome to InboxFixer!</h2>
              <p>Hello,</p>
              <p>Your account has been successfully created! You now have access to your dashboard where you can log in, audit domains, and check your scan histories.</p>
              <div style="background: #0f1729; border: 1px solid #1e2d4a; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
                <p style="margin: 0 0 5px 0;"><strong>Account details:</strong></p>
                <p style="margin: 0; color: #6b7fa8;">Email: <span style="color: #ffffff; font-family: monospace;">${email}</span></p>
                <p style="margin: 5px 0 0 0; color: #6b7fa8;">Plan: <span style="color: #00ff88; font-weight: bold; text-transform: uppercase;">Free (10 Scans/day)</span></p>
              </div>
              <p>Ready to secure your business emails? Run a diagnostic check right now from your control panel.</p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: #00ff88; color: #0a0f1e; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 14px;">Log In to Dashboard</a>
              </div>
              <hr style="border-color: #1e2d4a; margin-top: 30px;" />
              <p style="font-size: 11px; color: #6b7fa8; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} InboxFixer. Keeping you out of the spam filter.</p>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('Failed to send welcome email:', mailErr);
      }

      // Notify Admin
      const adminAlertRecipient = settings.smtp_receiver_email || 'admin@inboxfixer.com';
      try {
        await sendEmail({
          to: adminAlertRecipient,
          subject: '🆕 Notification: New User Registered on InboxFixer',
          html: `
            <div style="font-family: sans-serif; padding: 20px; background: #0a0f1e; color: #ffffff; max-width: 500px; margin: 0 auto; border-radius: 12px; border: 1px solid #1e2d4a;">
              <h2 style="color: #00ff88; font-size: 20px;">New User Signup</h2>
              <p>Hello Superadmin,</p>
              <p>A new user has registered a standard free plan on InboxFixer (OTP verification was disabled by settings during this signup).</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; background: #0f1729; border: 1px solid #1e2d4a; border-radius: 8px;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #1e2d4a; color: #6b7fa8;">User ID:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #1e2d4a; font-family: monospace;">${newUserId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #1e2d4a; color: #6b7fa8;">Email Address:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #1e2d4a; font-weight: bold; font-family: monospace;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #6b7fa8;">Registered At:</td>
                  <td style="padding: 10px;">${newUser.created_at}</td>
                </tr>
              </table>
            </div>
          `
        });
      } catch (adminMailErr) {
        console.error('Failed to send admin signup notification email:', adminMailErr);
      }

      return NextResponse.json({
        success: true,
        otp_sent: false,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          plan: newUser.plan
        }
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    // Save/Update OTP in DB
    const otps = getOTPs();
    const filteredOtps = otps.filter(o => o.email.toLowerCase() !== email.toLowerCase());
    filteredOtps.push({
      email: email.toLowerCase(),
      password, // Save candidate password to write to users on verification
      otp,
      expires_at: expiresAt
    });
    writeOTPs(filteredOtps);

    await sendEmail({
      to: email,
      subject: '🔑 Your InboxFixer Verification Code (OTP)',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #0a0f1e; color: #ffffff; max-width: 500px; margin: 0 auto; border-radius: 12px; border: 1px solid #1e2d4a;">
          <h2 style="color: #00ff88; text-align: center; font-size: 24px; margin-bottom: 20px;">InboxFixer Verification</h2>
          <p>Hello,</p>
          <p>Thank you for choosing InboxFixer to protect your business email reputation. Please use the following 6-digit verification code to complete your registration:</p>
          <div style="background: #0f1729; border: 1px solid #1e2d4a; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #00ff88; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #6b7fa8; font-size: 12px;">This code is highly sensitive and will expire in 15 minutes. Please do not share it with anyone.</p>
          <hr style="border-color: #1e2d4a; margin-top: 30px;" />
          <p style="font-size: 11px; color: #6b7fa8; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} InboxFixer. Keeping you out of the spam filter.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: 'OTP sent to email successfully.' });
  } catch (err: any) {
    console.error('Signup API Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to complete registration' }, { status: 500 });
  }
}

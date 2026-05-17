import { NextRequest, NextResponse } from 'next/server';
import { getUsers, writeUsers, getOTPs, writeOTPs, getSettings } from '@/lib/db';
import { sendEmail } from '@/lib/mail';
import { setSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP code are required' }, { status: 400 });
    }

    const otps = getOTPs();
    const recordIndex = otps.findIndex(
      o => o.email.toLowerCase() === email.toLowerCase() && o.otp === otp.trim()
    );

    if (recordIndex === -1) {
      return NextResponse.json({ error: 'Invalid verification code. Please check and try again.' }, { status: 400 });
    }

    const record = otps[recordIndex];

    // Check if expired
    if (new Date() > new Date(record.expires_at)) {
      return NextResponse.json({ error: 'Verification code has expired. Please sign up again.' }, { status: 400 });
    }

    // OTP is valid! Register user
    const users = getUsers();
    const newUserId = 'usr_' + Math.random().toString(36).substring(2, 11);
    const newUser = {
      id: newUserId,
      email: email.toLowerCase(),
      password: record.password,
      role: 'user',
      plan: 'free',
      is_active: true,
      created_at: new Date().toISOString()
    };

    // Remove any inactive accounts with same email, then insert
    const filteredUsers = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    filteredUsers.push(newUser);
    writeUsers(filteredUsers);

    // Remove verified OTP record
    const remainingOtps = otps.filter((_, idx) => idx !== recordIndex);
    writeOTPs(remainingOtps);

    // Trigger local session
    await setSession(newUser);

    // Fetch config receiver email for Superadmin alerts
    const settings = getSettings();
    const adminAlertRecipient = settings.smtp_receiver_email || 'admin@inboxfixer.com';

    // 1. Send Welcome email to User via SMTP
    try {
      await sendEmail({
        to: email.toLowerCase(),
        subject: '🚀 Welcome to InboxFixer! Account Activated',
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #0a0f1e; color: #ffffff; max-width: 500px; margin: 0 auto; border-radius: 12px; border: 1px solid #1e2d4a;">
            <h2 style="color: #00ff88; text-align: center; font-size: 22px;">Welcome to InboxFixer!</h2>
            <p>Hello,</p>
            <p>Your account has been successfully verified and activated! You now have access to your dashboard where you can log in, audit domains, and check your scan histories.</p>
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
      console.error('Failed to send welcome email to user:', mailErr);
    }

    // 2. Send Alert email to Superadmin
    try {
      await sendEmail({
        to: adminAlertRecipient,
        subject: '🆕 Notification: New User Registered on InboxFixer',
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #0a0f1e; color: #ffffff; max-width: 500px; margin: 0 auto; border-radius: 12px; border: 1px solid #1e2d4a;">
            <h2 style="color: #00ff88; font-size: 20px;">New User Signup</h2>
            <p>Hello Superadmin,</p>
            <p>A new user has successfully verified their email address and registered a standard free plan on InboxFixer.</p>
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
            <p style="font-size: 13px; color: #6b7fa8;">Log in to the Admin Control Panel to manage this user's subscription or monitor payments.</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" style="display: inline-block; background: #00ff88; color: #0a0f1e; padding: 10px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 13px;">Manage Users in Admin Panel</a>
            </div>
          </div>
        `
      });
    } catch (adminMailErr) {
      console.error('Failed to send admin notification email:', adminMailErr);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        plan: newUser.plan
      }
    });

  } catch (err: any) {
    console.error('Verify OTP API Error:', err);
    return NextResponse.json({ error: err.message || 'OTP verification failed' }, { status: 500 });
  }
}

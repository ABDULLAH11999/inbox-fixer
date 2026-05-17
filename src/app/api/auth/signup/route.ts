import { NextRequest, NextResponse } from 'next/server';
import { getUsers, getOTPs, writeOTPs } from '@/lib/db';
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

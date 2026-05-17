import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '@/lib/db';
import { setSession } from '@/lib/auth';

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

import { cookies } from 'next/headers';
import { getUsers } from './db';

export interface SessionUser {
  id: string;
  email: string;
  role: 'superadmin' | 'user';
  plan: 'free' | 'pro';
}

// Secret-free local secure cookie session helpers
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('inboxfixer_session');

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    // Decode session payload
    const decoded = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    
    // Validate that user still exists in the local database
    const users = getUsers();
    const user = users.find(u => u.id === decoded.id && u.email === decoded.email);

    if (!user || !user.is_active) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan
    };
  } catch (err) {
    return null;
  }
}

export async function setSession(user: any): Promise<void> {
  const cookieStore = await cookies();
  const sessionPayload: SessionUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    plan: user.plan
  };

  const base64Value = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');

  cookieStore.set('inboxfixer_session', base64Value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('inboxfixer_session');
}

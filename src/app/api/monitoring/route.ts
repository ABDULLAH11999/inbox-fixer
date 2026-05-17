import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getMonitoring, writeMonitoring } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    if (session.plan !== 'pro') {
      return NextResponse.json({ error: 'Pro plan required for domain monitoring.' }, { status: 403 });
    }

    const allMonitoring = getMonitoring();
    const userMonitoring = allMonitoring.filter(m => m.user_id === session.id);

    return NextResponse.json(userMonitoring);
  } catch (error: any) {
    console.error('Monitoring GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    if (session.plan !== 'pro') {
      return NextResponse.json({ error: 'Pro plan required to monitor domains.' }, { status: 403 });
    }

    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Clean domain
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .trim();

    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
    }

    const allMonitoring = getMonitoring();
    const existing = allMonitoring.find(m => m.user_id === session.id && m.domain === cleanDomain);

    if (existing) {
      return NextResponse.json({ error: 'This domain is already being monitored.' }, { status: 400 });
    }

    const newMonitoring = {
      id: 'mon_' + Math.random().toString(36).substring(2, 11),
      user_id: session.id,
      domain: cleanDomain,
      is_active: true,
      last_checked_at: null,
      last_score: null,
      alert_on_change: true,
      created_at: new Date().toISOString()
    };

    allMonitoring.push(newMonitoring);
    writeMonitoring(allMonitoring);

    return NextResponse.json(newMonitoring);
  } catch (error: any) {
    console.error('Monitoring POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Monitoring entry ID is required.' }, { status: 400 });
    }

    const allMonitoring = getMonitoring();
    const filtered = allMonitoring.filter(m => !(m.id === id && m.user_id === session.id));

    writeMonitoring(filtered);

    return NextResponse.json({ success: true, message: 'Monitoring removed successfully.' });
  } catch (error: any) {
    console.error('Monitoring DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

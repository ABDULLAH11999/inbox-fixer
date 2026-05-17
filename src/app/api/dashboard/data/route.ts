import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getScans, writeScans, getMonitoring, getUsers } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    // Fetch scans
    const allScans = getScans();
    const userScans = allScans
      .filter(s => s.user_id === session.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const users = getUsers();
    const dbUser = users.find(u => u.id === session.id);
    const activePlan = dbUser?.plan || 'free';

    // Fetch monitored domains if Pro
    let userMonitoring: any[] = [];
    if (activePlan === 'pro') {
      const allMonitoring = getMonitoring();
      userMonitoring = allMonitoring.filter(m => m.user_id === session.id);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.id,
        email: session.email,
        role: session.role
      },
      profile: {
        plan: activePlan,
        card_last4: dbUser?.card_last4 || null,
        card_brand: dbUser?.card_brand || null
      },
      scans: userScans,
      monitoring: userMonitoring
    });

  } catch (err: any) {
    console.error('Dashboard data fetch error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scanId = searchParams.get('id');

    if (!scanId) {
      return NextResponse.json({ error: 'Scan ID is required.' }, { status: 400 });
    }

    const allScans = getScans();
    const filtered = allScans.filter(s => !(s.id === scanId && s.user_id === session.id));

    writeScans(filtered);

    return NextResponse.json({ success: true, message: 'Scan record deleted successfully.' });
  } catch (error: any) {
    console.error('Dashboard scan delete error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

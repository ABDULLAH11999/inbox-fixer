import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    // Verify Pro plan status from custom cookie session
    if (session.plan !== 'pro') {
      return NextResponse.json({ 
        error: 'Pro Feature Required', 
        message: 'PDF report exporting is exclusive to Pro users. Please upgrade your plan.' 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'PDF generation authorized'
    });
  } catch (error: any) {
    console.error('PDF Authorization error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

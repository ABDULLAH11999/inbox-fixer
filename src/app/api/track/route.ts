import { NextRequest, NextResponse } from 'next/server';
import { getVisits, writeVisits } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { path, visitorId } = await req.json();

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor identity token is required' }, { status: 400 });
    }

    const visits = getVisits();
    
    // Check if this visitor ID has been seen in our records before
    const hasVisitedBefore = visits.some((v: any) => v.visitor_id === visitorId);

    const newVisit = {
      id: 'vst_' + Math.random().toString(36).substring(2, 11),
      visitor_id: visitorId,
      ip: req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1',
      path: path || '/',
      revisited: hasVisitedBefore,
      created_at: new Date().toISOString(),
    };

    visits.push(newVisit);
    writeVisits(visits);

    return NextResponse.json({ success: true, revisited: hasVisitedBefore });
  } catch (error: any) {
    console.error('Tracking API error:', error);
    return NextResponse.json({ error: 'Failed to record tracking metrics' }, { status: 500 });
  }
}

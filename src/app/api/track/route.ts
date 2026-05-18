import { NextRequest, NextResponse } from 'next/server';
import { getVisits, writeVisits } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = body.path || '/';

    // 1. Resolve client IP address
    const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                  req.headers.get('x-real-ip') || 
                  '127.0.0.1';

    // 2. Resolve browser User-Agent header
    const userAgent = req.headers.get('user-agent') || '';

    // 3. Create a unique, persistent signature based on device connection to lock incognito count resets
    const visitorId = 'sig_' + Buffer.from(`${rawIp}-${userAgent}`).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 24);

    // 4. Resolve country via ultra-fast public IP geolocation (1s timeout fail-safe)
    let country = 'Localhost';
    if (rawIp !== '::1' && rawIp !== '127.0.0.1' && !rawIp.startsWith('127.') && !rawIp.startsWith('192.168.')) {
      try {
        const geoRes = await fetch(`https://freeipapi.com/api/json/${rawIp}`, { signal: AbortSignal.timeout(1000) });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          country = geoData.countryName || 'Unknown';
        }
      } catch (geoErr) {
        console.error('Geolocation lookup failed during track request:', geoErr);
        country = 'Unknown';
      }
    }

    const visits = getVisits();
    
    // Check if this unique signature was logged in database before
    const hasVisitedBefore = visits.some((v: any) => v.visitor_id === visitorId);

    const newVisit = {
      id: 'vst_' + Math.random().toString(36).substring(2, 11),
      visitor_id: visitorId,
      ip: rawIp,
      path: path,
      country: country,
      revisited: hasVisitedBefore,
      created_at: new Date().toISOString(),
    };

    visits.push(newVisit);
    writeVisits(visits);

    return NextResponse.json({ success: true, revisited: hasVisitedBefore, visitorId });
  } catch (error: any) {
    console.error('Tracking API error:', error);
    return NextResponse.json({ error: 'Failed to record tracking metrics' }, { status: 500 });
  }
}

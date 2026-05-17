import { NextRequest, NextResponse } from 'next/server';
import { calculateScore } from '@/lib/scorer';

export async function POST(req: NextRequest) {
  try {
    const { checks } = await req.json();
    if (!checks) {
      return NextResponse.json({ error: 'Checks data is required' }, { status: 400 });
    }
    const result = calculateScore(checks);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to calculate score' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { getPlans } from '@/lib/db';

type PublicPlan = {
  id: string;
  enabled?: boolean;
  [key: string]: unknown;
};

export async function GET() {
  try {
    const plans = getPlans().filter((plan: PublicPlan) => plan.enabled !== false);
    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    console.error('Public plans fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load plans' },
      { status: 500 }
    );
  }
}

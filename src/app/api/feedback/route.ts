import { NextRequest, NextResponse } from 'next/server';
import { getFeedbacks, writeFeedbacks } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { rating, message, email } = await req.json();

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be a number between 1 and 5' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ error: 'Feedback message cannot be empty' }, { status: 400 });
    }

    const feedbacks = getFeedbacks();
    const newFeedback = {
      id: 'fdb_' + Math.random().toString(36).substring(2, 11),
      rating,
      message: message.trim(),
      email: email && typeof email === 'string' && email.includes('@') ? email.trim() : null,
      created_at: new Date().toISOString()
    };

    feedbacks.push(newFeedback);
    writeFeedbacks(feedbacks);

    return NextResponse.json({ success: true, feedback: newFeedback });
  } catch (error: any) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ error: 'Failed to record user feedback' }, { status: 500 });
  }
}

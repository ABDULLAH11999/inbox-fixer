import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUsers, writeUsers } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { cardLast4, cardBrand } = body;

    if (!cardLast4 || cardLast4.length !== 4) {
      return NextResponse.json({ error: 'Valid 4-digit card number is required.' }, { status: 400 });
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === session.id);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
    }

    // Link card and upgrade user to pro
    users[userIndex].plan = 'pro';
    users[userIndex].card_last4 = cardLast4;
    users[userIndex].card_brand = cardBrand || 'visa';
    writeUsers(users);

    return NextResponse.json({ 
      success: true, 
      message: 'Card linked successfully. Pro Subscription activated.',
      profile: {
        plan: 'pro',
        card_last4: cardLast4,
        card_brand: cardBrand || 'visa'
      }
    });

  } catch (error: any) {
    console.error('Billing card link error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === session.id);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
    }

    // Remove card details and immediately downgrade to free
    users[userIndex].plan = 'free';
    users[userIndex].card_last4 = null;
    users[userIndex].card_brand = null;
    writeUsers(users);

    return NextResponse.json({ 
      success: true, 
      message: 'Card removed successfully. Pro subscription cancelled.',
      profile: {
        plan: 'free',
        card_last4: null,
        card_brand: null
      }
    });

  } catch (error: any) {
    console.error('Billing card removal error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

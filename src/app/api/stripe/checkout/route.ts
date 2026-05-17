import { NextRequest, NextResponse } from 'next/server';
import { getStripeInstance } from '@/lib/stripe';
import { getSession } from '@/lib/auth';
import { getSettings } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Not authenticated. Please log in first.' }, { status: 401 });
    }

    const settings = getSettings();
    const isTestMode = settings.stripe_mode === 'test';

    // Select correct price ID: use specific test price if defined, otherwise global
    const priceId = isTestMode
      ? (process.env.STRIPE_TEST_PRO_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID)
      : process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId || priceId.includes('your_stripe_price_id')) {
      return NextResponse.json({ 
        error: 'Stripe is not fully configured yet.',
        message: 'Stripe Price ID is missing from environment variables.'
      }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const stripe = getStripeInstance();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/pricing`,
      customer_email: sessionUser.email,
      metadata: { 
        userId: sessionUser.id,
        mode: settings.stripe_mode 
      },
      subscription_data: {
        metadata: { 
          userId: sessionUser.id,
          mode: settings.stripe_mode
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
}

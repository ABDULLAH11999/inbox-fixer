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
    let priceId = isTestMode
      ? (process.env.STRIPE_TEST_PRO_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID)
      : process.env.STRIPE_PRO_PRICE_ID;

    const stripe = getStripeInstance();

    if (isTestMode && (!priceId || priceId.includes('your_stripe_price_id'))) {
      try {
        console.log('Generating dynamic Stripe Test Product & Price on-the-fly...');
        const products = await stripe.products.list({ limit: 100 });
        let product = products.data.find(p => p.name === 'InboxFixer Pro');
        
        if (!product) {
          product = await stripe.products.create({
            name: 'InboxFixer Pro',
            description: 'InboxFixer premium email deliverability suite.',
          });
        }

        const prices = await stripe.prices.list({ product: product.id, limit: 100 });
        let price = prices.data.find(p => p.unit_amount === 900 && p.recurring?.interval === 'month');

        if (!price) {
          price = await stripe.prices.create({
            product: product.id,
            unit_amount: 900,
            currency: 'usd',
            recurring: { interval: 'month' },
          });
        }

        priceId = price.id;
        console.log('Dynamic Stripe Test Price created:', priceId);
      } catch (err: any) {
        console.error('Failed to create test product/price dynamically:', err);
        return NextResponse.json({ 
          error: 'Stripe Test Mode initialization error',
          message: err.message || 'Stripe failed to initialize dynamic pricing.'
        }, { status: 500 });
      }
    } else {
      if (!priceId || priceId.includes('your_stripe_price_id')) {
        return NextResponse.json({ 
          error: 'Stripe is not fully configured yet.',
          message: 'Stripe Price ID is missing from environment variables.'
        }, { status: 500 });
      }
    }

    // Dynamically detect the active domain from request headers to ensure Stripe redirects stay on the correct environment
    const hostHeader = req.headers.get('host') || '';
    const xForwardedProto = req.headers.get('x-forwarded-proto') || 'https';
    const protocol = hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1') ? 'http' : xForwardedProto;
    const appUrl = hostHeader ? `${protocol}://${hostHeader}` : (req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    // Resolve or reuse existing Stripe Customer to prevent multiple customer profiles
    let customerParam: { customer?: string; customer_email?: string } = {
      customer_email: sessionUser.email,
    };

    try {
      const customers = await stripe.customers.list({
        email: sessionUser.email.toLowerCase(),
        limit: 1,
      });
      if (customers.data.length > 0) {
        customerParam = { customer: customers.data[0].id };
      }
    } catch (custErr) {
      console.error('Failed to resolve existing Stripe Customer:', custErr);
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/pricing`,
      ...customerParam,
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

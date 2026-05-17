import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeInstance } from '@/lib/stripe';
import { getUsers, writeUsers, getPayments, writePayments } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const isWebhookSecretConfigured = 
    webhookSecret && 
    !webhookSecret.includes('your_stripe_webhook_secret');

  const stripe = getStripeInstance();

  if (!isWebhookSecretConfigured) {
    console.warn('STRIPE_WEBHOOK_SECRET is unconfigured or a placeholder. Webhook signature checking is disabled for local testing.');
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  } else {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret!);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        // Upgrade user in local DB to Pro
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
          users[userIndex].plan = 'pro';
          writeUsers(users);
          console.log(`Successfully upgraded user ${userId} to Pro plan via Stripe webhook.`);
        } else {
          console.warn(`User ID ${userId} not found in database.`);
        }

        // Log payment in local DB
        const payments = getPayments();
        payments.push({
          id: 'pay_' + Math.random().toString(36).substring(2, 11),
          user_id: userId,
          user_email: session.customer_details?.email || session.customer_email || 'unknown@example.com',
          stripe_checkout_id: session.id,
          amount: (session.amount_total || 900) / 100, // Convert from cents
          currency: session.currency?.toUpperCase() || 'USD',
          status: 'completed',
          created_at: new Date().toISOString()
        });
        writePayments(payments);
        console.log(`Logged payment for user ${userId} in payments.json.`);
      } else {
        console.warn('Checkout completed but no userId found in metadata.');
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        // Downgrade user in local DB to Free
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
          users[userIndex].plan = 'free';
          writeUsers(users);
          console.log(`Successfully downgraded user ${userId} to Free plan due to Stripe subscription cancellation.`);
        }
      } else {
        console.warn('Subscription deleted but no userId found in metadata.');
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}

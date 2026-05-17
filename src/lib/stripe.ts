import Stripe from 'stripe';
import { getSettings } from '@/lib/db';

export function getStripeInstance() {
  const settings = getSettings();
  const isTestMode = settings.stripe_mode === 'test';
  
  let secretKey = '';

  if (isTestMode) {
    // Strictly use test key
    secretKey = process.env.STRIPE_TEST_SECRET || '';
  } else {
    // Strictly use live/production key
    secretKey = process.env.STRIPE_SECRET_KEY || '';
  }

  // Ensure secretKey is clean
  if (!secretKey || secretKey.includes('your_stripe_secret_key')) {
    secretKey = '';
  }

  return new Stripe(secretKey, {
    apiVersion: '2023-10-16' as any,
  });
}

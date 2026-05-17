import Stripe from 'stripe';
import { getSettings } from '@/lib/db';

export function getStripeInstance() {
  const settings = getSettings();
  const isTestMode = settings.stripe_mode === 'test';
  
  let secretKey = '';

  if (isTestMode) {
    // Try test-specific secret key, fallback to global
    secretKey = process.env.STRIPE_TEST_SECRET || process.env.STRIPE_SECRET_KEY || '';
  } else {
    // Try global/live secret key, fallback to test in safe environments
    secretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET || '';
  }

  // Sanitize fallback placeholder values
  if (!secretKey || secretKey.includes('your_stripe_secret_key') || secretKey.includes('placeholder')) {
    // If absolutely nothing exists, use the default seeded test secret
    secretKey = process.env.STRIPE_TEST_SECRET || 'sk_test_placeholder_key_until_configured';
  }

  return new Stripe(secretKey, {
    apiVersion: '2023-10-16' as any,
  });
}

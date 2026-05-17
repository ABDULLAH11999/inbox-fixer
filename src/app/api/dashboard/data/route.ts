import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getScans, writeScans, getMonitoring, getUsers, writeUsers } from '@/lib/db';
import { getStripeInstance } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    // Fetch scans
    const allScans = getScans();
    const userScans = allScans
      .filter(s => s.user_id === session.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const users = getUsers();
    const dbUser = users.find(u => u.id === session.id);
    let activePlan = dbUser?.plan || 'free';

    // Fail-safe real-time Stripe upgrade synchronization check
    if (activePlan === 'free' && dbUser) {
      try {
        const stripe = getStripeInstance();
        const customers = await stripe.customers.list({
          email: session.email.toLowerCase(),
          limit: 1
        });

        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 1
          });

          if (subscriptions.data.length > 0) {
            const sub = subscriptions.data[0];
            let cardLast4 = '4242';
            let cardBrand = 'visa';

            try {
              let defaultPaymentMethodId = 
                sub.default_payment_method as string || 
                customers.data[0].invoice_settings.default_payment_method as string;

              if (!defaultPaymentMethodId) {
                // Query all active card payment methods for this customer in Stripe
                const paymentMethods = await stripe.paymentMethods.list({
                  customer: customerId,
                  type: 'card',
                  limit: 1
                });
                if (paymentMethods.data.length > 0) {
                  defaultPaymentMethodId = paymentMethods.data[0].id;
                }
              }

              if (defaultPaymentMethodId) {
                const paymentMethod = await stripe.paymentMethods.retrieve(defaultPaymentMethodId);
                if (paymentMethod.card) {
                  cardLast4 = paymentMethod.card.last4;
                  cardBrand = paymentMethod.card.brand;
                }
              }
            } catch (pmErr) {
              console.error('Failed to retrieve payment method card details:', pmErr);
            }

            // Perform real-time upgrade
            const allUsers = getUsers();
            const idx = allUsers.findIndex(u => u.id === session.id);
            if (idx !== -1) {
              allUsers[idx].plan = 'pro';
              allUsers[idx].card_last4 = cardLast4;
              allUsers[idx].card_brand = cardBrand;
              writeUsers(allUsers);

              activePlan = 'pro';
              dbUser.plan = 'pro';
              dbUser.card_last4 = cardLast4;
              dbUser.card_brand = cardBrand;
              console.log(`Auto-synchronized Pro subscription for ${session.email} directly from Stripe API.`);
            }
          }
        }
      } catch (stripeSyncErr) {
        console.error('Safe Stripe sync error:', stripeSyncErr);
      }
    }

    // Fetch monitored domains if Pro
    let userMonitoring: any[] = [];
    if (activePlan === 'pro') {
      const allMonitoring = getMonitoring();
      userMonitoring = allMonitoring.filter(m => m.user_id === session.id);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.id,
        email: session.email,
        role: session.role
      },
      profile: {
        plan: activePlan,
        card_last4: dbUser?.card_last4 || null,
        card_brand: dbUser?.card_brand || null
      },
      scans: userScans,
      monitoring: userMonitoring
    });

  } catch (err: any) {
    console.error('Dashboard data fetch error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated. Please log in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scanId = searchParams.get('id');

    if (!scanId) {
      return NextResponse.json({ error: 'Scan ID is required.' }, { status: 400 });
    }

    const allScans = getScans();
    const filtered = allScans.filter(s => !(s.id === scanId && s.user_id === session.id));

    writeScans(filtered);

    return NextResponse.json({ success: true, message: 'Scan record deleted successfully.' });
  } catch (error: any) {
    console.error('Dashboard scan delete error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

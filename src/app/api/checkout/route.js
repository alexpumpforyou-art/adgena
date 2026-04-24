import { NextResponse } from 'next/server';
import { createStripeCheckout, createRobokassaPaymentUrl } from '@/lib/payments';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan');
    const provider = searchParams.get('provider') || 'robokassa';
    const email = searchParams.get('email') || 'user@example.com';
    const userId = searchParams.get('userId') || 'demo-user';

    if (!plan || !['starter', 'pro', 'business'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan' },
        { status: 400 }
      );
    }

    if (provider === 'stripe') {
      // Stripe Checkout for CIS / International
      const session = await createStripeCheckout({
        planId: plan,
        email,
        userId,
      });
      return NextResponse.redirect(session.url);
    }

    if (provider === 'robokassa') {
      // Robokassa for Russia
      const invoiceId = Date.now(); // In production: use DB sequence
      const paymentUrl = createRobokassaPaymentUrl({
        planId: plan,
        invoiceId,
        email,
        userId,
      });
      return NextResponse.redirect(paymentUrl);
    }

    return NextResponse.json(
      { success: false, error: 'Unknown payment provider' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

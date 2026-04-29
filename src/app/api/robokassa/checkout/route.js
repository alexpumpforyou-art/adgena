import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

const PLANS = {
  lite:     { price: 390,  name: 'Лайт — 10 генераций', limit: 10 },
  standard: { price: 990,  name: 'Стандарт — 30 генераций', limit: 30 },
  pro:      { price: 2490, name: 'Про — 80 генераций', limit: 80 },
  business: { price: 4990, name: 'Бизнес — 200 генераций', limit: 200 },
};

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Not logged in — redirect to auth with plan in query (will redirect back after login)
      const { searchParams } = new URL(request.url);
      const planId = searchParams.get('plan');
      return NextResponse.redirect(new URL(`/auth?redirect=/api/robokassa/checkout?plan=${planId}`, request.url));
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('plan');

    if (!planId || !PLANS[planId]) {
      return NextResponse.redirect(new URL('/?error=invalid_plan#pricing', request.url));
    }

    const plan = PLANS[planId];
    const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN;
    const password1 = process.env.ROBOKASSA_PASSWORD1;
    const isTest = process.env.ROBOKASSA_TEST_MODE === 'true';

    if (!merchantLogin || !password1) {
      console.error('[Robokassa] Missing merchant credentials');
      return NextResponse.redirect(new URL('/?error=payment_not_configured', request.url));
    }

    // Unique invoice ID
    const invId = Math.floor(Date.now() / 1000);
    const outSum = plan.price.toFixed(2);

    // Shp_ params (must be sorted alphabetically in signature)
    const shpParams = {
      'Shp_planId': planId,
      'Shp_userId': user.id,
    };

    // Sort Shp_ keys alphabetically
    const shpStr = Object.keys(shpParams)
      .sort()
      .map(k => `${k}=${shpParams[k]}`)
      .join(':');

    // Signature: MerchantLogin:OutSum:InvId:Password1:Shp_...
    const sigSource = `${merchantLogin}:${outSum}:${invId}:${password1}:${shpStr}`;
    const signature = crypto.createHash('md5').update(sigSource).digest('hex');

    // Build Robokassa payment URL
    const params = new URLSearchParams({
      MerchantLogin: merchantLogin,
      OutSum: outSum,
      InvId: invId.toString(),
      Description: plan.name,
      SignatureValue: signature,
      Culture: 'ru',
      Encoding: 'utf-8',
      // Enable recurring (subscription) — user agrees to future auto-charges
      Recurring: 'true',
      ...shpParams,
    });

    if (isTest) {
      params.set('IsTest', '1');
    }

    const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?${params.toString()}`;

    console.log(`[Robokassa] Checkout: user=${user.email}, plan=${planId}, sum=${outSum}, invId=${invId}, recurring=true`);

    return NextResponse.redirect(paymentUrl);
  } catch (error) {
    console.error('[Robokassa] Checkout error:', error);
    return NextResponse.redirect(new URL('/?error=checkout_failed', request.url));
  }
}

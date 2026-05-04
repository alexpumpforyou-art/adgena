import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { PLANS } from '@/lib/plans';
import crypto from 'crypto';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
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

    const invId = Math.floor(Date.now() / 1000);
    const outSum = plan.price.toFixed(2);

    // 54-FZ Receipt
    const receipt = JSON.stringify({
      items: [{
        name: `Подписка Adgena «${plan.name}» (${plan.description})`,
        quantity: 1,
        sum: plan.price,
        payment_method: 'full_payment',
        payment_object: 'service',
        tax: 'none',
      }],
    });
    const receiptEncoded = encodeURIComponent(receipt);

    // Shp_ params (sorted alphabetically for signature)
    const shpParams = {
      'Shp_planId': planId,
      'Shp_userId': user.id,
    };
    const shpStr = Object.keys(shpParams)
      .sort()
      .map(k => `${k}=${shpParams[k]}`)
      .join(':');

    // Signature: MerchantLogin:OutSum:InvId:Receipt:Password1:Shp_...
    const sigSource = `${merchantLogin}:${outSum}:${invId}:${receiptEncoded}:${password1}:${shpStr}`;
    const signature = crypto.createHash('md5').update(sigSource).digest('hex');

    const params = new URLSearchParams({
      MerchantLogin: merchantLogin,
      OutSum: outSum,
      InvId: invId.toString(),
      Description: `Подписка Adgena «${plan.name}»`,
      SignatureValue: signature,
      Receipt: receiptEncoded,
      Email: user.email,
      Culture: 'ru',
      Encoding: 'utf-8',
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

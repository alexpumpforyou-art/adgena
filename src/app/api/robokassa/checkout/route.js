import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

const PLANS = {
  lite:     { price: 290,  name: 'Лайт — 10 генераций', limit: 10 },
  standard: { price: 790,  name: 'Стандарт — 35 генераций', limit: 35 },
  pro:      { price: 1990, name: 'Про — 100 генераций', limit: 100 },
  business: { price: 4490, name: 'Бизнес — 300 генераций', limit: 300 },
};

function generateSignature(login, sum, invId, password) {
  const str = `${login}:${sum}:${invId}:${password}`;
  return crypto.createHash('md5').update(str).digest('hex');
}

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url));
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

    // Use a unique invoice ID based on timestamp + user
    const invId = Math.floor(Date.now() / 1000);
    const outSum = plan.price.toFixed(2);

    // Generate signature: MerchantLogin:OutSum:InvId:Password1
    const signature = generateSignature(merchantLogin, outSum, invId, password1);

    // Build Robokassa payment URL
    const baseUrl = isTest
      ? 'https://auth.robokassa.ru/Merchant/Index.aspx'
      : 'https://auth.robokassa.ru/Merchant/Index.aspx';

    const params = new URLSearchParams({
      MerchantLogin: merchantLogin,
      OutSum: outSum,
      InvId: invId.toString(),
      Description: plan.name,
      SignatureValue: signature,
      Culture: 'ru',
      Encoding: 'utf-8',
      // Custom params (Shp_ prefix)
      'Shp_userId': user.id,
      'Shp_planId': planId,
    });

    if (isTest) {
      params.set('IsTest', '1');
    }

    // Re-generate signature with Shp_ params (they must be in alphabetical order)
    const shpStr = `Shp_planId=${planId}:Shp_userId=${user.id}`;
    const sigWithShp = crypto.createHash('md5')
      .update(`${merchantLogin}:${outSum}:${invId}:${password1}:${shpStr}`)
      .digest('hex');
    params.set('SignatureValue', sigWithShp);

    const paymentUrl = `${baseUrl}?${params.toString()}`;

    console.log(`[Robokassa] Redirecting user ${user.email} to payment: plan=${planId}, sum=${outSum}, invId=${invId}`);

    return NextResponse.redirect(paymentUrl);
  } catch (error) {
    console.error('[Robokassa] Checkout error:', error);
    return NextResponse.redirect(new URL('/?error=checkout_failed', request.url));
  }
}

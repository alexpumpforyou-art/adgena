/**
 * Payment Providers: Stripe (СНГ/International) + Robokassa (РФ)
 */

import crypto from 'crypto';

// ========================================
// STRIPE (СНГ / International)
// ========================================

let stripeInstance = null;

async function getStripe() {
  if (!stripeInstance) {
    // Dynamic import hidden from Turbopack static analysis
    const mod = await new Function('return import("stripe")')();
    const Stripe = mod.default || mod;
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}

/**
 * Create Stripe checkout session
 */
export async function createStripeCheckout({ planId, email, userId, successUrl, cancelUrl }) {
  const stripe = getStripe();
  
  const PLANS = {
    starter: {
      name: 'Starter',
      price: 990, // в копейках для Stripe = 99000
      currency: 'rub',
      generations: 50,
    },
    pro: {
      name: 'Pro',
      price: 2490,
      currency: 'rub',
      generations: 200,
    },
    business: {
      name: 'Business',
      price: 4990,
      currency: 'rub',
      generations: 500,
    },
  };

  const plan = PLANS[planId];
  if (!plan) throw new Error(`Unknown plan: ${planId}`);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: plan.currency,
          product_data: {
            name: `AdGena ${plan.name}`,
            description: `${plan.generations} генераций в месяц`,
          },
          unit_amount: plan.price * 100,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      planId,
    },
    success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhook(body, signature) {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}


// ========================================
// ROBOKASSA (РФ)
// ========================================

const ROBOKASSA_PLANS = {
  starter: { name: 'AdGena Starter', price: 990, generations: 50 },
  pro: { name: 'AdGena Pro', price: 2490, generations: 200 },
  business: { name: 'AdGena Business', price: 4990, generations: 500 },
};

/**
 * Generate Robokassa payment URL
 */
export function createRobokassaPaymentUrl({ planId, invoiceId, email, userId }) {
  const plan = ROBOKASSA_PLANS[planId];
  if (!plan) throw new Error(`Unknown plan: ${planId}`);

  const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN;
  const password1 = process.env.ROBOKASSA_PASSWORD1;
  const isTest = process.env.ROBOKASSA_TEST_MODE === 'true';
  
  const outSum = plan.price.toFixed(2);
  const invId = invoiceId;
  const description = plan.name;

  // Receipt for 54-FZ
  const receipt = {
    items: [
      {
        name: plan.name,
        quantity: 1,
        sum: plan.price,
        payment_method: 'full_payment',
        payment_object: 'service',
        tax: 'none',
      },
    ],
  };

  const receiptEncoded = encodeURIComponent(JSON.stringify(receipt));
  
  // Signature: MerchantLogin:OutSum:InvId:Receipt:Password#1:Shp_email=email:Shp_planId=planId:Shp_userId=userId
  const signatureString = `${merchantLogin}:${outSum}:${invId}:${receiptEncoded}:${password1}:Shp_email=${email}:Shp_planId=${planId}:Shp_userId=${userId}`;
  const signatureValue = crypto.createHash('md5').update(signatureString).digest('hex');

  const baseUrl = isTest
    ? 'https://auth.robokassa.ru/Merchant/Index.aspx'
    : 'https://auth.robokassa.ru/Merchant/Index.aspx';

  const params = new URLSearchParams({
    MerchantLogin: merchantLogin,
    OutSum: outSum,
    InvId: invId,
    Description: description,
    SignatureValue: signatureValue,
    Receipt: receiptEncoded,
    Email: email,
    Culture: 'ru',
    Shp_email: email,
    Shp_planId: planId,
    Shp_userId: userId,
    ...(isTest ? { IsTest: '1' } : {}),
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Verify Robokassa result notification
 */
export function verifyRobokassaResult({ outSum, invId, signatureValue, shpEmail, shpPlanId, shpUserId }) {
  const password2 = process.env.ROBOKASSA_PASSWORD2;
  
  const checkString = `${outSum}:${invId}:${password2}:Shp_email=${shpEmail}:Shp_planId=${shpPlanId}:Shp_userId=${shpUserId}`;
  const expectedSignature = crypto.createHash('md5').update(checkString).digest('hex').toUpperCase();
  
  return expectedSignature === signatureValue.toUpperCase();
}

/**
 * Get plan details
 */
export function getPlanDetails(planId) {
  return ROBOKASSA_PLANS[planId] || null;
}

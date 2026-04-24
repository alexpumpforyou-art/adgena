import { NextResponse } from 'next/server';
import { verifyRobokassaResult } from '@/lib/payments';

/**
 * Robokassa Result URL handler
 * Called by Robokassa server-to-server after successful payment
 */
export async function POST(request) {
  try {
    const formData = await request.formData();

    const outSum = formData.get('OutSum');
    const invId = formData.get('InvId');
    const signatureValue = formData.get('SignatureValue');
    const shpEmail = formData.get('Shp_email');
    const shpPlanId = formData.get('Shp_planId');
    const shpUserId = formData.get('Shp_userId');

    // Verify signature
    const isValid = verifyRobokassaResult({
      outSum,
      invId,
      signatureValue,
      shpEmail,
      shpPlanId,
      shpUserId,
    });

    if (!isValid) {
      console.error('Invalid Robokassa signature', { outSum, invId, signatureValue });
      return new Response('Invalid signature', { status: 400 });
    }

    // Payment confirmed — activate subscription
    console.log(`✅ Payment confirmed: Plan=${shpPlanId}, User=${shpUserId}, Amount=${outSum}, InvId=${invId}`);

    // TODO: Update user subscription in DB
    // await db.users.update({ id: shpUserId, plan: shpPlanId, paidUntil: nextMonth() });

    // Robokassa expects "OK<InvId>" response
    return new Response(`OK${invId}`, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('Robokassa webhook error:', error);
    return new Response('Error', { status: 500 });
  }
}

/**
 * Also handle GET for Robokassa (some configurations send GET)
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const outSum = searchParams.get('OutSum');
  const invId = searchParams.get('InvId');
  const signatureValue = searchParams.get('SignatureValue');
  const shpEmail = searchParams.get('Shp_email');
  const shpPlanId = searchParams.get('Shp_planId');
  const shpUserId = searchParams.get('Shp_userId');

  const isValid = verifyRobokassaResult({
    outSum,
    invId,
    signatureValue,
    shpEmail,
    shpPlanId,
    shpUserId,
  });

  if (!isValid) {
    return new Response('Invalid signature', { status: 400 });
  }

  console.log(`✅ Payment confirmed (GET): Plan=${shpPlanId}, User=${shpUserId}`);

  return new Response(`OK${invId}`, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}

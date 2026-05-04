import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generateReferralCode, getReferralStats, createWithdrawal } from '@/lib/db';

// GET /api/referral — get referral code + stats
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = getReferralStats(user.id);

    // Auto-generate code if user doesn't have one
    if (!stats.code) {
      stats.code = generateReferralCode(user.id);
    }

    return NextResponse.json({
      success: true,
      referral: {
        code: stats.code,
        link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://adgena.pro'}/auth?ref=${stats.code}`,
        balance: stats.balance,
        referralsCount: stats.referralsCount,
        totalEarned: stats.totalEarned,
        rewards: stats.rewards,
        withdrawals: stats.withdrawals,
      },
    });
  } catch (error) {
    console.error('[Referral] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/referral — request withdrawal
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, cardInfo } = await request.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Минимальная сумма вывода — 100 ₽' }, { status: 400 });
    }

    if (!cardInfo || cardInfo.trim().length < 10) {
      return NextResponse.json({ error: 'Укажите номер карты для вывода' }, { status: 400 });
    }

    const withdrawalId = createWithdrawal(user.id, amount, cardInfo.trim());
    if (!withdrawalId) {
      return NextResponse.json({ error: 'Недостаточно средств' }, { status: 400 });
    }

    console.log(`[Referral] Withdrawal request: user=${user.email}, amount=${amount}₽, card=${cardInfo.slice(0, 4)}****`);

    return NextResponse.json({
      success: true,
      message: 'Заявка на вывод создана. Обработка в течение 3 рабочих дней.',
      withdrawalId,
    });
  } catch (error) {
    console.error('[Referral] Withdrawal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

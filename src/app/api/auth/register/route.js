import { NextResponse } from 'next/server';
import { createUser, createSession, getUserByReferralCode, setReferredBy } from '@/lib/db';
import { signToken, buildSessionCookie } from '@/lib/auth';

// Disposable/temporary email domains — block registration
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com','temp-mail.org','guerrillamail.com','guerrillamail.net',
  'mailinator.com','throwaway.email','10minutemail.com','yopmail.com',
  'sharklasers.com','grr.la','guerrillamailblock.com','tempail.com',
  'maildrop.cc','dispostable.com','trashmail.com','trashmail.net',
  'fakeinbox.com','mailnesia.com','tempr.email','discard.email',
  'getnada.com','mohmal.com','burnermail.io','inboxkitten.com',
  'emailondeck.com','spamgourmet.com','mytemp.email','tempmailaddress.com',
  'tmpmail.org','tmpmail.net','tmp-mail.org','emailfake.com',
  'crazymailing.com','tmail.ws','mailsac.com','harakirimail.com',
  'mintemail.com','mt2015.com','thankyou2010.com','trash-mail.com',
  'bugmenot.com','rmqkr.net','emailigo.de','drdrb.com',
]);

// Rate limit: max registrations per IP per hour
const ipCounts = new Map();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    ipCounts.set(ip, { count: 1, start: now });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// Validate email format + block disposable
function validateEmail(email) {
  const trimmed = email.trim().toLowerCase();

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Некорректный формат email' };
  }

  // Extract domain
  const domain = trimmed.split('@')[1];

  // Block disposable domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, error: 'Временные email не допускаются. Используйте Gmail, Яндекс или другой постоянный адрес.' };
  }

  // Block obviously fake TLDs
  const tld = domain.split('.').pop();
  if (['test', 'example', 'invalid', 'localhost'].includes(tld)) {
    return { valid: false, error: 'Некорректный домен email' };
  }

  // Must have valid MX-like domain (at least 2 parts)
  const domainParts = domain.split('.');
  if (domainParts.length < 2 || domainParts.some(p => p.length === 0)) {
    return { valid: false, error: 'Некорректный домен email' };
  }

  return { valid: true, email: trimmed };
}

export async function POST(request) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Слишком много попыток регистрации. Попробуйте через час.' },
        { status: 429 }
      );
    }

    const { email, password, name, ref } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email и пароль обязательны' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Пароль минимум 6 символов' }, { status: 400 });
    }

    // Validate email
    const validation = validateEmail(email);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const user = createUser({ email: validation.email, password, name });

    // Apply referral if provided
    if (ref) {
      try {
        const referrer = getUserByReferralCode(ref);
        if (referrer && referrer.id !== user.id) {
          setReferredBy(user.id, referrer.id);
          console.log(`[Referral] User ${user.email} referred by ${referrer.email} (code: ${ref})`);
        }
      } catch (refErr) {
        console.error('[Referral] Error applying ref code:', refErr.message);
      }
    }

    const session = createSession(user.id);
    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        generationsUsed: user.generationsUsed,
        generationsLimit: user.generationsLimit,
      },
    });

    response.cookies.set(buildSessionCookie(token));
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка регистрации' },
      { status: error.message?.includes('зарегистрирован') ? 409 : 500 }
    );
  }
}

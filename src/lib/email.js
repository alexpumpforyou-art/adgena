// Email service via Resend (https://resend.com)
// Free: 3,000 emails/month

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Resend free tier requires onboarding@resend.dev as sender
// After domain verification, change to noreply@adgena.pro
const FROM_EMAIL = 'Adgena <noreply@adgena.pro>';

export async function sendVerificationCode(email, code) {
  if (!RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set');
    return { success: false, error: 'Email service not configured' };
  }

  const payload = {
    from: FROM_EMAIL,
    to: [email],
    subject: `${code} — код подтверждения Adgena`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0B0D14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:40px 32px;background:#111420;border-radius:16px;border:1px solid rgba(255,255,255,0.08);">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:24px;font-weight:800;color:#fff;">Adgena</span>
    </div>
    <h1 style="color:#fff;font-size:20px;font-weight:700;text-align:center;margin:0 0 8px;">
      Код подтверждения
    </h1>
    <p style="color:#A1A1AA;font-size:14px;text-align:center;margin:0 0 32px;">
      Введите этот код на странице регистрации
    </p>
    <div style="background:#0B0D14;border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;border:1px solid rgba(255,106,0,0.2);">
      <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#FF6A00;">${code}</span>
    </div>
    <p style="color:#5A5A68;font-size:12px;text-align:center;margin:0;">
      Код действителен 10 минут. Если вы не запрашивали код, проигнорируйте это письмо.
    </p>
  </div>
  <p style="color:#5A5A68;font-size:11px;text-align:center;margin-top:16px;">
    © 2026 Adgena — AI-генератор карточек товара
  </p>
</body>
</html>`,
  };

  try {
    console.log('[Email] Sending code to:', email, 'from:', FROM_EMAIL);
    console.log('[Email] API key present:', !!RESEND_API_KEY, 'length:', RESEND_API_KEY?.length);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('[Email] Response status:', res.status, 'body:', JSON.stringify(data));

    if (!res.ok) {
      console.error('[Email] Resend error:', res.status, data);
      return { success: false, error: data.message || `Resend error ${res.status}` };
    }

    console.log('[Email] Sent successfully, id:', data.id);
    return { success: true, id: data.id };

  } catch (err) {
    console.error('[Email] Network error:', err.message);
    return { success: false, error: err.message };
  }
}

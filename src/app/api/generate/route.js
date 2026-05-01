import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canGenerate, incrementGenerations, createGeneration, updateGeneration } from '@/lib/db';
import { generateProductCard } from '@/lib/apiyi';
import { consumeToken, tryAcquireSlot, releaseSlot, getClientIp } from '@/lib/ratelimit';
import sharp from 'sharp';

// Size definitions with aspect ratios
const SIZE_MAP = {
  wb:         { w: 900,  h: 1200, aspect: '3:4' },
  ozon:       { w: 900,  h: 1200, aspect: '3:4' },
  amazon:     { w: 2000, h: 2000, aspect: '1:1' },
  ebay:       { w: 1600, h: 1600, aspect: '1:1' },
  etsy:       { w: 2000, h: 2000, aspect: '1:1' },
  shopify:    { w: 2048, h: 2048, aspect: '1:1' },
  'fb-feed':  { w: 1080, h: 1080, aspect: '1:1' },
  'fb-story': { w: 1080, h: 1920, aspect: '9:16' },
  'google-gdn': { w: 1200, h: 628, aspect: '16:9' },
  'vk-post':  { w: 1080, h: 607,  aspect: '16:9' },
};

// Default output size per aspect ratio (used when sizeId is not provided)
const ASPECT_TO_SIZE = {
  '9:16': { w: 1080, h: 1920, aspect: '9:16' },
  '3:4':  { w: 1080, h: 1440, aspect: '3:4' },
  '1:1':  { w: 1440, h: 1440, aspect: '1:1' },
  '4:3':  { w: 1440, h: 1080, aspect: '4:3' },
  '16:9': { w: 1920, h: 1080, aspect: '16:9' },
};

export async function POST(request) {
  let rlKey = null;
  let slotAcquired = false;
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const templateId = formData.get('templateId');
    const sizeId = formData.get('sizeId');
    const productName = formData.get('productName');
    const productDesc = formData.get('productDesc');
    const type = formData.get('type') || 'photo';
    const category = formData.get('category') || 'other';
    const lang = formData.get('lang') || 'ru';
    const textJson = formData.get('text');
    const wishes = formData.get('wishes') || '';
    const cardText = formData.get('cardText') || '';
    const cardStyle = formData.get('cardStyle') || 'classic';
    const creativity = parseFloat(formData.get('creativity') || '0.5');
    const aspectRatioOverride = formData.get('aspectRatio') || '';

    if (!image || !templateId) {
      return NextResponse.json(
        { success: false, error: 'image и templateId обязательны' },
        { status: 400 }
      );
    }

    if (!productName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Укажите название товара' },
        { status: 400 }
      );
    }

    // Auth check (optional — allow anonymous with demo limits)
    const user = await getCurrentUser();

    if (user && !canGenerate(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Лимит генераций исчерпан. Обновите тариф.' },
        { status: 403 }
      );
    }

    // === RATE LIMIT ===
    // Key: user id if authenticated, else client IP.
    // Token bucket: capacity 5, refill 1 / 12 sec ≈ 5/min sustained.
    rlKey = user ? `user:${user.id}` : `ip:${getClientIp(request)}`;
    const rl = consumeToken(rlKey, 5, 1 / 12);
    if (!rl.ok) {
      return NextResponse.json(
        { success: false, error: `Слишком много запросов. Подождите ${Math.ceil(rl.retryAfterMs / 1000)} сек.` },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    // Concurrency guard: max 2 simultaneous generations per key
    if (!tryAcquireSlot(rlKey, 2)) {
      return NextResponse.json(
        { success: false, error: 'У вас уже запущены 2 генерации. Дождитесь их завершения.' },
        { status: 429 }
      );
    }
    slotAcquired = true;

    // Parse AI-generated text
    let parsedText = {};
    if (textJson) {
      try { parsedText = JSON.parse(textJson); } catch {}
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const imageBuffer = Buffer.from(bytes);
    const imageBase64 = imageBuffer.toString('base64');

    // Detect MIME type
    let mimeType = 'image/png';
    if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) mimeType = 'image/jpeg';
    else if (imageBuffer[0] === 0x52 && imageBuffer[1] === 0x49) mimeType = 'image/webp';

    // Extract text fields
    const bullets = parsedText.bullets || [];
    const headline = formData.get('headline') || parsedText.headline || parsedText.title || productName;
    const cta = formData.get('cta') || parsedText.cta || 'Купить сейчас';
    const price = (formData.get('price') || '').toString().trim();
    const showButton = formData.get('showButton') === 'true' || formData.get('showButton') === '1';

    // Resolve target size & aspect ratio
    // Priority: explicit sizeId → aspectRatio override → default (wb 3:4)
    let sizeConfig;
    if (sizeId && SIZE_MAP[sizeId]) {
      sizeConfig = SIZE_MAP[sizeId];
    } else if (aspectRatioOverride && ASPECT_TO_SIZE[aspectRatioOverride]) {
      sizeConfig = ASPECT_TO_SIZE[aspectRatioOverride];
    } else {
      sizeConfig = SIZE_MAP['wb'];
    }
    const aspectRatio = sizeConfig.aspect;

    // Create generation record
    let generationId;
    if (user) {
      generationId = createGeneration({
        userId: user.id,
        type,
        templateId,
        sizeId: sizeId || null,
        productName: productName || '',
        productDesc: productDesc || '',
        generatedText: parsedText,
        imageInputPath: null,
      });
    } else {
      generationId = `gen_${Date.now()}`;
    }

    console.log(`[Generate] Starting: ${generationId} | template: ${templateId} | size: ${sizeId} (${sizeConfig.w}x${sizeConfig.h}, ${aspectRatio})`);

    // Override aspect ratio if explicitly set by user
    const finalAspectRatio = aspectRatioOverride || aspectRatio;

    // === CORE: Generate via AI ===
    const result = await generateProductCard({
      imageBase64,
      mimeType,
      templateId,
      productName: productName || 'Product',
      bullets,
      type,
      category,
      headline,
      cta,
      price,
      showButton,
      lang,
      aspectRatio: finalAspectRatio,
      wishes,
      cardText,
      cardStyle,
      creativity,
    });

    if (!result.success || !result.imageData) {
      console.error('[Generate] AI returned no image.', {
        model: result.model,
        contentType: typeof result.rawContent,
        contentLength: typeof result.rawContent === 'string' ? result.rawContent.length : 'N/A',
      });

      if (user) updateGeneration(generationId, { status: 'failed' });

      return NextResponse.json({
        success: false,
        error: 'AI не вернул изображение. Попробуйте ещё раз.',
      }, { status: 500 });
    }

    // === POST-PROCESS: Extract buffer, resize with sharp ===
    let rawBuffer;
    if (result.imageData.startsWith('data:image')) {
      const base64Match = result.imageData.match(/^data:image\/\w+;base64,(.+)$/);
      rawBuffer = base64Match ? Buffer.from(base64Match[1], 'base64') : null;
    } else if (result.imageData.startsWith('http')) {
      try {
        const imgRes = await fetch(result.imageData);
        rawBuffer = Buffer.from(await imgRes.arrayBuffer());
      } catch (dlErr) {
        console.error('[Generate] Download error:', dlErr.message);
      }
    }

    let finalBuffer = rawBuffer;
    if (rawBuffer) {
      try {
        // Resize and optimize to WebP (Quality 98 = visually lossless for advertising, but still lighter than PNG)
        finalBuffer = await sharp(rawBuffer)
          .resize(sizeConfig.w, sizeConfig.h, { fit: 'cover', position: 'center' })
          .webp({ quality: 98, effort: 6 })
          .toBuffer();
        console.log(`[Generate] Resized & WebP: ${sizeConfig.w}x${sizeConfig.h} (${(finalBuffer.length / 1024).toFixed(0)}KB)`);
      } catch (sharpErr) {
        console.error('[Generate] Sharp resize error (using original):', sharpErr.message);
        finalBuffer = rawBuffer;
      }
    }

    // === UPLOAD TO S3-COMPATIBLE STORAGE (Yandex / R2) ===
    let r2Url = null;
    try {
      const { uploadFile } = await import('@/lib/storage');
      const uploadBuffer = finalBuffer || rawBuffer;
      if (uploadBuffer) {
        const r2Result = await uploadFile(uploadBuffer, 'image/webp', 'generations', 'webp');
        if (r2Result) {
          r2Url = r2Result.url;
          console.log(`[Generate] S3 uploaded: ${r2Url}`);
        }
      }
    } catch (r2Err) {
      console.error('[Generate] S3 upload error (non-fatal):', r2Err.message);
    }

    // Build transient data URL ONLY if S3 upload failed (fallback so client still renders something)
    // Normal path: return only imageUrl to avoid shipping 3-5 MB base64 over the network.
    const imageDataUrl = r2Url ? null : (finalBuffer
      ? `data:image/webp;base64,${finalBuffer.toString('base64')}`
      : result.imageData);

    // Update generation record
    if (user) {
      updateGeneration(generationId, {
        status: 'completed',
        imageOutputPath: r2Url || generationId,
        model: result.model,
        costUsd: result.costUsd || 0,
      });
      incrementGenerations(user.id);
    }

    console.log(`[Generate] ✅ Done: ${generationId} (${(finalBuffer?.length / 1024).toFixed(0) || '?'}KB)${r2Url ? ' → R2' : ''}`);

    return NextResponse.json({
      success: true,
      imageDataUrl,
      imageUrl: r2Url,
      generationId,
      template: templateId,
      size: sizeId,
      dimensions: { w: sizeConfig.w, h: sizeConfig.h },
      model: result.model,
    });
  } catch (error) {
    console.error('[Generate] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка генерации' },
      { status: 500 }
    );
  } finally {
    if (slotAcquired && rlKey) releaseSlot(rlKey);
  }
}

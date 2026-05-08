import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { tryConsumeGeneration, refundGeneration, createGeneration, updateGeneration } from '@/lib/db';
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

async function runGenerationJob({
  generationId,
  currentUserId,
  generationConsumed,
  imageBase64,
  mimeType,
  templateId,
  productName,
  bullets,
  type,
  category,
  headline,
  cta,
  price,
  showButton,
  lang,
  aspectRatio,
  wishes,
  cardText,
  cardStyle,
  creativity,
  noText,
  sizeConfig,
  sizeId,
}) {
  let generationCompleted = false;
  try {
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
      aspectRatio,
      wishes,
      cardText: noText ? '' : cardText,
      cardStyle,
      creativity,
      noText,
    });

    if (!result.success || !result.imageData) {
      console.error('[Generate] AI returned no image.', {
        model: result.model,
        contentType: typeof result.rawContent,
        contentLength: typeof result.rawContent === 'string' ? result.rawContent.length : 'N/A',
      });
      updateGeneration(generationId, { status: 'failed' });
      if (generationConsumed && currentUserId) {
        try { refundGeneration(currentUserId); } catch {}
      }
      return { success: false, error: 'AI не вернул изображение. Попробуйте ещё раз.' };
    }

    let rawBuffer;
    if (result.imageData.startsWith('data:image')) {
      const base64Match = result.imageData.match(/^data:image\/\w+;base64,(.+)$/);
      rawBuffer = base64Match ? Buffer.from(base64Match[1], 'base64') : null;
    } else if (result.imageData.startsWith('http')) {
      const imgRes = await fetch(result.imageData);
      if (!imgRes.ok) throw new Error(`image download failed: ${imgRes.status}`);
      const contentType = imgRes.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) throw new Error(`unexpected image content-type: ${contentType || 'unknown'}`);
      rawBuffer = Buffer.from(await imgRes.arrayBuffer());
    }

    if (!rawBuffer) throw new Error('AI вернул изображение в неподдерживаемом формате.');

    const finalBuffer = await sharp(rawBuffer)
      .resize(sizeConfig.w, sizeConfig.h, { fit: 'cover', position: 'center' })
      .webp({ quality: 98, effort: 6 })
      .toBuffer();

    let s3Url = null;
    const { uploadFile } = await import('@/lib/storage');
    const s3Result = await uploadFile(finalBuffer, 'image/webp', 'generations', 'webp');
    if (s3Result) s3Url = s3Result.url;
    if (!s3Url) throw new Error('Не удалось сохранить результат генерации.');

    updateGeneration(generationId, {
      status: 'completed',
      imageOutputPath: s3Url,
      model: result.model,
      costUsd: result.costUsd || 0,
    });
    generationCompleted = true;

    console.log(`[Generate] Done: ${generationId} (${(finalBuffer.length / 1024).toFixed(0)}KB) → S3`);
    return {
      success: true,
      imageDataUrl: null,
      imageUrl: s3Url,
      generationId,
      template: templateId,
      size: sizeId,
      dimensions: { w: sizeConfig.w, h: sizeConfig.h },
      model: result.model,
    };
  } catch (error) {
    console.error('[Generate] Job error:', error.message);
    updateGeneration(generationId, { status: 'failed' });
    if (generationConsumed && !generationCompleted && currentUserId) {
      try { refundGeneration(currentUserId); } catch {}
    }
    return { success: false, error: error.message || 'Ошибка генерации' };
  }
}

export async function POST(request) {
  let slotAcquired = false;
  let rlKey = null;
  let generationConsumed = false;
  let generationCompleted = false;
  let currentUserId = null;

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
    const cardStyle = formData.get('cardStyle') || 'infographic';
    const creativity = parseFloat(formData.get('creativity') || '0.5');
    const aspectRatioOverride = formData.get('aspectRatio') || '';

    if (!image || !templateId) {
      return NextResponse.json(
        { success: false, error: 'image и templateId обязательны' },
        { status: 400 }
      );
    }

    // Upload constraints — mirrored on the client
    const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
    const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
    if (image.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: `Файл слишком большой (${(image.size / 1024 / 1024).toFixed(1)} MB). Максимум — 10 MB.` },
        { status: 413 }
      );
    }
    if (image.type && !ACCEPTED_MIME.includes(image.type)) {
      return NextResponse.json(
        { success: false, error: `Формат ${image.type} не поддерживается. Загрузите JPG, PNG или WebP.` },
        { status: 415 }
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
    currentUserId = user?.id || null;

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

    if (user && !tryConsumeGeneration(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Лимит генераций исчерпан. Обновите тариф.' },
        { status: 403 }
      );
    }
    generationConsumed = !!user;

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

    let inputImageUrl = null;
    try {
      const { uploadFile } = await import('@/lib/storage');
      const inputBuffer = await sharp(imageBuffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 92, effort: 4 })
        .toBuffer();
      const inputUpload = await uploadFile(inputBuffer, 'image/webp', 'inputs', 'webp');
      if (inputUpload) {
        inputImageUrl = inputUpload.url;
        console.log(`[Generate] Input uploaded: ${inputImageUrl}`);
      }
    } catch (inputUploadErr) {
      console.error('[Generate] Input upload error (non-fatal):', inputUploadErr.message);
    }

    // Extract text fields
    const bullets = parsedText.bullets || [];
    const rawHeadline = formData.get('headline') || '';
    const noText = rawHeadline === '__NOTEXT__' || (formData.get('cardText') || '') === '__NOTEXT__';
    const headline = noText ? '' : (rawHeadline || parsedText.headline || parsedText.title || productName);
    const cta = noText ? '' : (formData.get('cta') || parsedText.cta || 'Купить сейчас');
    const price = noText ? '' : (formData.get('price') || '').toString().trim();
    const showButton = noText ? false : (formData.get('showButton') === 'true' || formData.get('showButton') === '1');

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
        imageInputPath: inputImageUrl,
      });
    } else {
      generationId = `gen_${Date.now()}`;
    }

    console.log(`[Generate] Starting: ${generationId} | template: ${templateId} | size: ${sizeId} (${sizeConfig.w}x${sizeConfig.h}, ${aspectRatio})`);

    // Override aspect ratio if explicitly set by user
    const finalAspectRatio = aspectRatioOverride || aspectRatio;

    const jobPayload = {
      generationId,
      currentUserId,
      generationConsumed,
      imageBase64,
      mimeType,
      templateId,
      productName,
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
      cardText: noText ? '' : cardText,
      cardStyle,
      creativity,
      noText,
      sizeConfig,
      sizeId,
    };

    if (user && (type === 'card' || type === 'ads')) {
      const releaseKey = rlKey;
      runGenerationJob(jobPayload).finally(() => {
        if (releaseKey) releaseSlot(releaseKey);
      });
      slotAcquired = false;
      generationCompleted = true;
      return NextResponse.json({
        success: true,
        pending: true,
        generationId,
        status: 'processing',
      }, { status: 202 });
    }

    // === CORE: Generate via AI ===
    const jobResult = await runGenerationJob(jobPayload);
    generationCompleted = jobResult.success;

    return NextResponse.json(jobResult, { status: jobResult.success ? 200 : 500 });
  } catch (error) {
    console.error('[Generate] Error:', error.message);
    if (generationConsumed && !generationCompleted && currentUserId) {
      try { refundGeneration(currentUserId); } catch {}
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка генерации' },
      { status: 500 }
    );
  } finally {
    if (slotAcquired && rlKey) releaseSlot(rlKey);
  }
}

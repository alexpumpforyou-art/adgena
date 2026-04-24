import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canGenerate, incrementGenerations, createGeneration, updateGeneration } from '@/lib/db';
import { generateProductCard } from '@/lib/apiyi';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const templateId = formData.get('templateId');
    const sizeId = formData.get('sizeId');
    const productName = formData.get('productName');
    const productDesc = formData.get('productDesc');
    const type = formData.get('type') || 'marketplace';
    const lang = formData.get('lang') || 'ru';
    const textJson = formData.get('text');

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
    const headline = parsedText.headline || parsedText.title || productName;
    const cta = parsedText.cta || 'Купить сейчас';

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

    console.log(`[Generate] Starting AI generation: ${generationId}`);

    // === CORE: Generate via Nano Banana Pro ===
    const result = await generateProductCard({
      imageBase64,
      mimeType,
      templateId,
      productName: productName || 'Product',
      bullets,
      type,
      headline,
      cta,
      lang,
    });

    if (!result.success || !result.imageData) {
      console.error('[Generate] AI returned no image.', {
        model: result.model,
        contentType: typeof result.rawContent,
        contentLength: typeof result.rawContent === 'string' ? result.rawContent.length : 'N/A',
        contentPreview: typeof result.rawContent === 'string' ? result.rawContent.substring(0, 200) : JSON.stringify(result.rawContent)?.substring(0, 200),
      });

      if (user) updateGeneration(generationId, { status: 'failed' });

      return NextResponse.json({
        success: false,
        error: 'AI не вернул изображение. Попробуйте ещё раз.',
        debug: {
          model: result.model,
          contentType: typeof result.rawContent,
          hasContent: !!result.rawContent,
        },
      }, { status: 500 });
    }

    // Save the generated image
    const outputDir = path.join(process.cwd(), 'public', 'generated');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    let outputUrl;

    if (result.imageData.startsWith('data:image')) {
      // Base64 data URL → save as file
      const base64Match = result.imageData.match(/^data:image\/(\w+);base64,(.+)$/);
      if (base64Match) {
        const ext = base64Match[1] === 'jpeg' ? 'jpg' : base64Match[1];
        const filename = `${generationId}.${ext}`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, Buffer.from(base64Match[2], 'base64'));
        outputUrl = `/generated/${filename}`;
      }
    } else if (result.imageData.startsWith('http')) {
      // External URL → download and save
      try {
        const imgRes = await fetch(result.imageData);
        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
        const filename = `${generationId}.png`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, imgBuf);
        outputUrl = `/generated/${filename}`;
      } catch (dlErr) {
        console.error('[Generate] Failed to download image:', dlErr.message);
        outputUrl = result.imageData; // Fallback to direct URL
      }
    }

    // Update generation record
    if (user) {
      updateGeneration(generationId, { status: 'completed', imageOutputPath: outputUrl });
      incrementGenerations(user.id);
    }

    console.log(`[Generate] ✅ Done: ${generationId} → ${outputUrl}`);

    return NextResponse.json({
      success: true,
      imageUrl: outputUrl,
      generationId,
      template: templateId,
      size: sizeId,
      model: result.model,
    });
  } catch (error) {
    console.error('[Generate] Error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка генерации' },
      { status: 500 }
    );
  }
}

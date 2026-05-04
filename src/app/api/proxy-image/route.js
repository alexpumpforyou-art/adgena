import { NextResponse } from 'next/server';
import sharp from 'sharp';

const ALLOWED_FORMATS = { png: 'image/png', jpeg: 'image/jpeg', jpg: 'image/jpeg', webp: 'image/webp' };

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const format = (searchParams.get('format') || '').toLowerCase();

  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  // Only allow proxying from our own S3 bucket
  const allowedHosts = [
    process.env.S3_PUBLIC_URL,
    'storage.yandexcloud.net',
  ].filter(Boolean);

  const isAllowed = allowedHosts.some(h => url.startsWith(h) || url.includes(h));
  if (!isAllowed) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: 'Fetch failed' }, { status: 502 });
    }

    const arrayBuffer = await res.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    let contentType = res.headers.get('content-type') || 'image/webp';

    // On-the-fly format conversion (no storage cost — generated per request)
    if (format && ALLOWED_FORMATS[format]) {
      const fmt = format === 'jpg' ? 'jpeg' : format;
      const img = sharp(buffer);
      if (fmt === 'png') buffer = await img.png({ compressionLevel: 6 }).toBuffer();
      else if (fmt === 'jpeg') buffer = await img.jpeg({ quality: 92, mozjpeg: true }).flatten({ background: '#ffffff' }).toBuffer();
      else if (fmt === 'webp') buffer = await img.webp({ quality: 92 }).toBuffer();
      contentType = ALLOWED_FORMATS[format];
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

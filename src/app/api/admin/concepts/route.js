import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadFile } from '@/lib/storage';
import fs from 'fs';
import path from 'path';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
const DATA_PATH = path.join(process.cwd(), 'data', 'concept-thumbnails.json');

function loadThumbnails() {
  try {
    if (fs.existsSync(DATA_PATH)) return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  } catch { /* ignore */ }
  return {};
}

function saveThumbnails(data) {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET — return all concept thumbnails (public)
export async function GET() {
  return NextResponse.json({ success: true, thumbnails: loadThumbnails() });
}

// POST — upload thumbnail for a concept (admin only)
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const conceptKey = formData.get('conceptKey'); // e.g. "clothing__on-model"
    const file = formData.get('image');

    if (!conceptKey || !file) {
      return NextResponse.json({ error: 'conceptKey and image required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name?.split('.').pop() || 'webp';
    const contentType = file.type || 'image/webp';

    const result = await uploadFile(buffer, contentType, 'concept-thumbnails', ext);
    if (!result) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const thumbnails = loadThumbnails();
    thumbnails[conceptKey] = result.url;
    saveThumbnails(thumbnails);

    return NextResponse.json({ success: true, url: result.url, thumbnails });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — remove a concept thumbnail
export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { conceptKey } = await request.json();
    const thumbnails = loadThumbnails();
    delete thumbnails[conceptKey];
    saveThumbnails(thumbnails);

    return NextResponse.json({ success: true, thumbnails });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

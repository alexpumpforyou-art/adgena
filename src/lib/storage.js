// S3-compatible Storage (Cloudflare R2 / Yandex Object Storage / any S3)
// Controlled via env vars — zero code changes when switching providers

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

// === Storage config from env ===
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'r2'; // 'r2' | 'yandex' | 'custom'
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
const S3_SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
const S3_BUCKET = process.env.S3_BUCKET || process.env.R2_BUCKET || 'adgena-files';
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || process.env.R2_PUBLIC_URL;

// Provider-specific endpoints
const PROVIDER_CONFIGS = {
  r2: {
    endpoint: `https://${process.env.R2_ACCOUNT_ID || ''}.r2.cloudflarestorage.com`,
    region: 'auto',
  },
  yandex: {
    endpoint: 'https://storage.yandexcloud.net',
    region: 'ru-central1',
  },
  custom: {
    endpoint: process.env.S3_ENDPOINT || '',
    region: process.env.S3_REGION || 'us-east-1',
  },
};

let s3Client = null;

function getClient() {
  if (s3Client) return s3Client;

  if (!S3_ACCESS_KEY || !S3_SECRET_KEY) {
    console.warn('[Storage] Credentials not set');
    return null;
  }

  const config = PROVIDER_CONFIGS[STORAGE_PROVIDER] || PROVIDER_CONFIGS.custom;

  if (!config.endpoint) {
    console.warn('[Storage] No endpoint configured');
    return null;
  }

  s3Client = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
    // Yandex S3 needs path-style access
    forcePathStyle: STORAGE_PROVIDER === 'yandex',
  });

  console.log(`[Storage] Initialized: provider=${STORAGE_PROVIDER}, bucket=${S3_BUCKET}`);
  return s3Client;
}

/**
 * Upload a file to S3-compatible storage
 * @param {Buffer|Uint8Array} data - file data
 * @param {string} contentType - MIME type (e.g. 'image/webp')
 * @param {string} folder - folder prefix (e.g. 'generations')
 * @param {string} [ext] - file extension (e.g. 'webp')
 * @returns {{ url: string, key: string } | null}
 */
export async function uploadFile(data, contentType, folder = 'generations', ext = 'webp') {
  const client = getClient();
  if (!client) {
    console.error('[Storage] Cannot upload — credentials not configured');
    return null;
  }

  const id = crypto.randomUUID();
  const key = `${folder}/${id}.${ext}`;

  try {
    await client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: data,
      ContentType: contentType,
    }));

    const url = `${S3_PUBLIC_URL}/${key}`;
    console.log('[Storage] Uploaded:', key, 'size:', data.length);
    return { url, key };
  } catch (err) {
    console.error('[Storage] Upload error:', err.message);
    return null;
  }
}

/**
 * Upload a base64 image to S3-compatible storage
 * @param {string} base64Data - base64 encoded image (with or without data: prefix)
 * @param {string} folder - folder prefix
 * @returns {{ url: string, key: string } | null}
 */
export async function uploadBase64Image(base64Data, folder = 'generations') {
  // Strip data:image/xxx;base64, prefix if present
  let data = base64Data;
  let contentType = 'image/png';
  let ext = 'png';

  if (data.startsWith('data:')) {
    const match = data.match(/^data:([^;]+);base64,/);
    if (match) {
      contentType = match[1];
      ext = contentType.split('/')[1] || 'png';
      data = data.replace(/^data:[^;]+;base64,/, '');
    }
  }

  const buffer = Buffer.from(data, 'base64');
  return uploadFile(buffer, contentType, folder, ext);
}

/**
 * Delete a file from S3-compatible storage
 * @param {string} key - the object key to delete
 */
export async function deleteFile(key) {
  const client = getClient();
  if (!client) return;

  try {
    await client.send(new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }));
    console.log('[Storage] Deleted:', key);
  } catch (err) {
    console.error('[Storage] Delete error:', err.message);
  }
}

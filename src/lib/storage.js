// Cloudflare R2 Storage (S3-compatible)
// Used for storing generated images

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const R2_ACCOUNT_ID = '1dc0742ab38a727d9a7c3a86fbcaeb45';
const R2_BUCKET = process.env.R2_BUCKET || 'adgena-files';
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;

// Public URL base — either custom domain or R2 public URL
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://${R2_BUCKET}.${R2_ACCOUNT_ID}.r2.dev`;

let s3Client = null;

function getClient() {
  if (s3Client) return s3Client;

  if (!R2_ACCESS_KEY || !R2_SECRET_KEY) {
    console.warn('[R2] Credentials not set');
    return null;
  }

  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY,
      secretAccessKey: R2_SECRET_KEY,
    },
  });

  return s3Client;
}

/**
 * Upload a file to R2
 * @param {Buffer|Uint8Array} data - file data
 * @param {string} contentType - MIME type (e.g. 'image/webp')
 * @param {string} folder - folder prefix (e.g. 'generations')
 * @param {string} [ext] - file extension (e.g. 'webp')
 * @returns {{ url: string, key: string } | null}
 */
export async function uploadFile(data, contentType, folder = 'generations', ext = 'webp') {
  const client = getClient();
  if (!client) {
    console.error('[R2] Cannot upload — credentials not configured');
    return null;
  }

  const id = crypto.randomUUID();
  const key = `${folder}/${id}.${ext}`;

  try {
    await client.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: data,
      ContentType: contentType,
    }));

    const url = `${R2_PUBLIC_URL}/${key}`;
    console.log('[R2] Uploaded:', key, 'size:', data.length);
    return { url, key };
  } catch (err) {
    console.error('[R2] Upload error:', err.message);
    return null;
  }
}

/**
 * Upload a base64 image to R2
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
 * Delete a file from R2
 * @param {string} key - the object key to delete
 */
export async function deleteFile(key) {
  const client = getClient();
  if (!client) return;

  try {
    await client.send(new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }));
    console.log('[R2] Deleted:', key);
  } catch (err) {
    console.error('[R2] Delete error:', err.message);
  }
}

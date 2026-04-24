/**
 * Server-side card renderer using Fabric.js (node-canvas)
 * Composites: background + product image + text overlay → final PNG
 */

import { StaticCanvas, FabricImage, FabricText, Rect, Gradient } from 'fabric/node';
import { CARD_TEMPLATES, AD_TEMPLATES, MARKETPLACE_SIZES, AD_SIZES } from './templates';
import path from 'path';
import fs from 'fs';

/**
 * Render a product card to PNG buffer
 */
export async function renderCard({
  templateId,
  sizeId,
  type = 'marketplace',
  productImageBuffer,
  text = {},
}) {
  const template = [...CARD_TEMPLATES, ...AD_TEMPLATES].find(t => t.id === templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);

  const sizeMap = type === 'marketplace' ? MARKETPLACE_SIZES : AD_SIZES;
  const size = sizeMap[sizeId] || Object.values(sizeMap)[0];

  const canvas = new StaticCanvas(null, { width: size.width, height: size.height });
  const config = template.config;

  // 1. Draw background (FULL canvas)
  drawBackground(canvas, config.background, size);

  // 2. Place product image
  if (productImageBuffer) {
    await placeProductImage(canvas, productImageBuffer, config.productZone, size);
  }

  // 3. Add text overlay
  addTextOverlay(canvas, config, text, type, size);

  // 4. Add overlays/badges
  if (config.overlays) {
    for (const overlay of config.overlays) {
      addOverlay(canvas, overlay, size);
    }
  }

  canvas.renderAll();

  // Render to PNG buffer
  const dataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

function drawBackground(canvas, bgConfig, size) {
  const rect = new Rect({
    left: 0,
    top: 0,
    width: size.width,
    height: size.height,
    selectable: false,
  });

  if (bgConfig.type === 'solid') {
    rect.set('fill', bgConfig.color);
  } else if (bgConfig.type === 'gradient') {
    const colors = bgConfig.colors || ['#667eea', '#764ba2'];
    const colorStops = colors.map((color, i) => ({
      offset: i / Math.max(colors.length - 1, 1),
      color,
    }));

    // Diagonal gradient based on direction
    const angle = (bgConfig.direction || 180) * Math.PI / 180;
    rect.set('fill', new Gradient({
      type: 'linear',
      coords: {
        x1: 0,
        y1: 0,
        x2: Math.cos(angle) * size.width,
        y2: Math.sin(angle) * size.height,
      },
      colorStops,
    }));
  }

  canvas.add(rect);
}

async function placeProductImage(canvas, imageBuffer, zone, size) {
  try {
    // Convert buffer to data URL — this is the correct Fabric.js v6 method
    const base64 = imageBuffer.toString('base64');
    const mimeType = detectMime(imageBuffer);
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const img = await FabricImage.fromURL(dataUrl);

    // Parse zone percentages
    const zoneX = pct(zone.x, size.width);
    const zoneY = pct(zone.y, size.height);
    const zoneW = pct(zone.width, size.width);
    const zoneH = pct(zone.height, size.height);

    // Scale to fit within zone, keep aspect ratio
    const scaleX = zoneW / img.width;
    const scaleY = zoneH / img.height;
    const scale = Math.min(scaleX, scaleY) * 0.9;

    img.set({
      left: zoneX + (zoneW - img.width * scale) / 2,
      top: zoneY + (zoneH - img.height * scale) / 2,
      scaleX: scale,
      scaleY: scale,
      selectable: false,
    });

    canvas.add(img);
  } catch (err) {
    console.error('Failed to place product image:', err.message);
  }
}

function addTextOverlay(canvas, config, text, type, size) {
  const tz = config.textZone;
  const zoneX = pct(tz.x, size.width);
  const zoneY = pct(tz.y, size.height);
  const zoneW = pct(tz.width, size.width);

  let y = zoneY;

  if (type === 'ads') {
    // --- AD CREATIVE ---
    const hs = config.headlineStyle || {};
    const headline = text.headline || text.title || '';

    if (headline) {
      const t = new FabricText(wrapText(headline, 25), {
        left: zoneX,
        top: y,
        width: zoneW,
        fontFamily: 'Arial',
        fontSize: scaleFont(hs.fontSize || 40, size.width),
        fontWeight: hs.fontWeight || 700,
        fill: hs.color || '#ffffff',
        textAlign: hs.textAlign || 'center',
        selectable: false,
      });
      canvas.add(t);
      y += t.height + 24;
    }

    // CTA button
    const cs = config.ctaStyle || {};
    const cta = text.cta || 'Подробнее';

    const ctaFs = scaleFont(cs.fontSize || 18, size.width);
    const ctaLabel = new FabricText(cta, {
      fontFamily: 'Arial',
      fontSize: ctaFs,
      fontWeight: cs.fontWeight || 600,
      fill: cs.color || '#ffffff',
      selectable: false,
    });

    const padX = 40, padY = 16;
    const btnW = ctaLabel.width + padX * 2;
    const btnH = ctaLabel.height + padY * 2;
    const btnX = zoneX + (zoneW - btnW) / 2;

    const btnBg = new Rect({
      left: btnX, top: y,
      width: btnW, height: btnH,
      fill: cs.background || '#ffffff',
      rx: cs.borderRadius || 8,
      ry: cs.borderRadius || 8,
      selectable: false,
    });

    ctaLabel.set({ left: btnX + padX, top: y + padY });

    canvas.add(btnBg);
    canvas.add(ctaLabel);
  } else {
    // --- MARKETPLACE CARD ---
    const ts = config.titleStyle || {};
    const title = text.title || '';

    if (title) {
      const t = new FabricText(wrapText(title, 30), {
        left: zoneX,
        top: y,
        width: zoneW,
        fontFamily: 'Arial',
        fontSize: scaleFont(ts.fontSize || 34, size.width),
        fontWeight: ts.fontWeight || 700,
        fill: ts.color || '#1a1a1a',
        textAlign: ts.textAlign || 'center',
        selectable: false,
      });
      canvas.add(t);
      y += t.height + 20;
    }

    // Bullets
    const bs = config.bulletStyle || {};
    const bullets = text.bullets || [];
    const icon = bs.icon || '✓';

    for (let i = 0; i < Math.min(bullets.length, 5); i++) {
      const line = `${icon} ${bullets[i]}`;
      const bt = new FabricText(wrapText(line, 40), {
        left: zoneX + 16,
        top: y,
        width: zoneW - 32,
        fontFamily: 'Arial',
        fontSize: scaleFont(bs.fontSize || 18, size.width),
        fontWeight: bs.fontWeight || 400,
        fill: bs.color || '#555555',
        selectable: false,
      });
      canvas.add(bt);
      y += bt.height + 10;
    }
  }
}

function addOverlay(canvas, overlay, size) {
  if (overlay.type === 'badge') {
    const fontSize = 14;
    const pad = 12;

    const label = new FabricText(overlay.text, {
      fontFamily: 'Arial',
      fontSize,
      fontWeight: 700,
      fill: overlay.style?.color || '#ffffff',
      selectable: false,
    });

    const bw = label.width + pad * 2;
    const bh = label.height + pad;

    let x = size.width - bw - 20;
    let y = 20;
    if (overlay.position === 'top-left') x = 20;
    if (overlay.position === 'bottom-right') y = size.height - bh - 20;

    const bg = new Rect({
      left: x, top: y, width: bw, height: bh,
      fill: overlay.style?.background || '#ff0000',
      rx: 6, ry: 6,
      selectable: false,
    });

    label.set({ left: x + pad, top: y + pad / 2 });

    canvas.add(bg);
    canvas.add(label);
  }
}

// === Helpers ===

function pct(val, total) {
  if (typeof val === 'string' && val.endsWith('%')) {
    return (parseFloat(val) / 100) * total;
  }
  return parseFloat(val) || 0;
}

function scaleFont(base, canvasWidth) {
  return Math.round(base * (canvasWidth / 1080));
}

function wrapText(text, maxChars) {
  if (!text || text.length <= maxChars) return text;
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current += ' ' + word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.join('\n');
}

function detectMime(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg';
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'image/webp';
  return 'image/png';
}

/**
 * Save rendered card to disk and return the public URL
 */
export async function saveRenderedCard(buffer, generationId) {
  const outputDir = path.join(process.cwd(), 'public', 'generated');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const filename = `${generationId}.png`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, buffer);

  return `/generated/${filename}`;
}

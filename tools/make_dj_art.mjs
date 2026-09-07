
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const sharp = createRequire(path.join(process.cwd(), 'noop.js'))('sharp');

const NAMES = ['idle', 'talk', 'dig', 'play'];
const OUT_W = 720, OUT_H = 780;
const SIDE_MARGIN = 0.08;
const TOP_MARGIN = 0.03;
const INK = [0x24, 0x1a, 0x12];

function isBackdrop(r, g, b) {
  const lo = Math.min(r, g, b), hi = Math.max(r, g, b);
  return lo >= 238 && hi - lo <= 8;
}

function cutBackdrop(data, W, H, C) {
  const bg = new Uint8Array(W * H);
  const queue = new Int32Array(W * H);
  let head = 0, tail = 0;
  const push = (p) => {
    if (bg[p]) return;
    const i = p * C;
    if (!isBackdrop(data[i], data[i + 1], data[i + 2])) return;
    bg[p] = 1; queue[tail++] = p;
  };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (head < tail) {
    const p = queue[head++], x = p % W, y = (p / W) | 0;
    if (x > 0) push(p - 1);
    if (x < W - 1) push(p + 1);
    if (y > 0) push(p - W);
    if (y < H - 1) push(p + W);
  }
  return bg;
}

function contentBox(bg, W, H) {
  let x0 = W, x1 = -1, y0 = H, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (bg[y * W + x]) continue;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { x0, x1, y0, y1 };
}

/** Head anchor: top of content + horizontal center of upper 38% (head+beret). */
function headAnchor(bg, W, H, box) {
  const yCut = box.y0 + Math.round((box.y1 - box.y0) * 0.38);
  let sx = 0, n = 0;
  for (let y = box.y0; y <= yCut; y++) for (let x = box.x0; x <= box.x1; x++) {
    if (bg[y * W + x]) continue;
    sx += x; n++;
  }
  return { ax: n ? sx / n : (box.x0 + box.x1) / 2, ay: box.y0 };
}

const frames = [];
for (const name of NAMES) {
  const { data, info } = await sharp(`${name}-raw.png`).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const bg = cutBackdrop(data, W, H, C);
  const box = contentBox(bg, W, H);
  const head = headAnchor(bg, W, H, box);
  const rgba = Buffer.alloc(W * H * 4);
  for (let p = 0; p < W * H; p++) {
    const s = p * C, d = p * 4;
    if (bg[p]) { rgba[d]=INK[0]; rgba[d+1]=INK[1]; rgba[d+2]=INK[2]; rgba[d+3]=0; }
    else { rgba[d]=data[s]; rgba[d+1]=data[s+1]; rgba[d+2]=data[s+2]; rgba[d+3]=255; }
  }
  frames.push({ name, W, H, rgba, box, head });
  console.log(`${name}: head ${Math.round(head.ax)},${Math.round(head.ay)}  content ${box.x0}..${box.x1}/${box.y0}..${box.y1}`);
}

let RX0=Infinity,RX1=-Infinity,RY0=Infinity,RY1=-Infinity;
for (const f of frames) {
  RX0 = Math.min(RX0, f.box.x0 - f.head.ax);
  RX1 = Math.max(RX1, f.box.x1 - f.head.ax);
  RY0 = Math.min(RY0, f.box.y0 - f.head.ay);
  RY1 = Math.max(RY1, f.box.y1 - f.head.ay);
}
const unionW = RX1 - RX0, unionH = RY1 - RY0;
const scale = Math.min((OUT_W * (1 - 2 * SIDE_MARGIN)) / unionW, (OUT_H * (1 - TOP_MARGIN)) / unionH);
const anchorX = OUT_W / 2 - ((RX0 + RX1) / 2) * scale;
const anchorY = OUT_H * TOP_MARGIN - RY0 * scale;
console.log(`union ${Math.round(unionW)}x${Math.round(unionH)} scale ${scale.toFixed(4)} anchor ${Math.round(anchorX)},${Math.round(anchorY)}`);

fs.mkdirSync('out', { recursive: true });
for (const f of frames) {
  const w = Math.round(f.W * scale), h = Math.round(f.H * scale);
  const { data: src } = await sharp(f.rgba, { raw: { width: f.W, height: f.H, channels: 4 } })
    .resize(w, h, { kernel: 'lanczos3' }).raw().toBuffer({ resolveWithObject: true });
  const left = Math.round(anchorX - f.head.ax * scale);
  const top = Math.round(anchorY - f.head.ay * scale);
  const canvas = Buffer.alloc(OUT_W * OUT_H * 4, 0);
  for (let y = Math.max(0, -top); y < h; y++) {
    const dy = y + top; if (dy >= OUT_H) break;
    for (let x = Math.max(0, -left); x < w; x++) {
      const dx = x + left; if (dx >= OUT_W) break;
      src.copy(canvas, (dy * OUT_W + dx) * 4, (y * w + x) * 4, (y * w + x) * 4 + 4);
    }
  }
  await sharp(canvas, { raw: { width: OUT_W, height: OUT_H, channels: 4 } })
    .webp({ quality: 84, alphaQuality: 92, effort: 6 })
    .toFile(`out/dj-${f.name}.webp`);
  console.log(`dj-${f.name}.webp placed ${left},${top}`);
}

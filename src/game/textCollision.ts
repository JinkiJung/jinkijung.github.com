// The alpha mask follows actual glyphs, so spaces and counters remain open.
export function hitTextMask(mask: Uint8ClampedArray, width: number, height: number, sx: number, sy: number, x: number, y: number, dx: number, dy: number) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx * sx), Math.abs(dy * sy)) * 2));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, px = Math.floor((x + dx * t) * sx), py = Math.floor((y + dy * t) * sy);
    if (px >= 0 && py >= 0 && px < width && py < height && mask[(py * width + px) * 4 + 3] >= 48) return t;
  }
  return Infinity;
}

export function segmentCircle(x: number, y: number, dx: number, dy: number, cx: number, cy: number, radius: number) {
  const ox = x - cx, oy = y - cy, c = ox * ox + oy * oy - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy;
  if (!a) return Infinity;
  const b = ox * dx + oy * dy, d = b * b - a * c;
  if (d < 0) return Infinity;
  const t = (-b - Math.sqrt(d)) / a;
  return t >= 0 && t <= 1 ? t : Infinity;
}

// Reflect against a locally estimated glyph edge; degenerate thin strokes
// fall back to the incoming direction so the round always returns outside.
export function reflectText(mask: Uint8ClampedArray, width: number, height: number, sx: number, sy: number, x: number, y: number, vx: number, vy: number) {
  const px = Math.floor(x * sx), py = Math.floor(y * sy);
  let nx = 0, ny = 0;
  for (let oy = -3; oy <= 3; oy++) for (let ox = -3; ox <= 3; ox++) {
    const xx = px + ox, yy = py + oy;
    if (xx >= 0 && yy >= 0 && xx < width && yy < height && mask[(yy * width + xx) * 4 + 3] >= 48) { nx -= ox / sx; ny -= oy / sy; }
  }
  let length = Math.hypot(nx, ny);
  if (length < .001) { nx = -vx; ny = -vy; length = Math.hypot(nx, ny) || 1; }
  nx /= length; ny /= length;
  const dot = vx * nx + vy * ny;
  if (dot >= 0) return { vx: -vx * .65, vy: -vy * .65 };
  return { vx: (vx - 2 * dot * nx) * .65, vy: (vy - 2 * dot * ny) * .65 };
}

// Text blocks are cover: seal inter-letter spaces and line spacing, while
// keeping the visual layer unchanged. All actors and projectiles share this mask.
export function sealTextRegions(mask: Uint8ClampedArray, width: number, height: number, sx: number, sy: number, regions: Array<{ x: number; y: number; w: number; h: number }>, alpha = 255) {
  for (const r of regions) {
    const left = Math.max(0, Math.floor(r.x * sx)), right = Math.min(width, Math.ceil((r.x + r.w) * sx));
    const top = Math.max(0, Math.floor(r.y * sy)), bottom = Math.min(height, Math.ceil((r.y + r.h) * sy));
    for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) mask[(y * width + x) * 4 + 3] = alpha;
  }
}

export function safeMuzzle(x: number, y: number, angle: number, distance: number, hit: (x: number, y: number, dx: number, dy: number) => number) {
  const cos = Math.cos(angle), sin = Math.sin(angle), t = hit(x, y, cos * distance, sin * distance);
  const reach = t === Infinity ? distance : Math.max(0, t * distance - 1);
  return { x: x + cos * reach, y: y + sin * reach };
}

// Tighten DOM font boxes to actual glyph ink, then seal spaces within each line.
// Measure every line before filling so one sealed region cannot enlarge another.
export function sealRenderedTextLines(mask: Uint8ClampedArray, width: number, height: number, sx: number, sy: number, lines: Array<{ x: number; y: number; w: number; h: number }>) {
  const bounds = [];
  for (const r of lines) {
    const left = Math.max(0, Math.floor(r.x * sx)), right = Math.min(width, Math.ceil((r.x + r.w) * sx));
    const top = Math.max(0, Math.floor(r.y * sy)), bottom = Math.min(height, Math.ceil((r.y + r.h) * sy));
    let x0 = right, x1 = left, y0 = bottom, y1 = top;
    for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
      if (mask[(y * width + x) * 4 + 3] < 48) continue;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x + 1);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y + 1);
    }
    if (x1 > x0 && y1 > y0) bounds.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
  }
  sealTextRegions(mask, width, height, 1, 1, bounds);
}

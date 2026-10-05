export interface Rect { x: number; y: number; w: number; h: number; id: number }
export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Swept collision: even a fast bullet cannot skip a thin component.
export function segmentRect(x: number, y: number, dx: number, dy: number, r: Rect): number {
  let enter = 0, leave = 1;
  if (Math.abs(dx) < 1e-8) {
    if (x < r.x || x > r.x + r.w) return Infinity;
  } else {
    const a = (r.x - x) / dx, b = (r.x + r.w - x) / dx;
    enter = Math.max(enter, Math.min(a, b)); leave = Math.min(leave, Math.max(a, b));
  }
  if (Math.abs(dy) < 1e-8) {
    if (y < r.y || y > r.y + r.h) return Infinity;
  } else {
    const a = (r.y - y) / dy, b = (r.y + r.h - y) / dy;
    enter = Math.max(enter, Math.min(a, b)); leave = Math.min(leave, Math.max(a, b));
  }
  if (enter > leave) return Infinity;
  return enter;
}

// Rectangle boundaries partition the screen without overlap or hidden layers.
export function partition(width: number, height: number, targets: Rect[]): Rect[] {
  const xs = new Set([0, width]), ys = new Set([0, height]);
  for (const r of targets) {
    xs.add(clamp(r.x, 0, width)); xs.add(clamp(r.x + r.w, 0, width));
    ys.add(clamp(r.y, 0, height)); ys.add(clamp(r.y + r.h, 0, height));
  }
  const xx = [...xs].sort((a, b) => a - b), yy = [...ys].sort((a, b) => a - b);
  const cells: Rect[] = [];
  let emptyId = -1;
  for (let j = 0; j < yy.length - 1; j++) for (let i = 0; i < xx.length - 1; i++) {
    const x = xx[i], y = yy[j], w = xx[i + 1] - x, h = yy[j + 1] - y;
    if (w < 0.01 || h < 0.01) continue;
    const target = targets.find(r => x + w / 2 >= r.x && x + w / 2 <= r.x + r.w && y + h / 2 >= r.y && y + h / 2 <= r.y + r.h);
    const nx = Math.ceil(w / 56), ny = Math.ceil(h / 56);
    for (let cy = 0; cy < ny; cy++) for (let cx = 0; cx < nx; cx++) {
      cells.push({ x: x + cx * w / nx, y: y + cy * h / ny, w: w / nx, h: h / ny, id: target?.id ?? emptyId-- });
    }
  }
  return cells;
}

// Clip a swept bullet against a convex triangle, including edge/vertex hits.
export function segmentTriangle(x: number, y: number, dx: number, dy: number, points: number[]): number {
  let enter = 0, leave = 1;
  for (let i = 0; i < 6; i += 2) {
    const j = (i + 2) % 6;
    const ex = points[j] - points[i], ey = points[j + 1] - points[i + 1];
    const side = ex * (y - points[i + 1]) - ey * (x - points[i]);
    const speed = ex * dy - ey * dx;
    if (Math.abs(speed) < 1e-8) { if (side < -1e-8) return Infinity; }
    else if (speed > 0) enter = Math.max(enter, -side / speed);
    else leave = Math.min(leave, -side / speed);
    if (enter > leave) return Infinity;
  }
  return enter;
}

export const IMPACT_RADIUS = 30;
export function inImpactRadius(cx: number, cy: number, x: number, y: number) {
  return (cx - x) ** 2 + (cy - y) ** 2 <= IMPACT_RADIUS ** 2;
}

// A character's entire footprint must be clear, not only its center point.
export function circleTouchesTriangle(x: number, y: number, radius: number, points: number[]) {
  if (segmentTriangle(x, y, 0, 0, points) === 0) return true;
  for (let i = 0; i < 6; i += 2) {
    const j = (i + 2) % 6, dx = points[j] - points[i], dy = points[j + 1] - points[i + 1];
    const length2 = dx * dx + dy * dy;
    const t = length2 ? clamp(((x - points[i]) * dx + (y - points[i + 1]) * dy) / length2, 0, 1) : 0;
    if ((x - points[i] - t * dx) ** 2 + (y - points[i + 1] - t * dy) ** 2 <= radius * radius) return true;
  }
  return false;
}

export function rectTouchesTriangle(r: { x: number; y: number; w: number; h: number }, points: number[]) {
  for (let i = 0; i < 6; i += 2) if (points[i] >= r.x && points[i] <= r.x + r.w && points[i + 1] >= r.y && points[i + 1] <= r.y + r.h) return true;
  return segmentTriangle(r.x, r.y, r.w, 0, points) <= 1 ||
    segmentTriangle(r.x + r.w, r.y, 0, r.h, points) <= 1 ||
    segmentTriangle(r.x + r.w, r.y + r.h, -r.w, 0, points) <= 1 ||
    segmentTriangle(r.x, r.y + r.h, 0, -r.h, points) <= 1;
}

// Reflect off the closest edge without adding energy.
export function reflectTriangle(points: number[], x: number, y: number, vx: number, vy: number) {
  let best = Infinity, nx = 0, ny = 0;
  for (let i = 0; i < 6; i += 2) {
    const j = (i + 2) % 6, ex = points[j] - points[i], ey = points[j + 1] - points[i + 1];
    const length = Math.hypot(ex, ey);
    if (!length) continue;
    const t = clamp(((x - points[i]) * ex + (y - points[i + 1]) * ey) / (length * length), 0, 1);
    const distance = Math.hypot(x - points[i] - t * ex, y - points[i + 1] - t * ey);
    if (distance < best) { best = distance; nx = -ey / length; ny = ex / length; }
  }
  const dot = vx * nx + vy * ny;
  return { vx: vx - 2 * dot * nx, vy: vy - 2 * dot * ny };
}

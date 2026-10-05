import { segmentCircle } from './textCollision.ts';

// Reach is 1.5 times the player's 32px collision diameter; a 120-degree fan.
export const MELEE_RADIUS = 48;
export const MELEE_HALF_ANGLE = Math.PI / 3;
export const MELEE_COOLDOWN = .4;
export type MeleeRay = { dx: number; dy: number };
type TextHit = (x: number, y: number, dx: number, dy: number) => number;

export function meleeFan(x: number, y: number, angle: number, textHit: TextHit, radius = MELEE_RADIUS, halfAngle = MELEE_HALF_ANGLE) {
  const rays: MeleeRay[] = [];
  let impact: { x: number; y: number } | null = null;
  let closest = Infinity;
  // At most one pixel between ray tips, including both sector edges.
  const steps = Math.ceil(2 * halfAngle * radius);
  for (let i = 0; i <= steps; i++) {
    const a = angle - halfAngle + 2 * halfAngle * i / steps;
    const dx = Math.cos(a) * radius, dy = Math.sin(a) * radius;
    const hit = textHit(x, y, dx, dy);
    if (hit <= 1 && hit < closest) { closest = hit; impact = { x: x + dx * hit, y: y + dy * hit }; }
    const reach = hit <= 1 ? Math.max(0, hit - 1 / radius) : 1;
    rays.push({ dx: dx * reach, dy: dy * reach });
  }
  return { rays, impact };
}

export function meleeHitsBody(x: number, y: number, rays: MeleeRay[], targetX: number, targetY: number, radius = 17) {
  return rays.some(ray => segmentCircle(x, y, ray.dx, ray.dy, targetX, targetY, radius) <= 1);
}

export function recoilStep(vx: number, vy: number, dt: number) {
  const decay = Math.exp(-7 * dt);
  return { x: vx * (1 - decay) / 7, y: vy * (1 - decay) / 7, vx: vx * decay, vy: vy * decay };
}

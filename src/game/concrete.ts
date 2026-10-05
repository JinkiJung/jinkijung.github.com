import type { MeleeRay } from './melee';
import { segmentRect, type Rect } from './geometry.ts';
export type ConcretePlate = Rect & { active: boolean; direction?: 1 | -1 };
const FALL_TIME = .62;
function projectRect(p:ConcretePlate,r:Rect):Rect {
  return p.direction===-1?{...r,y:2*p.y+p.h-r.y-r.h}:r;
}

export function createConcretePlates(rects: ConcretePlate[]) {
  const plates = rects.map(rect => ({ ...rect, age: -1, sweptBottom: rect.y, playerOwned: false }));
  return {
    hitTest(x: number, y: number, dx: number, dy: number) {
      let t = Infinity, index = -1;
      plates.forEach((p, i) => {
        if (p.age >= 0) return;
        const contact = segmentRect(x, y, dx, dy, p);
        if (contact < t) { t = contact; index = i; }
      });
      return { t, index };
    },
    meleeHits(x: number, y: number, rays: MeleeRay[]) {
      return plates.flatMap((p, index) => p.age < 0 && rays.some(ray => segmentRect(x, y, ray.dx, ray.dy, p) <= 1) ? [index] : []);
    },
    topple(index: number, playerOwned = true) {
      const p = plates[index];
      if (!p || p.age >= 0) return false;
      p.age = 0; p.playerOwned = playerOwned; return true;
    },
    update(dt: number, sweep?: (rect: Rect, playerOwned: boolean) => void) {
      for (const p of plates) if (p.age >= 0) {
        p.age = Math.min(FALL_TIME + .2, p.age + dt);
        const t = Math.min(1, p.age / FALL_TIME);
        const bottom = p.y + p.h + Math.sin(Math.PI / 2 * t * t) * 80;
        if (bottom > p.sweptBottom) {
          sweep?.(projectRect(p,{ x: p.x, y: p.sweptBottom, w: p.w, h: bottom - p.sweptBottom, id: p.id }), p.playerOwned);
          p.sweptBottom = bottom;
        }
      }
    },
    supportRegions() {
      return plates.map(p => {
        const t = p.age < 0 ? 0 : Math.min(1, p.age / FALL_TIME);
        const angle = Math.PI / 2 * t * t;
        const bounce = p.age > FALL_TIME ? Math.sin((p.age - FALL_TIME) / .2 * Math.PI) * 2 : 0;
        const hinge = p.y + p.h;
        const far = hinge + Math.sin(angle) * 80 - bounce - (p.h * Math.cos(angle) + 3 * Math.sin(angle));
        const y = Math.min(hinge, far);
        return projectRect(p,{ x: p.x, y, w: p.w, h: Math.max(hinge, far + 3) - y, id:p.id });
      });
    },
    draw(ctx: CanvasRenderingContext2D, cameraY: number, viewHeight: number) {
      for (const p of plates) {
        if (p.y + 110 < cameraY || p.y - 110 > cameraY + viewHeight) continue;
        const t = p.age < 0 ? 0 : Math.min(1, p.age / FALL_TIME);
        // Accelerate under gravity; a small landing rebound settles on the ground.
        const angle = Math.PI / 2 * t * t;
        const bounce = p.age > FALL_TIME ? Math.sin((p.age - FALL_TIME) / .2 * Math.PI) * 2 : 0;
        const depth = Math.sin(angle) * 80 - bounce;
        const thickness = p.h * Math.cos(angle) + 3 * Math.sin(angle);
        const hinge = p.y + p.h, far = hinge + depth - thickness;
        ctx.save(); if(p.direction===-1){ctx.translate(0,2*p.y+p.h);ctx.scale(1,-1);} ctx.lineJoin = 'round';
        ctx.fillStyle = '#0003';
        ctx.beginPath(); ctx.moveTo(p.x + 3, hinge + 3); ctx.lineTo(p.x + p.w + 3, hinge + 3);
        ctx.lineTo(p.x + p.w + 7, Math.max(hinge, far) + 9); ctx.lineTo(p.x + 7, Math.max(hinge, far) + 9); ctx.closePath(); ctx.fill();
        const gray = Math.round((p.active ? 126 : 168) + Math.sin(angle) * 27);
        const shade = ctx.createLinearGradient(0, Math.min(hinge, far), 0, Math.max(hinge, far) + 1);
        shade.addColorStop(0, `rgb(${gray},${gray + 2},${gray + 1})`);
        shade.addColorStop(1, `rgb(${gray - 20},${gray - 18},${gray - 19})`);
        ctx.fillStyle = shade; ctx.strokeStyle = '#666b68'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x, hinge); ctx.lineTo(p.x + p.w, hinge);
        ctx.lineTo(p.x + p.w, far); ctx.lineTo(p.x, far); ctx.closePath(); ctx.fill(); ctx.stroke();
        // The exposed edge gives the slab thickness rather than looking like a flat scale animation.
        ctx.fillStyle = '#737975';
        ctx.beginPath(); ctx.moveTo(p.x, far); ctx.lineTo(p.x + p.w, far);
        ctx.lineTo(p.x + p.w, far + 3); ctx.lineTo(p.x, far + 3); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffffff55'; ctx.beginPath(); ctx.moveTo(p.x + 1, far); ctx.lineTo(p.x + p.w - 1, far); ctx.stroke();
        // Subtle fixed concrete pores, no particles or textures allocated per hit.
        ctx.fillStyle = '#414a452b';
        for (let i = 1; i <= 7; i++) ctx.fillRect(p.x + p.w * i / 8, hinge + (far - hinge) * (.25 + (i % 3) * .2), 1.5, 1);
        ctx.restore();
      }
    },
  };
}

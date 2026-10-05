import { segmentRect } from './geometry.ts';
export type Pit = { x: number; y: number; w: number; h: number };

export function crossesPit(x: number, y: number, nextX: number, nextY: number, pits: Pit[], bridges: Pit[] = []) {
  const dx = nextX - x, dy = nextY - y;
  const interval = (r: Pit) => {
    const rect = { ...r, id: 0 };
    return { start: segmentRect(x, y, dx, dy, rect), end: 1 - segmentRect(nextX, nextY, -dx, -dy, rect) };
  };
  const supports = bridges.map(interval).filter(r => r.start <= r.end).sort((a, b) => a.start - b.start);
  return pits.some(p => {
    const danger = interval(p);
    if (danger.start > danger.end) return false;
    let covered = danger.start;
    for (const support of supports) {
      if (support.end < covered) continue;
      if (support.start > covered + 1e-8) return true;
      covered = Math.max(covered, support.end);
      if (covered >= danger.end - 1e-8) return false;
    }
    return true;
  });
}

// Recoil crosses gaps in flight; only its final position needs support.
export function playerCrossesPit(x:number,y:number,nextX:number,nextY:number,pits:Pit[],bridges:Pit[],recoiling:boolean,recoilRemaining:number) {
  if (recoiling) return recoilRemaining <= 0 && crossesPit(nextX,nextY,nextX,nextY,pits,bridges);
  return crossesPit(x,y,nextX,nextY,pits,bridges);
}

export const FALL_DURATION = .85;
export function fallPose(age: number) {
  const t = Math.max(0, Math.min(1, age / FALL_DURATION));
  return { scale: Math.pow(1 - t, 1.4), drop: 38 * t * t, alpha: 1 - t * t };
}

export function createPits(pits: Pit[], drawPlayer?: (ctx:CanvasRenderingContext2D)=>void, drawEnemy?: (ctx:CanvasRenderingContext2D,skin:number)=>void) {
  const falls: { x: number; y: number; player: boolean; age: number; angle: number; pit: Pit; skin?:number }[] = [];
  return {
    fall(x: number, y: number, player: boolean, angle = 0, fromX = x, fromY = y, skin?:number) {
      const pit = pits.find((p, id) => segmentRect(fromX, fromY, x - fromX, y - fromY, { ...p, id }) <= 1);
      if (!pit) return;
      if (falls.length >= 12) falls.shift();
      falls.push({ x: Math.max(pit.x, Math.min(pit.x + pit.w, x)), y: Math.max(pit.y + 3, Math.min(pit.y + pit.h - 3, y)), player, age: 0, angle, pit, skin });
    },
    update(dt: number) {
      for (let i = falls.length - 1; i >= 0; i--) {
        falls[i].age += dt;
        if (falls[i].age >= FALL_DURATION) falls.splice(i, 1);
      }
    },
    draw(ctx: CanvasRenderingContext2D, cameraY: number, viewHeight: number) {
      ctx.save();
      for (const p of pits) {
        if (p.y + p.h < cameraY || p.y > cameraY + viewHeight) continue;
        ctx.fillStyle = '#020506'; ctx.fillRect(p.x, p.y, p.w, p.h);
        const wall = ctx.createLinearGradient(0, p.y, 0, p.y + Math.min(16, p.h * .55));
        wall.addColorStop(0, '#424b4e'); wall.addColorStop(1, '#080d0f');
        ctx.fillStyle = wall; ctx.fillRect(p.x, p.y, p.w, Math.min(16, p.h * .55));
        ctx.strokeStyle = '#85938d'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x, p.y + p.h - .5); ctx.lineTo(p.x + p.w, p.y + p.h - .5); ctx.stroke();
        ctx.strokeStyle = '#0008'; ctx.strokeRect(p.x + .5, p.y + .5, p.w - 1, p.h - 1);
      }
      for (const f of falls) {
        const pose = fallPose(f.age);
        ctx.save();
        ctx.beginPath(); ctx.rect(f.pit.x, f.pit.y, f.pit.w, f.pit.h); ctx.clip();
        ctx.translate(f.x, f.y + pose.drop); ctx.rotate(f.angle + f.age * .45);
        ctx.scale(pose.scale, pose.scale); ctx.globalAlpha = pose.alpha;
        if(!f.player && f.skin!==undefined && drawEnemy){drawEnemy(ctx,f.skin);ctx.restore();continue;}
        if(f.player && drawPlayer){drawPlayer(ctx);ctx.restore();continue;}
        ctx.fillStyle = f.player ? '#83e6c1' : '#812d30'; ctx.strokeStyle = '#d8e2ca'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(-12, -12, 24, 24, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = f.player ? '#d5ffef' : '#ffb082';
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a2c31'; ctx.fillRect(3, -7, 6, 14); ctx.fillRect(9, 6, 18, 5);
        ctx.restore();
      }
      ctx.restore();
    },
  };
}

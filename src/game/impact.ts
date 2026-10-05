export type ImpactKind = 'player' | 'shot' | 'melee';
const styles = {
  player: { duration: .24, radius: 26, color: '#ff9b87', width: 1.5 },
  shot: { duration: .14, radius: 16, color: '#ffe5be', width: 1.3 },
  melee: { duration: .22, radius: 32, color: '#d5fff0', width: 2 },
};

/** A bounded pool; lethal hits remain visible after the character disappears. */
export function createImpacts() {
  const pool = Array.from({ length: 16 }, () => ({ x: 0, y: 0, age: 1, kind: 'shot' as ImpactKind }));
  let next = 0;
  return {
    add(x: number, y: number, kind: ImpactKind) {
      Object.assign(pool[next], { x, y, kind, age: 0 });
      next = (next + 1) % pool.length;
    },
    update(dt: number) { for (const p of pool) p.age += dt; },
    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      for (const p of pool) {
        const style = styles[p.kind], t = p.age / style.duration;
        if (t >= 1) continue;
        const radius = 6 + (style.radius - 6) * (1 - (1 - t) ** 2);
        ctx.globalAlpha = (1 - t) * .65;
        ctx.strokeStyle = style.color; ctx.lineWidth = style.width;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.stroke();
        if (p.kind === 'melee') {
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            const a = Math.PI / 4 + i * Math.PI / 2;
            ctx.moveTo(p.x + Math.cos(a) * (radius + 3), p.y + Math.sin(a) * (radius + 3));
            ctx.lineTo(p.x + Math.cos(a) * (radius + 7), p.y + Math.sin(a) * (radius + 7));
          }
          ctx.stroke();
        }
      }
      ctx.restore();
    },
  };
}

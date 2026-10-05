import type { Point } from './navigation';

type Grid = { width: number; height: number; cols: number; rows: number; blocked: Uint8Array; cellSize: number };

/** Precompute clearance once; spawning never rescans the glyph texture. */
export function createRespawnPicker(grid: Grid, excluded: { x: number; y: number; w: number; h: number }[] = []) {
  const { cols, rows, cellSize: cell } = grid;
  const blocked = grid.blocked.slice();
  for (const r of excluded) {
    const left = Math.max(0, Math.floor((r.x - 20) / cell)), right = Math.min(cols - 1, Math.ceil((r.x + r.w + 20) / cell));
    const top = Math.max(0, Math.floor((r.y - 20) / cell)), bottom = Math.min(rows - 1, Math.ceil((r.y + r.h + 20) / cell));
    for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) blocked[y * cols + x] = 1;
  }
  const stride = cols + 1, sums = new Uint32Array(stride * (rows + 1));
  for (let y = 0; y < rows; y++) {
    let row = 0;
    for (let x = 0; x < cols; x++) {
      row += blocked[y * cols + x];
      sums[(y + 1) * stride + x + 1] = sums[y * stride + x + 1] + row;
    }
  }
  const tiers = new Uint8Array(cols * rows);
  const emptySquare = (x: number, y: number, radius: number) => {
    const r = Math.ceil(radius / cell), l = x - r, t = y - r, right = x + r + 1, bottom = y + r + 1;
    if (l < 0 || t < 0 || right > cols || bottom > rows) return false;
    return sums[bottom * stride + right] - sums[t * stride + right] - sums[bottom * stride + l] + sums[t * stride + l] === 0;
  };
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const i = y * cols + x;
    if (!blocked[i]) tiers[i] = emptySquare(x, y, 48) ? 3 : emptySquare(x, y, 24) ? 2 : 1;
  }
  let cachedTop = -1, cachedBottom = -1;
  const candidates: number[] = [];
  return (cameraY: number, viewHeight: number, random = Math.random, bounds = { top: 0, bottom: grid.height }, usable?: (point:Point)=>boolean): Point | null => {
    const top = Math.max(0, Math.ceil((Math.max(90, cameraY + 100, bounds.top + 20)) / cell - .5));
    const bottom = Math.min(rows - 1, Math.floor(Math.min(grid.height - 30, cameraY + viewHeight - 70, bounds.bottom - 20) / cell - .5));
    if (top !== cachedTop || bottom !== cachedBottom) {
      cachedTop = top; cachedBottom = bottom; candidates.length = 0;
      const left = Math.max(0, Math.ceil(30 / cell - .5)), right = Math.min(cols - 1, Math.floor((grid.width - 30) / cell - .5));
      for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
        const i = y * cols + x, tier = tiers[i];
        if (!tier) continue;
        candidates.push(i);
      }
    }
    if (!candidates.length) return null;
    const start=Math.min(candidates.length-1,Math.floor(random()*candidates.length));
    for(let tier=3;tier>=1;tier--)for(let n=0;n<candidates.length;n++){
      const i=candidates[(start+n)%candidates.length];if(tiers[i]!==tier)continue;
      const point={x:(i%cols+.5)*cell,y:(Math.floor(i/cols)+.5)*cell};
      if(!usable || usable(point))return point;
    }
    return null;
  };
}

export function originalPageCamera(cameraY:number,viewHeight:number,page:{top:number;bottom:number}) {
  return Math.max(page.top,Math.min(Math.max(page.top,page.bottom-viewHeight),cameraY));
}

// Keep a visible safety gap around the live player, including large Juggernauts.
export const ENEMY_SPAWN_PLAYER_DISTANCE = 120;
export function enemySpawnClear(point:Point, player:Point) {
  return (point.x-player.x)**2+(point.y-player.y)**2 >= ENEMY_SPAWN_PLAYER_DISTANCE**2;
}

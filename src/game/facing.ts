/** Facing is independent of velocity so stopping, blocked steps and ice preserve aim. */
export function keyFacing(code: string): number | undefined {
  switch (code) {
    case 'KeyD': case 'ArrowRight': return 0;
    case 'KeyS': case 'ArrowDown': return Math.PI / 2;
    case 'KeyA': case 'ArrowLeft': return Math.PI;
    case 'KeyW': case 'ArrowUp': return -Math.PI / 2;
    default: return undefined;
  }
}

export function cardinalFacing(dx: number, dy: number): number {
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? Math.PI : 0;
  return dy < 0 ? -Math.PI / 2 : Math.PI / 2;
}

/** Set iteration preserves physical key press order; repeat does not reorder it. */
export function heldFacing(keys: ReadonlySet<string>, fallback: number): number {
  let angle = fallback;
  for (const code of keys) {
    const facing = keyFacing(code);
    if (facing !== undefined) angle = facing;
  }
  return angle;
}

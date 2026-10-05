// A stable 70% central band; follow only after entering the outer 15%.
export function followPage(cameraY: number, playerY: number, viewportHeight: number, worldHeight: number, dt: number) {
  const screenY = playerY - cameraY;
  let target = cameraY;
  if (screenY < viewportHeight * .15) target = playerY - viewportHeight * .15;
  else if (screenY > viewportHeight * .85) target = playerY - viewportHeight * .85;
  target = Math.max(0, Math.min(Math.max(0, worldHeight - viewportHeight), target));
  return cameraY + (target - cameraY) * (1 - Math.exp(-16 * dt));
}

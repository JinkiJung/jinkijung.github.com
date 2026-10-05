// The living -> dead transition is the only scoring boundary. The same enemy
// object may respawn later; resetting its HP starts a new life, not a new run.
export function damageEnemyOnce<T extends { hp: number; respawn: number }>(enemy: T, damage: number, onDeath: () => void): boolean {
  if (enemy.hp <= 0) return false;
  enemy.hp = Math.max(0, enemy.hp - damage);
  if (enemy.hp === 0) { enemy.respawn = 4; onDeath(); }
  return true;
}

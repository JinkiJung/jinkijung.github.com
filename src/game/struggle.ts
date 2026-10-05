/** Deliberate rapid direction changes, never operating-system key repeat. */
export function createStruggle() {
  let taps: { direction: number; time: number }[] = [];
  return {
    reset() { taps = []; },
    press(direction: number, time: number, repeat = false) {
      if (repeat) return false;
      taps = taps.filter(tap => time - tap.time <= 900);
      if (taps[taps.length - 1]?.direction === direction) return false;
      taps.push({ direction, time });
      if (taps.length < 4) return false;
      taps = [];
      return true;
    },
  };
}

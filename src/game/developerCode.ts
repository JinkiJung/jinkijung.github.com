const SECRET = 'skroqkfwkdu';

export function createDeveloperCode() {
  let buffer = '';
  return {
    reset() { buffer = ''; },
    press(code: string, repeat = false) {
      if (repeat) return false;
      if (!/^Key[A-Z]$/.test(code)) { buffer = ''; return false; }
      buffer = (buffer + code.slice(3).toLowerCase()).slice(-SECRET.length);
      if (buffer !== SECRET) return false;
      buffer = '';
      return true;
    },
  };
}

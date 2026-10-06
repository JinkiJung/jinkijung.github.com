export const GAME_LAUNCH_EVENT = 'smash:launch';
export function launchGame() { window.dispatchEvent(new Event(GAME_LAUNCH_EVENT)); }

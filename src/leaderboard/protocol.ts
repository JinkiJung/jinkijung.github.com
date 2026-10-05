export const VERSION = 'jinki-v2';
export const MAX_SCORE = 3_520_000_000;
export type Evidence = {
  playerGlassShards: number; slabGlassShards: number; npcGlassShards: number;
  totalDestroyedGlassShards: number; enemyKills: number; concreteTopples: number;
  totalGlassArea: number; destroyedGlassArea: number;
  juggernautKills: number; juggernautCollisionKills: number; oilPitJuggernautKills: number;
};
export type Entry = { nickname: string; score: number; playDurationSeconds: number; completedAt: string };
export type Period = { start: string | null; end: string | null; entries: Entry[] };
export type Boards = { asOf: string; timezone: 'Asia/Seoul'; weekly: Period; monthly: Period; glass: Period };
export type BoardKind = 'weekly' | 'monthly' | 'glass';
export type Session = {
  sessionId: string; sessionToken: string; startedAt: string; expiresAt: string; version: string;
  timing: { maxDurationSeconds: number; clockSkewSeconds: number; submissionGraceSeconds: number; transportToleranceSeconds: number };
};
export type Completion = Readonly<{
  version: string; submissionId: string; completedAt: string; playDurationSeconds: number;
  score: number; evidence: Readonly<Evidence>; ineligible: string | null;
}>;
export type Submission = {
  submissionId: string; sessionToken: string; version: string; nickname: string;
  score: number; playDurationSeconds: number; completedAt: string; evidence: Readonly<Evidence>;
};
export type Accepted = { submissionId: string; accepted: true; qualified: Record<BoardKind, boolean> };
export const glassComplete = (e: Readonly<Pick<Evidence, 'totalGlassArea' | 'destroyedGlassArea'>>) => e.totalGlassArea > Math.max(1e-7, e.totalGlassArea * 1e-9)
  && Math.abs(e.totalGlassArea - e.destroyedGlassArea) <= Math.max(1e-7, e.totalGlassArea * 1e-9);
export const protocolScore = (e: Readonly<Evidence>) => e.playerGlassShards * 10 + (e.enemyKills - e.juggernautKills) * 500 + e.juggernautKills * 750 + e.juggernautCollisionKills * 750 + e.oilPitJuggernautKills * 2000 + e.concreteTopples * 10;

export function evidenceError(e: Readonly<Evidence>, score: number): string | null {
  for (const key of ['playerGlassShards', 'slabGlassShards', 'npcGlassShards', 'totalDestroyedGlassShards', 'enemyKills', 'concreteTopples', 'juggernautKills', 'juggernautCollisionKills', 'oilPitJuggernautKills'] as const) {
    if (!Number.isSafeInteger(e[key]) || e[key] < 0 || e[key] > 1_000_000) return 'INCONSISTENT_COUNTERS';
  }
  if (e.juggernautKills > e.enemyKills || e.playerGlassShards + e.npcGlassShards !== e.totalDestroyedGlassShards || e.slabGlassShards > e.playerGlassShards || (e.slabGlassShards > 0 && !e.concreteTopples)) return 'INCONSISTENT_COUNTERS';
  const tolerance = Math.max(1e-7, e.totalGlassArea * 1e-9);
  if (![e.totalGlassArea, e.destroyedGlassArea].every(n => Number.isFinite(n) && n >= 0 && n <= 1e9)
    || e.totalGlassArea <= tolerance || e.destroyedGlassArea > e.totalGlassArea + tolerance
    || ((e.totalDestroyedGlassShards === 0) !== (e.destroyedGlassArea === 0))) return 'INVALID_GLASS_AREA';
  return Number.isSafeInteger(score) && score >= 0 && score <= MAX_SCORE && score === protocolScore(e) ? null : 'SCORE_MISMATCH';
}

// A conservative local call-saving filter, not an authoritative rank calculation.
// Ties intentionally do not submit; glass admission is ordered by date, not score.
export function shouldSubmit(c: Completion, boards: Boards): boolean {
  if (c.ineligible) return false;
  if (glassComplete(c.evidence)) return true;
  return [boards.weekly, boards.monthly].some(period => {
    const end = Date.parse(c.completedAt);
    if (period.start === null || period.end === null || end < Date.parse(period.start) || end >= Date.parse(period.end)) return false;
    return period.entries.length < 10 || c.score > period.entries[period.entries.length - 1].score;
  });
}
export function normalizeNickname(raw: string): string {
  const name = raw.normalize('NFC').trim();
  if ([...name].length < 1 || [...name].length > 20 || !/^[\p{L}\p{N} _-]+$/u.test(name)) throw new Error('INVALID_NICKNAME');
  return name;
}
export const ERROR_MESSAGES: Record<string, string> = {
  SCENE_TIMEOUT: 'Preparing the page took too long. Exit and try again.',
  SPRITE_LOAD_FAILED: 'Unable to load character data. Please try again.',
  WEBGL_UNAVAILABLE: 'WebGL is unavailable. Check hardware acceleration in your browser.',
  SHADER_FAILED: 'Unable to prepare the graphics shaders. Please try again.',
  GRAPHICS_FAILED: 'Unable to prepare the graphics program. Please try again.',
  STAGE_LOAD_FAILED: 'Unable to load the extra stages. Please try again.',
  INVALID_NICKNAME: 'Use 1–20 letters, numbers, spaces, underscores, or hyphens for your nickname.',
  INVALID_TOKEN: 'Unable to verify this session. Start a new game.',
  SESSION_EXPIRED: 'The submission window has expired. Start a new game.',
  SESSION_VERSION_MISMATCH: 'This session uses a different game version. Start a new game; this run cannot be resubmitted.',
  UNSUPPORTED_VERSION: 'This game version is not supported. Refresh the page.',
  INVALID_DURATION: 'Play duration is outside the allowed range.',
  INVALID_COMPLETION_TIME: 'Unable to verify the finish time. Check your device clock.',
  INCONSISTENT_COUNTERS: 'The game event counts do not match. This score cannot be submitted.',
  INVALID_GLASS_AREA: 'Unable to verify the shattered glass area. This score cannot be submitted.',
  SCORE_MISMATCH: 'The score does not match the recorded game events and cannot be submitted.',
  SUBMISSION_CONFLICT: 'This submission conflicts with a processed run and cannot be submitted again.',
  RATE_LIMITED: 'Too many requests. Please try again shortly.',
  SERVICE_UNAVAILABLE: 'The leaderboard server is temporarily unavailable.',
  ORIGIN_DENIED: 'This website address is not allowed by the leaderboard server. Check the allowed origins.',
  NETWORK_ERROR: 'Unable to reach the leaderboard server. Check your connection and whether this website address is allowed.',
  UNRELIABLE_GAME_CLOCK: 'Device sleep or a clock change prevented timing verification. This score cannot be submitted.',
  DEVELOPER_RUN: 'Scores from developer mode cannot be submitted.',
  SESSION_START_TOO_SLOW: 'Session setup took longer than 15 seconds. Please try again.',
  RETRIES_EXHAUSTED: 'All retry attempts have been used. Your score may have been submitted even without a response.',
  NO_COMPLETION: 'No completed run is available.',
};
export const errorMessage = (error: unknown) => ERROR_MESSAGES[error instanceof Error ? error.message : ''] ?? 'Unable to process your score. Please try again shortly.';
export const formatKST = (date: string) => new Date(date).toLocaleString('en-GB', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

export type LeaderboardKind = 'weekly' | 'monthly' | 'completion';
export type LeaderboardEntry = { nickname: string; score: number; completedAt: string };

// Fixed illustrative data only; these are not submitted player records.
const names = ['pixel_sailor', '유리장인', 'Orbit', '밤항해', 'mintbyte', '잔물결', 'shardrunner', '별조각', 'slowwave', '초록탱크'];
const scores = [48500, 43210, 39800, 36450, 32100, 28750, 25300, 21940, 18600, 15270];
export const MOCK_LEADERBOARDS: Record<LeaderboardKind, LeaderboardEntry[]> = {
  weekly: names.map((nickname, i) => ({ nickname, score: scores[i], completedAt: `2026-10-0${4 - i % 4}T${String(18 - i).padStart(2, '0')}:30:00+09:00` })),
  monthly: names.map((_, i) => ({ nickname: names[(i + 3) % names.length], score: scores[i] + 12500, completedAt: `2026-10-0${4 - i % 4}T${String(20 - i).padStart(2, '0')}:15:00+09:00` })),
  completion: names.map((_, i) => ({ nickname: names[(i + 6) % names.length], score: scores[(i * 3) % scores.length] + 18000, completedAt: `2026-10-${String(4 - Math.floor(i / 3)).padStart(2, '0')}T${String(20 - i % 3 * 4).padStart(2, '0')}:00:00+09:00` })),
};

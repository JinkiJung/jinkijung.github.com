import { VERSION, evidenceError, normalizeNickname, type Accepted, type Boards, type Completion, type Evidence, type Session, type Submission } from './protocol.ts';

export class ApiError extends Error {
  status: number;
  retryAfter: number | null;
  constructor(code: string, status = 0, retryAfter: number | null = null) {
    super(code); this.status = status; this.retryAfter = retryAfter;
  }
}
export type Runtime = {
  fetch: typeof fetch; mono: () => number; wall: () => number; uuid: () => string;
  sleep: (ms: number, signal: AbortSignal) => Promise<void>; random: () => number;
};
const defaults: Runtime = {
  fetch: (...args) => fetch(...args), mono: () => performance.now(), wall: () => Date.now(), uuid: () => crypto.randomUUID(), random: Math.random,
  sleep: (ms, signal) => new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, ms);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  }),
};
export class LeaderboardApi {
  readonly base: string;
  readonly runtime: Runtime;
  constructor(base: string, runtime: Partial<Runtime> = {}) { this.base = base.replace(/\/$/, ''); this.runtime = { ...defaults, ...runtime }; }
  async request<T>(path: string, body?: string, signal?: AbortSignal, timeout = 15_000): Promise<T> {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        (async () => {
          const response = await this.runtime.fetch(`${this.base}/v1/${path}`, {
            method: body === undefined ? 'GET' : 'POST',
            ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body }),
            signal: controller.signal, credentials: 'omit',
          });
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const header = response.headers.get('Retry-After');
            const delay = header === null ? null : /^\d+$/.test(header) ? Number(header) * 1000 : Date.parse(header) - this.runtime.wall();
            throw new ApiError(data.error?.code ?? 'SERVICE_UNAVAILABLE', response.status, delay !== null && Number.isFinite(delay) ? Math.max(0, delay) : null);
          }
          if ((path === 'sessions' && response.status !== 201) || (path === 'runs' && response.status !== 200)) throw new ApiError('INVALID_RESPONSE', response.status);
          return await response.json() as T;
        })(),
        new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new ApiError(path === 'sessions' ? 'SESSION_START_TOO_SLOW' : 'NETWORK_ERROR')); }, timeout); }),
      ]);
    } catch (error) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      if (error instanceof ApiError) throw error;
      throw new ApiError('NETWORK_ERROR');
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
  }
  leaderboards() { return this.request<Boards>('leaderboards'); }
}
export const isTransient = (error: unknown) => error instanceof ApiError && error.message !== 'SESSION_VERSION_MISMATCH' && (error.status === 429 || error.status === 503 || (error.status === 0 && error.message === 'NETWORK_ERROR'));

// Owned by one mounted game. Never persist sessions or evidence in storage/logs.
export class RankedRun {
  private api: LeaderboardApi;
  private session?: Session;
  private startMono = 0;
  private startWall = 0;
  private controller = new AbortController();
  private generation = 0;
  private starting?: Promise<void>;
  private sending?: Promise<Accepted>;
  private body?: string;
  private result?: Accepted;
  private terminal?: Error;
  private attempts = 0;
  private developer = false;
  completion?: Completion;
  constructor(api: LeaderboardApi) { this.api = api; }
  get elapsed() { return this.completion?.playDurationSeconds ?? (this.session ? (this.api.runtime.mono() - this.startMono) / 1000 : 0); }
  get nicknameLocked() { return this.body !== undefined; }
  markDeveloper() { this.developer = true; }
  cancel() { this.generation++; this.controller.abort(); this.starting = undefined; this.session = undefined; }
  start(): Promise<void> {
    if (this.starting) return this.starting;
    if (this.session || this.completion) return Promise.reject(new Error('RUN_ALREADY_STARTED'));
    const generation = ++this.generation;
    this.controller = new AbortController();
    const signal = this.controller.signal;
    const sentMono = this.api.runtime.mono(), sentWall = this.api.runtime.wall();
    const task = (async () => {
      const session = await this.api.request<Session>('sessions', JSON.stringify({ version: VERSION }), signal);
      if (generation !== this.generation || signal.aborted) throw new DOMException('Aborted', 'AbortError');
      if (this.api.runtime.mono() - sentMono > 15_000 || this.api.runtime.wall() - sentWall > 15_000) throw new ApiError('SESSION_START_TOO_SLOW');
      if (session.version !== VERSION) throw new Error('SESSION_VERSION_MISMATCH');
      if (!session.sessionToken || !Number.isFinite(Date.parse(session.expiresAt)) || !session.timing?.maxDurationSeconds) throw new Error('INVALID_TOKEN');
      this.session = session;
      this.startMono = this.api.runtime.mono(); this.startWall = this.api.runtime.wall();
    })();
    this.starting = task;
    void task.finally(() => { if (generation === this.generation) this.starting = undefined; }).catch(() => {});
    return task;
  }
  finish(score: number, evidence: Readonly<Evidence>): Completion {
    if (this.completion) return this.completion;
    if (!this.session) throw new Error('NO_ACTIVE_GAME');
    const endMono = this.api.runtime.mono(), endWall = this.api.runtime.wall();
    const duration = (endMono - this.startMono) / 1000;
    const ineligible = this.developer ? 'DEVELOPER_RUN'
      : Math.abs((endWall - this.startWall) / 1000 - duration) > 2 ? 'UNRELIABLE_GAME_CLOCK'
      : duration <= 0 || duration > this.session.timing.maxDurationSeconds ? 'INVALID_DURATION'
      : evidenceError(evidence, score);
    this.completion = Object.freeze({ version: this.session.version, submissionId: this.api.runtime.uuid(), completedAt: new Date(endWall).toISOString(), playDurationSeconds: duration, score, evidence: Object.freeze({ ...evidence }), ineligible });
    return this.completion;
  }
  private deadline() {
    if (!this.session || !this.completion) return 0;
    // Use local monotonic age for grace even if device time differs from the server.
    const graceRemaining = (this.session.timing.submissionGraceSeconds - ((this.api.runtime.mono() - this.startMono) / 1000 - this.completion.playDurationSeconds)) * 1000;
    return Math.min(Date.parse(this.session.expiresAt) - this.api.runtime.wall(), graceRemaining);
  }
  submit(nickname: string, onRetry?: (seconds: number) => void): Promise<Accepted> {
    // Sticky for the entire run, even if developer mode was later switched off
    // or enabled after a completion snapshot had already been created.
    if (this.developer) return Promise.reject(new Error('DEVELOPER_RUN'));
    if (this.sending) return this.sending;
    if (this.result) return Promise.resolve(this.result);
    if (this.terminal) return Promise.reject(this.terminal);
    if (!this.completion || !this.session) return Promise.reject(new Error('NO_COMPLETION'));
    if (this.completion.ineligible) return Promise.reject(new Error(this.completion.ineligible));
    if (!this.body) {
      try {
        const c = this.completion;
        const payload: Submission = { submissionId: c.submissionId, sessionToken: this.session.sessionToken, version: c.version, nickname: normalizeNickname(nickname), score: c.score, playDurationSeconds: c.playDurationSeconds, completedAt: c.completedAt, evidence: c.evidence };
        const body = JSON.stringify(payload);
        if (new TextEncoder().encode(body).byteLength > 4096) throw new Error('PAYLOAD_TOO_LARGE');
        this.body = body;
      } catch (error) { return Promise.reject(error); }
    }
    const signal = this.controller.signal;
    const task = (async () => {
      while (this.attempts < 3) {
        if (this.developer) throw new Error('DEVELOPER_RUN');
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        if (this.deadline() <= 0) throw new Error('SESSION_EXPIRED');
        this.attempts++;
        try {
          const result = await this.api.request<Accepted>('runs', this.body, signal, Math.min(15_000, this.deadline()));
          if (result.accepted !== true || result.submissionId !== this.completion!.submissionId) throw new ApiError('INVALID_RESPONSE', 200);
          this.result = result;
          return result;
        } catch (error) {
          if (!isTransient(error)) throw error;
          if (this.attempts >= 3) throw new Error('RETRIES_EXHAUSTED');
          const apiError = error as ApiError;
          const backoff = 1000 * 2 ** (this.attempts - 1) + this.api.runtime.random() * 500;
          const delay = Math.max(backoff, apiError.retryAfter ?? (apiError.status === 429 ? 60_000 : 0));
          if (delay >= this.deadline()) throw new Error('SESSION_EXPIRED');
          onRetry?.(Math.ceil(delay / 1000));
          await this.api.runtime.sleep(delay, signal);
        }
      }
      throw new Error('RETRIES_EXHAUSTED');
    })();
    this.sending = task;
    void task.catch(error => { this.terminal = error instanceof Error ? error : new Error('NETWORK_ERROR'); }).finally(() => { this.sending = undefined; });
    return task;
  }
}

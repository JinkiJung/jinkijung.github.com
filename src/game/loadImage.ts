// SVG snapshots must not depend on decode(): WebKit can leave that promise
// pending even when the image load event has already fired.
export function loadImage(src: string, options: { signal?: AbortSignal; timeoutMs?: number; errorCode?: string } = {}): Promise<HTMLImageElement> {
  const { signal, timeoutMs = 15000, errorCode = 'SPRITE_LOAD_FAILED' } = options;
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(signal.reason); return; }
    const image = new Image();
    let settled = false;
    const finish = (error?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      image.onload = image.onerror = null;
      signal?.removeEventListener('abort', abort);
      if (error) { image.removeAttribute('src'); reject(error); }
      else resolve(image);
    };
    const abort = () => finish(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
    const timer = setTimeout(() => finish(new Error(errorCode)), timeoutMs);
    image.onload = () => image.naturalWidth > 0 ? finish() : finish(new Error(errorCode));
    image.onerror = () => finish(new Error(errorCode));
    signal?.addEventListener('abort', abort, { once: true });
    image.src = src;
    if (image.complete && image.naturalWidth > 0) finish();
  });
}

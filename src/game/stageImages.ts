import { loadImage } from './loadImage.ts';

// WebKit does not dispatch load events for cloned images owned by our
// script-disabled stage frames. Embed resources before html-to-image clones
// them, so it never waits for those sandboxed image events.
export async function inlineStageImages(page: HTMLElement, signal: AbortSignal, cache: Map<string, Promise<string>>) {
  await Promise.all(Array.from(page.querySelectorAll('img')).map(async image => {
    const url = image.currentSrc || image.src;
    if (!url || url.startsWith('data:')) return;
    let pending = cache.get(url);
    if (!pending) {
      pending = (async () => {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error('STAGE_LOAD_FAILED');
        const blob = await response.blob();
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('STAGE_LOAD_FAILED'));
          reader.readAsDataURL(blob);
        });
        // Validate in the main document, which can deliver image events.
        await loadImage(data, { signal, errorCode: 'STAGE_LOAD_FAILED' });
        return data;
      })();
      cache.set(url, pending);
    }
    const data = await pending;
    signal.throwIfAborted();
    image.removeAttribute('srcset');
    image.loading = 'eager';
    image.src = data;
  }));
}

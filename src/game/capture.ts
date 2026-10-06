import { loadImage } from './loadImage.ts';
import { captureScale } from './snapshotTiles';
import type { PenaltyRegion } from './penalties';
import { sealTextRegions, sealRenderedTextLines } from './textCollision';
import { toSvg } from 'html-to-image';
import type { ConcretePlate } from './concrete';
import type { Rect } from './geometry';

export async function capturePage(page: HTMLElement, signal: AbortSignal, main = true) {
  const owner = page.ownerDocument.defaultView!;
  const width = owner.innerWidth, viewportHeight = owner.innerHeight, height = Math.max(viewportHeight, page.scrollHeight);
  const initialScrollY = owner.scrollY;
  const careerRegions = [...page.querySelectorAll('.career')].flatMap((career, group) => {
    const dedicated = [...career.querySelectorAll('.career-game-region')];
    const nodes = dedicated.length ? dedicated : [...career.querySelectorAll('.career-col-bg')];
    return nodes.map(node => {
      const r = node.getBoundingClientRect();
      return { x:r.x, y:r.y+initialScrollY, w:r.width, h:r.height, group:String(group) };
    }).filter(r => r.w > 0 && r.h > 0);
  });
  const concretePlates: ConcretePlate[] = [...page.querySelectorAll<HTMLElement>('.wf-indicators .wf-indicator')].map((node, id) => {
    const r = node.getBoundingClientRect();
    return { x: r.x, y: r.y + initialScrollY, w: r.width, h: r.height, id, direction: node.dataset.fallDirection === '-1' ? -1 as const : 1 as const, active: node.classList.contains('is-active') };
  }).filter(r => r.w > 0 && r.h > 0);
  const iceRegions = [...page.querySelectorAll<HTMLElement>('.e2e-voyage-frame:not([data-penalty])')].map(node => {
    const r = node.getBoundingClientRect();
    return { x: r.x, y: r.y + initialScrollY, w: r.width, h: r.height };
  }).filter(r => r.w > 0 && r.h > 0);
  const penaltyRegions: PenaltyRegion[] = [...page.querySelectorAll<HTMLElement>('.e2e-voyage-frame[data-penalty]')].map(node=>{
    const r=node.getBoundingClientRect();
    return {x:r.x,y:r.y+initialScrollY,w:r.width,h:r.height,kind:node.dataset.penalty as PenaltyRegion['kind'],direction:node.dataset.direction==='up'?-1:1};
  }).filter(r=>r.w>0 && r.h>0);
  const targets: Rect[] = [...page.querySelectorAll<HTMLElement>('[data-breakable]')].map((node, id) => {
    const r = node.getBoundingClientRect();
    return { x: r.x, y: r.y + initialScrollY, w: r.width, h: r.height, id };
  }).filter(r => r.w > 0 && r.h > 0 && r.x < width && r.y < height && r.x + r.w > 0 && r.y + r.h > 0);
  // Capture each rendered line separately, excluding paragraph padding and blank line tails.
  const groups = new Map<Element, { x: number; y: number; w: number; h: number }[]>();
  const textWalker = page.ownerDocument.createTreeWalker(page, NodeFilter.SHOW_TEXT);
  while (textWalker.nextNode()) {
    const node = textWalker.currentNode, parent = node.parentElement;
    if (!node.textContent?.trim() || !parent || parent.closest('style, script, .wf-footer, .wf-ticker-track')) continue;
    const range = page.ownerDocument.createRange(); range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      let left = Math.max(0, r.left), top = Math.max(0, r.top + initialScrollY), right = Math.min(width, r.right), bottom = Math.min(height, r.bottom + initialScrollY);
      for (let ancestor: Element | null = parent; ancestor; ancestor = ancestor.parentElement) {
        const style = owner.getComputedStyle(ancestor);
        if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) { right = left; break; }
        const bounds = ancestor.getBoundingClientRect();
        if (/(hidden|clip|auto|scroll)/.test(style.overflowX)) { left = Math.max(left, bounds.left); right = Math.min(right, bounds.right); }
        if (/(hidden|clip|auto|scroll)/.test(style.overflowY)) { top = Math.max(top, bounds.top + initialScrollY); bottom = Math.min(bottom, bounds.bottom + initialScrollY); }
      }
      if (right <= left || bottom <= top) continue;
      const key = parent.closest('p,h1,h2,h3,h4,h5,h6,li,svg text') ?? parent;
      const lines = groups.get(key) ?? [];
      const previous = lines.find(line => Math.min(bottom, line.y + line.h) - Math.max(top, line.y) > Math.min(bottom - top, line.h) * .5);
      if (previous) {
        right = Math.max(right, previous.x + previous.w); bottom = Math.max(bottom, previous.y + previous.h);
        left = Math.min(left, previous.x); top = Math.min(top, previous.y);
      }
      const line = { x: left, y: top, w: right - left, h: bottom - top };
      if (previous) Object.assign(previous, line); else lines.push(line);
      groups.set(key, lines);
    }
  }
  signal.throwIfAborted();
  const url = await toSvg(page, {
    width, height,
    backgroundColor: owner.getComputedStyle(page.ownerDocument.body).backgroundColor,
    style: { transform: `translateX(${-owner.scrollX}px)`, height: `${page.scrollHeight}px`, overflow: 'visible' },
    preferredFontFormat: 'woff2',
  });
  signal.throwIfAborted();
  // The serializer copies computed transforms. Disable cloned animations so the
  // ticker and SVG animations keep that exact frame instead of restarting.
  const svg = new DOMParser().parseFromString(decodeURIComponent(url.slice(url.indexOf(',') + 1)), 'image/svg+xml');
  svg.querySelectorAll<HTMLElement>('[style]').forEach(node => {
    node.style.setProperty('animation', 'none', 'important');
    node.style.setProperty('transition', 'none', 'important');
  });
  svg.querySelectorAll<HTMLElement>('.wf-indicator').forEach(node => node.style.setProperty('visibility', 'hidden', 'important'));
  const textSvg = svg.cloneNode(true) as Document;
  textSvg.querySelectorAll<HTMLElement>('*').forEach(node => {
    if (!node.style) return;
    node.style.setProperty('background', 'transparent', 'important');
    node.style.setProperty('border-color', 'transparent', 'important');
    node.style.setProperty('box-shadow', 'none', 'important');
    node.style.setProperty('text-shadow', 'none', 'important');
    // Keep layout and clipping, but remove every non-text visual.
    if (['img', 'canvas', 'video', 'iframe', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'image', 'use'].includes(node.localName) && !node.closest('defs, clipPath, mask')) {
      node.style.setProperty('visibility', 'hidden', 'important');
    }
  });
  // Separate text first; career text is transferred to destructible glass below.
  svg.querySelectorAll<HTMLElement>('*').forEach(node => {
    if (!node.style || node.closest('defs')) return;
    node.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
    node.style.setProperty('text-shadow', 'none', 'important');
    node.style.setProperty('text-decoration-color', 'transparent', 'important');
    if (node.localName === 'text' || node.localName === 'tspan') node.style.setProperty('fill', 'transparent', 'important');
  });
  const ratio = captureScale(width, height, devicePixelRatio, main);
  const rasterize = async (doc: Document) => {
    const image = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(doc))}`, { signal, errorCode: 'SCENE_TIMEOUT' });
    signal.throwIfAborted();
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  };
  const [canvas, textCanvas] = await Promise.all([rasterize(svg), rasterize(textSvg)]);
  // Career lettering belongs to the glass texture, so local damage removes it
  // with its shard instead of leaving an immortal text overlay or collider.
  const glassContext = canvas.getContext('2d')!;
  const letteringContext = textCanvas.getContext('2d')!;
  const sx = textCanvas.width / width, sy = textCanvas.height / height;
  for (const r of careerRegions) {
    const x = Math.max(0, Math.floor(r.x * sx)), y = Math.max(0, Math.floor(r.y * sy));
    const right = Math.min(textCanvas.width, Math.ceil((r.x + r.w) * sx));
    const bottom = Math.min(textCanvas.height, Math.ceil((r.y + r.h) * sy));
    if (right <= x || bottom <= y) continue;
    glassContext.drawImage(textCanvas, x, y, right - x, bottom - y, x, y, right - x, bottom - y);
    letteringContext.clearRect(x, y, right - x, bottom - y);
  }
  const textMask = textCanvas.getContext('2d')!.getImageData(0, 0, textCanvas.width, textCanvas.height).data;
  sealRenderedTextLines(textMask, textCanvas.width, textCanvas.height, textCanvas.width / width, textCanvas.height / height, [...groups.values()].flat());
  // Clear the entire ticker band after sealing text; nested inline styles or
  // glyph antialiasing cannot leave an invisible collision wall at the seam.
  const footerNodes = [...page.querySelectorAll<HTMLElement>('.wf-footer')];
  const passThrough = footerNodes.map((node, index) => {
    const r = node.getBoundingClientRect();
    const fullWidth = index === footerNodes.length - 1 && !!node.closest('.below-fold');
    return { x: fullWidth ? 0 : r.x, y: r.y + initialScrollY, w: fullWidth ? width : r.width, h: r.height };
  });
  sealTextRegions(textMask, textCanvas.width, textCanvas.height, textCanvas.width / width, textCanvas.height / height, [...passThrough, ...careerRegions], 0);
  const textDisplay = document.createElement('canvas');
  textDisplay.width = textCanvas.width; textDisplay.height = textCanvas.height;
  const textContext = textDisplay.getContext('2d')!;
  textContext.shadowColor = '#f3f8ff'; textContext.shadowBlur = 3 * ratio;
  textContext.drawImage(textCanvas, 0, 0);
  return { canvas, textCanvas: textDisplay, textMask, width, height, viewportHeight, initialScrollY, targets, iceRegions, concretePlates, careerRegions, penaltyRegions, pits: passThrough };
}

import { inlineStageImages } from './stageImages';
import { splitSnapshot } from './snapshotTiles';
import { capturePage } from './capture';
import { stageLayout } from './stages/layout';

type Snapshot = Awaited<ReturnType<typeof capturePage>>;

async function captureStage(path: string, signal: AbortSignal, images: Map<string, Promise<string>>): Promise<Snapshot> {
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-same-origin');
  frame.setAttribute('aria-hidden', 'true'); frame.tabIndex = -1;
  frame.style.cssText = `position:fixed;left:-100000px;top:0;width:${innerWidth}px;height:${innerHeight}px;border:0;pointer-events:none;`;
  try {
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => { frame.onload = null; frame.onerror = null; signal.removeEventListener('abort', abort); };
      const abort = () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')); };
      frame.onload = () => { cleanup(); resolve(); };
      frame.onerror = () => { cleanup(); reject(new Error('STAGE_LOAD_FAILED')); };
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) { abort(); return; }
      frame.src = `${import.meta.env.BASE_URL}stages/${path}.html`; document.body.append(frame);
    });
    signal.throwIfAborted();
    await frame.contentDocument!.fonts.ready;
    await inlineStageImages(frame.contentDocument!.body, signal, images);
    return await capturePage(frame.contentDocument!.body, signal, false);
  } finally { frame.remove(); }
}

export async function captureGameWorld(page: HTMLElement, signal: AbortSignal, progress: (message: string) => void = () => {}) {
  progress('Preparing the homepage…');
  const main = await capturePage(page,signal);
  const upper:Snapshot[]=[],lower:Snapshot[]=[];
  const images = new Map<string, Promise<string>>();
  // Limit concurrent foreign-object captures to avoid a startup memory spike.
  for(let i=1;i<=3;i++){
    progress(`Preparing extra stages (${i}/3)…`);
    const [up,down]=await Promise.all([captureStage(`index-up-${i}`,signal,images),captureStage(`index-down-${i}`,signal,images)]);
    upper.unshift(up);lower.push(down);
  }
  signal.throwIfAborted();
  progress('Assembling the game world…');
  const layout = stageLayout(main.height, upper.reduce((s,p)=>s+p.height,0), lower.reduce((s,p)=>s+p.height,0), main.initialScrollY);
  const width = main.width, height = layout.height;
  const ratio = Math.min(devicePixelRatio, 1.5, 4096 / Math.max(width, height), 2048 / width);
  const makeCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    return canvas;
  };
  const maskCanvas = makeCanvas();
  const sx = maskCanvas.width / width, sy = maskCanvas.height / height;
  const maskContext = maskCanvas.getContext('2d')!;
  maskContext.imageSmoothingEnabled = false;
  let offset=0;
  const parts=[...upper,main,...lower].map(snapshot=>{const part={snapshot,offset};offset+=snapshot.height;return part;});
  const tiles = parts.flatMap(({snapshot, offset}) => splitSnapshot(snapshot.canvas, snapshot.textCanvas, snapshot.height, offset));
  for (const { snapshot, offset } of parts) {
    const dy = Math.round(offset * sy), end = Math.round((offset + snapshot.height) * sy);
    const source = document.createElement('canvas'); source.width = snapshot.textCanvas.width; source.height = snapshot.textCanvas.height;
    const context = source.getContext('2d')!, data = context.createImageData(source.width, source.height);
    data.data.set(snapshot.textMask); context.putImageData(data, 0, 0);
    maskContext.drawImage(source, 0, dy, width * sx, end - dy);
  }
  const pits = parts.flatMap(({ snapshot, offset }) => snapshot.pits.map(r => ({ ...r, y: r.y + offset })));
  const stageFloors = [
    ...pits.map((r, i) => ({ ...r, id: -2000000 - i })),
  ];
  return {
    ...main, tiles, canvas: maskCanvas, textCanvas: maskCanvas, textMask: maskContext.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data,
    height, initialScrollY: layout.initialScrollY, stageFloors, pits,
    originalPage: { top: layout.pageOffset, bottom: layout.bottomOffset },
    targets: [...parts.flatMap(({snapshot,offset})=>snapshot.targets.map(r=>({...r,y:r.y+offset}))), ...stageFloors],
    iceRegions: main.iceRegions.map(r => ({ ...r, y: r.y + layout.pageOffset })),
    concretePlates: parts.flatMap(({ snapshot, offset }) => snapshot.concretePlates.map(r => ({ ...r, y: r.y + offset }))),
    careerRegions: [parts[3],...parts.filter(p=>p.snapshot!==main)].flatMap(({snapshot,offset})=>snapshot.careerRegions.map(r=>({...r,y:r.y+offset,group:`${offset}:${r.group}`}))),
    penaltyRegions: parts.flatMap(({snapshot,offset})=>snapshot.penaltyRegions.map(r=>({...r,y:r.y+offset}))),
    breakableArea: width * height - pits.reduce((sum, p) => sum + p.w * p.h, 0),
  };
}

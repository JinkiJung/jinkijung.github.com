export type SnapshotTile = { y: number; height: number; canvas: HTMLCanvasElement; textCanvas: HTMLCanvasElement };

// Independent of total world length: the homepage stays sharp as stages grow.
export function captureScale(width: number, height: number, dpr: number, main: boolean) {
  return Math.min(dpr, main ? 1.5 : .5, 4096 / Math.max(width, height), 2048 / width);
}
export function tileSpans(height: number, size = 1024) {
  const spans: { y: number; height: number }[] = [];
  for (let y = 0; y < height; y += size) spans.push({ y, height: Math.min(size, height - y) });
  return spans;
}
export function splitSnapshot(canvas: HTMLCanvasElement, textCanvas: HTMLCanvasElement, height: number, offset: number): SnapshotTile[] {
  return tileSpans(height).map(span => {
    const top = Math.round(span.y * canvas.height / height);
    const bottom = Math.round((span.y + span.height) * canvas.height / height);
    const crop = (source: HTMLCanvasElement) => {
      const tile = document.createElement('canvas'); tile.width = source.width; tile.height = bottom - top;
      tile.getContext('2d')!.drawImage(source, 0, top, source.width, bottom - top, 0, 0, tile.width, tile.height);
      return tile;
    };
    return { y: offset + span.y, height: span.height, canvas: crop(canvas), textCanvas: crop(textCanvas) };
  });
}

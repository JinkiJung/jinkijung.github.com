export function stageLayout(pageHeight: number, topHeight: number, bottomHeight: number, entryScroll: number) {
  return {
    pageOffset: topHeight,
    bottomOffset: topHeight + pageHeight,
    height: topHeight + pageHeight + bottomHeight,
    initialScrollY: topHeight + entryScroll,
  };
}

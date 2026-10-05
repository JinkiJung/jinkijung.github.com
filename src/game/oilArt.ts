// Shared SVG outlines also provide an immediate vector fallback while images decode.
export const OIL_PATHS = [
 'M9 59 C5 43 23 38 40 42 C57 46 47 27 57 21 C67 15 76 25 84 18 C95 7 126 12 132 26 C139 41 112 34 111 47 C111 58 135 48 138 65 C142 82 119 86 103 81 C88 77 101 97 114 103 C134 114 121 134 96 136 C72 138 65 123 53 127 C35 134 17 123 24 111 C33 98 55 104 52 91 C49 78 16 88 9 73 C6 68 7 64 9 59 Z',
 'M12 33 C18 15 36 16 48 26 C62 37 60 8 80 8 C100 8 91 31 107 28 C128 24 143 43 132 55 C120 67 110 54 105 67 C102 78 137 77 135 96 C133 115 109 105 99 118 C87 135 72 142 58 130 C47 120 61 111 45 106 C32 102 16 117 9 99 C3 82 28 78 26 64 C24 52 5 49 12 33 Z',
 'M8 70 C4 53 24 48 37 51 C53 55 24 27 42 16 C59 5 75 20 79 32 C84 45 97 12 116 19 C134 26 118 43 124 54 C131 65 143 69 136 85 C130 98 113 86 105 97 C98 107 120 121 103 133 C83 147 71 124 59 121 C43 116 30 137 17 123 C5 109 28 96 23 88 C19 82 10 83 8 70 Z',
] as const;
let images: HTMLImageElement[] | undefined;
export function preloadOilArt() {
 if(images || typeof Image==='undefined')return;
 images=OIL_PATHS.map((_,i)=>{const img=new Image();img.src=`${import.meta.env?.BASE_URL ?? '/'}images/game/oil-${i+1}.svg`;return img;});
}
let paths:Path2D[]|undefined;
export function drawOilArt(ctx:CanvasRenderingContext2D,variant:number,x:number,y:number,size:number,burning:boolean) {
 preloadOilArt();
 paths ??= OIL_PATHS.map(d=>new Path2D(d));
 ctx.save();ctx.translate(x,y);ctx.scale(size/144,size/144);
 const image=images?.[variant];
 if(image?.complete && image.naturalWidth)ctx.drawImage(image,0,0,144,144);
 else {ctx.fillStyle='#090c0e';ctx.strokeStyle='#5f6e6a';ctx.lineWidth=1;ctx.fill(paths[variant]);ctx.stroke(paths[variant]);}
 if(burning){ctx.fillStyle='#f55c253d';ctx.fill(paths[variant]);}
 ctx.restore();
}

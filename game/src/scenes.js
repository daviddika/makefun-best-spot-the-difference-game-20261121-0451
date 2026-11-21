// The six picture scenes. Every scene is drawn procedurally on a 600x420 canvas —
// original art, no copied assets — and takes a Set of active difference ids.
// The left panel is drawn with an empty set (the base picture); the right panel
// with the level's differences applied, so the two pictures are near-identical
// and differ only where a difference says so. Each difference also carries the
// point a click must land near, and a short label for the "found it" toast.

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function skyGradient(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, 420);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 600, 420);
}

function cloud(ctx, x, y, s, fill) {
  ctx.fillStyle = fill;
  circle(ctx, x, y, 18 * s, fill);
  circle(ctx, x + 20 * s, y + 4 * s, 14 * s, fill);
  circle(ctx, x - 20 * s, y + 5 * s, 13 * s, fill);
  circle(ctx, x + 2 * s, y - 10 * s, 14 * s, fill);
}

function birdShape(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 10 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 8 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 8 * s, x + 10 * s, y);
  ctx.stroke();
}

function flower(ctx, x, y, petal, centre) {
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    circle(ctx, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 5, petal);
  }
  circle(ctx, x, y, 5, centre);
}

/* ------------------------------------------------------------------ */
/* Scene 1 — Sunny Park                                                */
/* ------------------------------------------------------------------ */

function drawPark(ctx, diffs) {
  skyGradient(ctx, '#7ec8f7', '#dff3ff');
  // Sun with rays.
  circle(ctx, 82, 70, 34, '#ffd93b');
  ctx.strokeStyle = '#ffd93b';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(82 + Math.cos(a) * 44, 70 + Math.sin(a) * 44);
    ctx.lineTo(82 + Math.cos(a) * 56, 70 + Math.sin(a) * 56);
    ctx.stroke();
  }
  cloud(ctx, 210, 58, 1, '#ffffff');
  cloud(ctx, 470, 42, 0.8, '#ffffff');
  if (diffs.has('cloud')) cloud(ctx, 330, 96, 0.7, '#ffffff');
  // Rolling hills.
  ellipse(ctx, 120, 470, 260, 110, '#7ec850');
  ellipse(ctx, 480, 480, 300, 120, '#68b844');
  rect(ctx, 0, 330, 600, 90, '#8fd35f');
  // Winding path.
  ctx.fillStyle = '#e8c98a';
  ctx.beginPath();
  ctx.moveTo(270, 420);
  ctx.quadraticCurveTo(300, 370, 330, 330);
  ctx.lineTo(370, 330);
  ctx.quadraticCurveTo(350, 370, 330, 420);
  ctx.closePath();
  ctx.fill();
  // Pond, bottom right.
  ellipse(ctx, 500, 372, 88, 34, '#4aa8dd');
  ellipse(ctx, 500, 368, 70, 24, '#6fc3ef');
  if (!diffs.has('duck')) {
    ellipse(ctx, 492, 366, 14, 10, '#ffffff');
    circle(ctx, 504, 358, 7, '#ffffff');
    poly(ctx, [[510, 356], [518, 359], [510, 362]], '#f5a623');
    circle(ctx, 506, 356, 1.5, '#222222');
  }
  // Big tree, left.
  rect(ctx, 78, 210, 22, 130, '#7a5230');
  circle(ctx, 88, 170, 62, '#3e9b4f');
  circle(ctx, 48, 200, 42, '#4caf5e');
  circle(ctx, 130, 198, 44, '#57b368');
  if (!diffs.has('apples')) {
    circle(ctx, 62, 168, 6, '#e63946');
    circle(ctx, 112, 150, 6, '#e63946');
    circle(ctx, 96, 196, 6, '#e63946');
    circle(ctx, 138, 182, 6, '#e63946');
  }
  // Bench, centre right.
  rect(ctx, 380, 268, 110, 12, '#a9713f');
  rect(ctx, 380, 240, 110, 12, '#a9713f');
  rect(ctx, 388, 280, 10, 46, '#6b4423');
  rect(ctx, 472, 280, 10, 46, '#6b4423');
  if (!diffs.has('hat')) {
    ellipse(ctx, 436, 232, 26, 8, '#8e44ad');
    ellipse(ctx, 436, 220, 16, 12, '#9b59b6');
  }
  // Flowers along the bottom.
  const flowerSpots = [[40, 392], [170, 400], [250, 388], [330, 402], [560, 398]];
  flowerSpots.forEach(([x, y], i) => {
    ctx.strokeStyle = '#2f7d32';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 14);
    ctx.stroke();
    flower(ctx, x, y - 18, i === 2 ? '#ff8fa3' : '#ffffff', '#ffd93b');
  });
  // The one flower whose colour changes.
  ctx.strokeStyle = '#2f7d32';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(120, 402);
  ctx.lineTo(120, 388);
  ctx.stroke();
  flower(ctx, 120, 384, diffs.has('flower') ? '#ffd93b' : '#e63946', '#7a4a21');
  // Birds in the sky; one of them vanishes in the variant.
  birdShape(ctx, 300, 60, 1, '#33415e');
  birdShape(ctx, 350, 84, 0.8, '#33415e');
  if (!diffs.has('bird')) birdShape(ctx, 430, 58, 1, '#33415e');
  // Butterfly over the grass; its wings change colour.
  const wing = diffs.has('butterfly') ? '#ff8c42' : '#4aa8dd';
  ellipse(ctx, 242, 300, 9, 6, wing);
  ellipse(ctx, 258, 300, 9, 6, wing);
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(250, 294);
  ctx.lineTo(250, 308);
  ctx.stroke();
}

const PARK_DIFFS = [
  { id: 'bird', x: 430, y: 58, r: 26, label: 'A bird vanished from the sky' },
  { id: 'flower', x: 120, y: 384, r: 26, label: 'A flower changed colour' },
  { id: 'hat', x: 436, y: 226, r: 30, label: 'A hat disappeared from the bench' },
  { id: 'duck', x: 498, y: 362, r: 30, label: 'The duck left the pond' },
  { id: 'apples', x: 96, y: 172, r: 34, label: 'The apples fell off the tree' },
  { id: 'cloud', x: 330, y: 96, r: 30, label: 'A new cloud drifted in' },
  { id: 'butterfly', x: 250, y: 300, r: 26, label: 'The butterfly changed its wings' },
];

/* ------------------------------------------------------------------ */
/* Scene 2 — Cozy Kitchen                                              */
/* ------------------------------------------------------------------ */

function drawKitchen(ctx, diffs) {
  rect(ctx, 0, 0, 600, 420, '#f7e8c9');
  rect(ctx, 0, 300, 600, 120, '#d9a066');
  // Window with a view.
  rect(ctx, 60, 50, 180, 150, '#8a5a2b');
  rect(ctx, 70, 60, 160, 130, '#aee3f5');
  circle(ctx, 200, 88, 18, '#ffd93b');
  cloud(ctx, 130, 90, 0.6, '#ffffff');
  rect(ctx, 145, 60, 10, 130, '#8a5a2b');
  rect(ctx, 70, 120, 160, 10, '#8a5a2b');
  if (diffs.has('bird')) birdShape(ctx, 110, 150, 0.9, '#33415e');
  // Wall clock; its hands move in the variant.
  circle(ctx, 330, 110, 42, '#ffffff');
  ctx.strokeStyle = '#33415e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(330, 110, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(330, 110);
  if (diffs.has('clock')) {
    // Variant: half past four — hour hand down-right, minute hand down.
    ctx.lineTo(348, 126);
    ctx.moveTo(330, 110);
    ctx.lineTo(330, 138);
  } else {
    // Base: three o'clock — hour hand right, minute hand up.
    ctx.lineTo(356, 110);
    ctx.moveTo(330, 110);
    ctx.lineTo(330, 82);
  }
  ctx.stroke();
  circle(ctx, 330, 110, 4, '#33415e');
  // Shelf with jars.
  rect(ctx, 380, 150, 170, 12, '#8a5a2b');
  rect(ctx, 392, 118, 34, 32, '#e8a0a0');
  rect(ctx, 436, 112, 34, 38, '#a0c8e8');
  rect(ctx, 480, 120, 34, 30, '#b5e8a0');
  // Potted plant on the sill.
  rect(ctx, 500, 176, 44, 34, '#c96f4a');
  ctx.strokeStyle = '#2f7d32';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(522, 176);
  ctx.lineTo(522, 140);
  ctx.moveTo(522, 160);
  ctx.lineTo(500, 146);
  ctx.moveTo(522, 160);
  ctx.lineTo(544, 146);
  ctx.stroke();
  if (diffs.has('bloom')) flower(ctx, 522, 134, '#ff8fa3', '#ffd93b');
  // Table, kettle and fruit bowl.
  rect(ctx, 90, 300, 420, 18, '#8a5a2b');
  rect(ctx, 110, 318, 16, 84, '#6b4423');
  rect(ctx, 474, 318, 16, 84, '#6b4423');
  // Kettle with steam that vanishes in the variant.
  ellipse(ctx, 190, 282, 42, 26, '#5b7fa6');
  rect(ctx, 190, 238, 26, 22, '#5b7fa6');
  poly(ctx, [[228, 268], [252, 258], [228, 282]], '#5b7fa6');
  circle(ctx, 203, 232, 6, '#33415e');
  if (!diffs.has('steam')) {
    ctx.strokeStyle = '#b8c4d4';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(196, 226);
    ctx.quadraticCurveTo(186, 210, 196, 196);
    ctx.moveTo(212, 226);
    ctx.quadraticCurveTo(222, 210, 212, 196);
    ctx.stroke();
  }
  // Fruit bowl: four apples in the base, three in the variant.
  ellipse(ctx, 330, 292, 56, 16, '#c96f4a');
  circle(ctx, 306, 276, 13, '#e63946');
  circle(ctx, 330, 272, 13, '#e63946');
  circle(ctx, 354, 276, 13, '#e63946');
  if (!diffs.has('apple')) circle(ctx, 318, 258, 12, '#7ec850');
  // Mug; its colour changes.
  rect(ctx, 420, 268, 34, 34, diffs.has('mug') ? '#ff8c42' : '#2a9d8f');
  ctx.strokeStyle = diffs.has('mug') ? '#ff8c42' : '#2a9d8f';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(458, 285, 9, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // Cat asleep on the chair, its bow changing colour.
  ellipse(ctx, 520, 356, 52, 26, '#f4a261');
  circle(ctx, 566, 340, 20, '#f4a261');
  poly(ctx, [[548, 330], [556, 312], [562, 330]], '#f4a261');
  poly(ctx, [[570, 330], [578, 312], [582, 330]], '#f4a261');
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(556, 342);
  ctx.lineTo(566, 342);
  ctx.stroke();
  poly(ctx, [[540, 332], [532, 326], [532, 338]], diffs.has('catbow') ? '#4aa8dd' : '#e63946');
  poly(ctx, [[540, 332], [548, 326], [548, 338]], diffs.has('catbow') ? '#4aa8dd' : '#e63946');
  // Rug.
  ellipse(ctx, 300, 396, 130, 16, '#e07a5f');
  ellipse(ctx, 300, 396, 90, 10, '#f2c94c');
}

const KITCHEN_DIFFS = [
  { id: 'clock', x: 330, y: 110, r: 34, label: 'The clock hands moved' },
  { id: 'catbow', x: 540, y: 332, r: 24, label: "The cat's bow changed colour" },
  { id: 'apple', x: 318, y: 258, r: 26, label: 'An apple vanished from the bowl' },
  { id: 'steam', x: 204, y: 208, r: 28, label: 'The kettle stopped steaming' },
  { id: 'bloom', x: 522, y: 134, r: 26, label: 'A flower bloomed on the plant' },
  { id: 'bird', x: 110, y: 150, r: 26, label: 'A bird flew past the window' },
  { id: 'mug', x: 437, y: 285, r: 28, label: 'The mug changed colour' },
];

/* ------------------------------------------------------------------ */
/* Scene 3 — Harbor at Dusk                                            */
/* ------------------------------------------------------------------ */

function drawHarbor(ctx, diffs) {
  skyGradient(ctx, '#2b2d5c', '#e8836b');
  // Moon and stars.
  circle(ctx, 510, 66, 30, '#ffe9a8');
  circle(ctx, 500, 60, 26, '#fff6d6');
  const stars = [[80, 50], [150, 80], [240, 40], [330, 70], [420, 44], [90, 120], [200, 110]];
  stars.forEach(([x, y]) => {
    circle(ctx, x, y, 2.5, '#ffffff');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + 6, y);
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x, y + 6);
    ctx.stroke();
  });
  if (diffs.has('star')) {
    circle(ctx, 280, 130, 2.5, '#ffffff');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(274, 130);
    ctx.lineTo(286, 130);
    ctx.moveTo(280, 124);
    ctx.lineTo(280, 136);
    ctx.stroke();
  }
  // Sea.
  rect(ctx, 0, 260, 600, 160, '#274b7a');
  ctx.strokeStyle = '#3d6ea8';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(40 + i * 110, 300 + (i % 2) * 24);
    ctx.quadraticCurveTo(70 + i * 110, 292 + (i % 2) * 24, 100 + i * 110, 300 + (i % 2) * 24);
    ctx.stroke();
  }
  // Lighthouse on the rocks, left.
  poly(ctx, [[60, 260], [100, 260], [92, 150], [68, 150]], '#f4f1ea');
  rect(ctx, 64, 210, 32, 14, '#e63946');
  rect(ctx, 66, 150, 28, 22, '#33415e');
  circle(ctx, 80, 140, 10, '#ffd93b');
  if (!diffs.has('beam')) {
    ctx.fillStyle = 'rgba(255, 217, 59, 0.35)';
    ctx.beginPath();
    ctx.moveTo(90, 140);
    ctx.lineTo(240, 108);
    ctx.lineTo(240, 172);
    ctx.closePath();
    ctx.fill();
  }
  ellipse(ctx, 80, 268, 70, 16, '#5b6b7a');
  // Sailboat, centre.
  rect(ctx, 268, 250, 6, 70, '#6b4423');
  poly(ctx, [[274, 250], [274, 180], [330, 250]], diffs.has('sail') ? '#e63946' : '#ffffff');
  poly(ctx, [[268, 250], [268, 190], [228, 250]], '#f4f1ea');
  poly(ctx, [[262, 250], [330, 250], [318, 272], [272, 272]], '#8a5a2b');
  if (!diffs.has('flag')) {
    ctx.strokeStyle = '#33415e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(271, 180);
    ctx.lineTo(271, 164);
    ctx.stroke();
    poly(ctx, [[271, 164], [292, 170], [271, 176]], '#e63946');
  }
  // Gulls; one more joins in the variant.
  birdShape(ctx, 200, 90, 0.9, '#1d2733');
  birdShape(ctx, 250, 70, 0.8, '#1d2733');
  if (diffs.has('gull')) birdShape(ctx, 380, 96, 0.9, '#1d2733');
  // Buoy bobbing near the boat; it drifts away in the variant.
  if (!diffs.has('buoy')) {
    ellipse(ctx, 430, 330, 16, 10, '#e63946');
    rect(ctx, 426, 312, 8, 12, '#e63946');
    circle(ctx, 430, 310, 3, '#ffd93b');
  }
  // Crates on the pier, right.
  rect(ctx, 480, 300, 90, 40, '#8a5a2b');
  rect(ctx, 480, 340, 90, 40, '#6b4423');
  rect(ctx, 492, 268, 60, 32, '#a9713f');
  if (!diffs.has('crate')) rect(ctx, 500, 236, 44, 32, '#8a5a2b');
  ctx.strokeStyle = '#3d2b1a';
  ctx.lineWidth = 2;
  ctx.strokeRect(480, 300, 90, 40);
  ctx.strokeRect(480, 340, 90, 40);
  // Pier planks.
  rect(ctx, 440, 380, 160, 14, '#5b4632');
  rect(ctx, 448, 394, 10, 26, '#5b4632');
  rect(ctx, 580, 394, 10, 26, '#5b4632');
}

const HARBOR_DIFFS = [
  { id: 'beam', x: 165, y: 140, r: 30, label: "The lighthouse beam went dark" },
  { id: 'sail', x: 302, y: 215, r: 30, label: 'The sail changed colour' },
  { id: 'gull', x: 380, y: 96, r: 26, label: 'Another gull joined the sky' },
  { id: 'buoy', x: 430, y: 322, r: 28, label: 'The buoy drifted away' },
  { id: 'crate', x: 522, y: 252, r: 28, label: 'A crate went missing from the stack' },
  { id: 'star', x: 280, y: 130, r: 24, label: 'A new star appeared' },
  { id: 'flag', x: 281, y: 170, r: 24, label: 'The boat lost its flag' },
];

/* ------------------------------------------------------------------ */
/* Scene 4 — Enchanted Forest                                          */
/* ------------------------------------------------------------------ */

function drawForest(ctx, diffs) {
  skyGradient(ctx, '#0f2b1a', '#2c5d3f');
  // Tall trees.
  const trunks = [[70, 0], [180, 0], [320, 0], [450, 0], [540, 0]];
  trunks.forEach(([x], i) => {
    rect(ctx, x, 60, 26, 360, '#4a3220');
    ellipse(ctx, x + 13, 70, 70 + (i % 2) * 14, 60, i % 2 ? '#1e5c34' : '#26703f');
    ellipse(ctx, x + 13, 130, 56, 44, '#2f7d44');
  });
  // Forest floor.
  ellipse(ctx, 300, 430, 340, 60, '#3a7d44');
  rect(ctx, 0, 380, 600, 40, '#4a9b52');
  // Stream winding through.
  ctx.fillStyle = '#5ec8e8';
  ctx.beginPath();
  ctx.moveTo(380, 420);
  ctx.quadraticCurveTo(360, 380, 400, 350);
  ctx.quadraticCurveTo(430, 330, 420, 310);
  ctx.lineTo(470, 310);
  ctx.quadraticCurveTo(480, 340, 450, 360);
  ctx.quadraticCurveTo(420, 390, 440, 420);
  ctx.closePath();
  ctx.fill();
  if (!diffs.has('stone')) ellipse(ctx, 418, 372, 16, 10, '#8d99ae');
  // Mushroom cluster, left.
  ellipse(ctx, 130, 356, 10, 22, '#f4f1ea');
  ellipse(ctx, 130, 336, 26, 14, '#e63946');
  circle(ctx, 122, 332, 3, '#ffffff');
  circle(ctx, 138, 330, 3, '#ffffff');
  if (!diffs.has('spots')) circle(ctx, 130, 326, 3, '#ffffff');
  ellipse(ctx, 168, 362, 8, 16, '#f4f1ea');
  ellipse(ctx, 168, 348, 19, 11, '#e63946');
  // Owl on a branch, centre.
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(250, 210);
  ctx.lineTo(350, 210);
  ctx.stroke();
  ellipse(ctx, 300, 178, 26, 32, '#8a6d4b');
  circle(ctx, 300, 148, 20, '#8a6d4b');
  poly(ctx, [[282, 134], [288, 118], [294, 132]], '#8a6d4b');
  poly(ctx, [[306, 132], [312, 118], [318, 134]], '#8a6d4b');
  if (diffs.has('eyes')) {
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(288, 146);
    ctx.lineTo(296, 146);
    ctx.moveTo(304, 146);
    ctx.lineTo(312, 146);
    ctx.stroke();
  } else {
    circle(ctx, 292, 146, 5, '#ffffff');
    circle(ctx, 308, 146, 5, '#ffffff');
    circle(ctx, 292, 146, 2.5, '#1d2733');
    circle(ctx, 308, 146, 2.5, '#1d2733');
  }
  poly(ctx, [[300, 154], [295, 160], [305, 160]], '#f5a623');
  // Fireflies glowing in the dark.
  const flies = [[90, 250], [210, 280], [480, 240], [540, 300], [380, 260]];
  flies.forEach(([x, y]) => {
    ctx.fillStyle = 'rgba(255, 240, 120, 0.25)';
    circle(ctx, x, y, 10, 'rgba(255, 240, 120, 0.25)');
    circle(ctx, x, y, 3.5, '#fff078');
  });
  if (diffs.has('firefly')) {
    ctx.fillStyle = 'rgba(255, 240, 120, 0.25)';
    circle(ctx, 250, 320, 10, 'rgba(255, 240, 120, 0.25)');
    circle(ctx, 250, 320, 3.5, '#fff078');
  }
  // Wildflowers; one changes colour.
  flower(ctx, 60, 396, '#ffffff', '#ffd93b');
  flower(ctx, 520, 392, '#ffffff', '#ffd93b');
  flower(ctx, 240, 400, diffs.has('bloom') ? '#ff8fa3' : '#c084fc', '#ffd93b');
  // Butterfly over the stream; it appears only in the variant.
  if (diffs.has('butterfly')) {
    ellipse(ctx, 452, 300, 9, 6, '#c084fc');
    ellipse(ctx, 468, 300, 9, 6, '#c084fc');
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(460, 294);
    ctx.lineTo(460, 308);
    ctx.stroke();
  }
  // Acorn on the ground; it rolls away in the variant.
  if (!diffs.has('acorn')) {
    circle(ctx, 200, 402, 8, '#8a5a2b');
    ellipse(ctx, 200, 394, 9, 4, '#6b4423');
  }
}

const FOREST_DIFFS = [
  { id: 'eyes', x: 300, y: 146, r: 26, label: 'The owl closed its eyes' },
  { id: 'spots', x: 130, y: 326, r: 26, label: 'A spot vanished from the mushroom' },
  { id: 'firefly', x: 250, y: 320, r: 26, label: 'A new firefly lit up' },
  { id: 'bloom', x: 240, y: 400, r: 24, label: 'A flower changed colour' },
  { id: 'stone', x: 418, y: 372, r: 26, label: 'A stone vanished from the stream' },
  { id: 'butterfly', x: 460, y: 300, r: 26, label: 'A butterfly fluttered in' },
  { id: 'acorn', x: 200, y: 398, r: 24, label: 'The acorn rolled away' },
];

/* ------------------------------------------------------------------ */
/* Scene 5 — Space Station                                             */
/* ------------------------------------------------------------------ */

function drawSpace(ctx, diffs) {
  rect(ctx, 0, 0, 600, 420, '#050914');
  // Stars.
  const stars = [[40, 60], [120, 40], [200, 90], [280, 50], [360, 80], [450, 40], [520, 100], [90, 140], [180, 160], [330, 140], [430, 170], [560, 60], [60, 220], [500, 200]];
  stars.forEach(([x, y], i) => {
    circle(ctx, x, y, i % 3 === 0 ? 2.5 : 1.8, '#ffffff');
  });
  if (diffs.has('star')) circle(ctx, 250, 200, 2.5, '#ffffff');
  // Ringed planet.
  circle(ctx, 470, 110, 52, '#c96f4a');
  circle(ctx, 452, 96, 12, '#e8836b');
  circle(ctx, 486, 126, 9, '#a85a3c');
  if (!diffs.has('ring')) {
    ctx.strokeStyle = 'rgba(242, 201, 76, 0.85)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(470, 110, 78, 18, -0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Comet streaking in, only in the variant.
  if (diffs.has('comet')) {
    ctx.strokeStyle = 'rgba(160, 220, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 300);
    ctx.lineTo(180, 260);
    ctx.stroke();
    circle(ctx, 184, 257, 5, '#dff3ff');
  }
  // Space station, centre left.
  rect(ctx, 90, 180, 150, 46, '#cbd5e1');
  rect(ctx, 90, 180, 150, 10, '#94a3b8');
  rect(ctx, 240, 168, 26, 70, '#8d99ae');
  circle(ctx, 253, 203, 12, diffs.has('window') ? '#33415e' : '#ffd93b');
  ctx.fillStyle = '#2b6cb0';
  rect(ctx, 60, 168, 30, 90, '#2b6cb0');
  ctx.fillStyle = '#2c5282';
  for (let i = 0; i < 4; i += 1) ctx.fillRect(62, 172 + i * 22, 26, 3);
  ctx.fillStyle = '#2b6cb0';
  rect(ctx, 266, 168, 30, 90, '#2b6cb0');
  ctx.fillStyle = '#2c5282';
  for (let i = 0; i < 4; i += 1) ctx.fillRect(268, 172 + i * 22, 26, 3);
  // Rocket climbing, right.
  poly(ctx, [[380, 300], [404, 300], [392, 250]], '#e8e8e8');
  poly(ctx, [[392, 250], [380, 268], [392, 258], [404, 268]], '#e63946');
  circle(ctx, 392, 282, 7, '#4aa8dd');
  poly(ctx, [[380, 300], [368, 318], [380, 306]], '#e63946');
  poly(ctx, [[404, 300], [416, 318], [404, 306]], '#e63946');
  if (!diffs.has('flame')) {
    poly(ctx, [[384, 300], [400, 300], [392, 330]], '#ff8c42');
    poly(ctx, [[388, 300], [396, 300], [392, 316]], '#ffd93b');
  }
  // Astronaut floating, tethered.
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(240, 220);
  ctx.quadraticCurveTo(280, 260, 320, 300);
  ctx.stroke();
  circle(ctx, 330, 312, 16, '#ffffff');
  ctx.fillStyle = '#4aa8dd';
  ctx.fillRect(318, 304, 24, 14);
  ellipse(ctx, 332, 344, 16, 20, '#ffffff');
  rect(ctx, 320, 360, 10, 16, '#ffffff');
  rect(ctx, 336, 360, 10, 16, '#ffffff');
  // Mission patch on the suit; its colour changes.
  circle(ctx, 324, 340, 5, diffs.has('patch') ? '#4aa8dd' : '#e63946');
  // Satellite, top centre, its dish tilting.
  rect(ctx, 250, 60, 60, 22, '#8d99ae');
  ctx.strokeStyle = '#8d99ae';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(280, 82);
  ctx.lineTo(280, 104);
  ctx.stroke();
  ctx.beginPath();
  if (diffs.has('dish')) {
    ctx.moveTo(280, 104);
    ctx.lineTo(300, 118);
  } else {
    ctx.moveTo(280, 104);
    ctx.lineTo(262, 118);
  }
  ctx.stroke();
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(diffs.has('dish') ? 302 : 260, 120, 10, 0, Math.PI * 2);
  ctx.fill();
  // Earth rising at the bottom.
  ctx.beginPath();
  ctx.arc(300, 560, 180, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#2b6cb0';
  ctx.fill();
  ellipse(ctx, 240, 400, 40, 16, '#2f9e44');
  ellipse(ctx, 350, 408, 30, 12, '#2f9e44');
}

const SPACE_DIFFS = [
  { id: 'flame', x: 392, y: 312, r: 28, label: "The rocket's flame went out" },
  { id: 'patch', x: 324, y: 340, r: 24, label: "The astronaut's patch changed colour" },
  { id: 'dish', x: 281, y: 112, r: 28, label: 'The satellite dish tilted the other way' },
  { id: 'star', x: 250, y: 200, r: 24, label: 'A new star appeared' },
  { id: 'ring', x: 470, y: 110, r: 40, label: "The planet lost its ring" },
  { id: 'comet', x: 160, y: 276, r: 30, label: 'A comet streaked across the sky' },
  { id: 'window', x: 253, y: 203, r: 24, label: 'A station window went dark' },
];

/* ------------------------------------------------------------------ */
/* Scene 6 — Market Street                                             */
/* ------------------------------------------------------------------ */

function drawMarket(ctx, diffs) {
  skyGradient(ctx, '#8ecae6', '#fdf0d5');
  circle(ctx, 520, 60, 26, '#ffd93b');
  cloud(ctx, 120, 60, 0.9, '#ffffff');
  cloud(ctx, 340, 44, 0.7, '#ffffff');
  // Buildings behind.
  rect(ctx, 0, 120, 120, 220, '#e07a5f');
  rect(ctx, 130, 90, 130, 250, '#f2c94c');
  rect(ctx, 480, 100, 120, 240, '#81b29a');
  ctx.fillStyle = '#33415e';
  ctx.fillRect(30, 160, 24, 30);
  ctx.fillRect(70, 160, 24, 30);
  ctx.fillRect(170, 130, 24, 30);
  ctx.fillRect(210, 130, 24, 30);
  ctx.fillRect(510, 140, 24, 30);
  ctx.fillRect(550, 140, 24, 30);
  // Cat on the roof, only in the variant.
  if (diffs.has('cat')) {
    ellipse(ctx, 195, 86, 16, 8, '#33415e');
    circle(ctx, 208, 78, 7, '#33415e');
    poly(ctx, [[203, 73], [205, 66], [208, 73]], '#33415e');
  }
  // Bunting across the street; one flag goes missing.
  ctx.strokeStyle = '#33415e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.quadraticCurveTo(300, 200, 600, 150);
  ctx.stroke();
  const flagColors = ['#e63946', '#ffd93b', '#4aa8dd', '#2f9e44', '#c084fc', '#ff8c42'];
  for (let i = 0; i < 12; i += 1) {
    if (diffs.has('bunting') && i === 6) continue;
    const x = 25 + i * 48;
    const y = 150 + Math.sin((x / 600) * Math.PI) * 26 + 8;
    poly(ctx, [[x - 10, y], [x + 10, y], [x, y + 18]], flagColors[i % flagColors.length]);
  }
  // Market stall, centre.
  rect(ctx, 210, 220, 180, 14, '#8a5a2b');
  rect(ctx, 222, 234, 12, 90, '#6b4423');
  rect(ctx, 366, 234, 12, 90, '#6b4423');
  // Striped awning; its stripes change colour.
  const stripe = diffs.has('awning') ? '#ff8c42' : '#4aa8dd';
  for (let i = 0; i < 6; i += 1) {
    poly(ctx, [[210 + i * 30, 220], [240 + i * 30, 220], [232 + i * 30, 196], [218 + i * 30, 196]], i % 2 ? '#ffffff' : stripe);
  }
  rect(ctx, 210, 196, 180, 8, stripe);
  // Stall sign: round in the base, square in the variant.
  if (diffs.has('sign')) {
    rect(ctx, 282, 168, 36, 22, '#f4f1ea');
    ctx.strokeStyle = '#33415e';
    ctx.lineWidth = 2;
    ctx.strokeRect(282, 168, 36, 22);
  } else {
    circle(ctx, 300, 179, 16, '#f4f1ea');
    ctx.strokeStyle = '#33415e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(300, 179, 16, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Fruit on the stall.
  circle(ctx, 250, 212, 9, '#e63946');
  circle(ctx, 272, 212, 9, '#e63946');
  circle(ctx, 330, 212, 9, '#ff8c42');
  circle(ctx, 352, 212, 9, '#ff8c42');
  // Balloons tied to the stall; one changes colour.
  ctx.strokeStyle = '#33415e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 320);
  ctx.lineTo(150, 240);
  ctx.moveTo(450, 320);
  ctx.lineTo(450, 240);
  ctx.stroke();
  ellipse(ctx, 150, 216, 18, 24, diffs.has('balloon') ? '#2f9e44' : '#e63946');
  ellipse(ctx, 450, 216, 18, 24, '#4aa8dd');
  // Bicycle with a basket, right.
  ctx.strokeStyle = '#33415e';
  ctx.lineWidth = 4;
  circle(ctx, 480, 360, 22, '#33415e');
  circle(ctx, 560, 360, 22, '#33415e');
  ctx.beginPath();
  ctx.moveTo(480, 360);
  ctx.lineTo(520, 320);
  ctx.lineTo(560, 360);
  ctx.moveTo(520, 320);
  ctx.lineTo(500, 360);
  ctx.moveTo(520, 320);
  ctx.lineTo(540, 308);
  ctx.stroke();
  rect(ctx, 500, 300, 22, 14, '#8a5a2b');
  if (!diffs.has('bread')) {
    ellipse(ctx, 506, 296, 8, 5, '#e8c98a');
    ellipse(ctx, 516, 296, 8, 5, '#e8c98a');
  }
  // Dog trotting past, left; it wanders off in the variant.
  if (!diffs.has('dog')) {
    ellipse(ctx, 90, 368, 26, 14, '#c98f5f');
    circle(ctx, 114, 356, 12, '#c98f5f');
    poly(ctx, [[106, 348], [110, 338], [114, 348]], '#c98f5f');
    ellipse(ctx, 66, 366, 10, 5, '#c98f5f');
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(76, 380);
    ctx.lineTo(76, 392);
    ctx.moveTo(104, 380);
    ctx.lineTo(104, 392);
    ctx.stroke();
  }
  // Cobblestones.
  rect(ctx, 0, 380, 600, 40, '#b8a88f');
  ctx.strokeStyle = '#9c8a70';
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 60, 380);
    ctx.lineTo(i * 60, 420);
    ctx.stroke();
  }
}

const MARKET_DIFFS = [
  { id: 'balloon', x: 150, y: 216, r: 28, label: 'A balloon changed colour' },
  { id: 'awning', x: 300, y: 208, r: 30, label: 'The awning stripes changed colour' },
  { id: 'dog', x: 90, y: 368, r: 30, label: 'The dog wandered off' },
  { id: 'bread', x: 511, y: 296, r: 24, label: 'The bread vanished from the basket' },
  { id: 'bunting', x: 313, y: 182, r: 24, label: 'A bunting flag went missing' },
  { id: 'cat', x: 195, y: 80, r: 26, label: 'A cat appeared on the roof' },
  { id: 'sign', x: 300, y: 179, r: 26, label: 'The stall sign changed shape' },
];

/* ------------------------------------------------------------------ */
/* The six scenes, in play order.                                      */
/* ------------------------------------------------------------------ */

export const SCENES = [
  { id: 'park', name: 'Sunny Park', subtitle: 'A quiet afternoon in the park', draw: drawPark, diffs: PARK_DIFFS },
  { id: 'kitchen', name: 'Cozy Kitchen', subtitle: 'Tea is brewing — or is it?', draw: drawKitchen, diffs: KITCHEN_DIFFS },
  { id: 'harbor', name: 'Harbor at Dusk', subtitle: 'The boats come home at sunset', draw: drawHarbor, diffs: HARBOR_DIFFS },
  { id: 'forest', name: 'Enchanted Forest', subtitle: 'Something stirs between the trees', draw: drawForest, diffs: FOREST_DIFFS },
  { id: 'space', name: 'Space Station', subtitle: 'Orbiting high above the Earth', draw: drawSpace, diffs: SPACE_DIFFS },
  { id: 'market', name: 'Market Street', subtitle: 'The stalls are buzzing today', draw: drawMarket, diffs: MARKET_DIFFS },
];

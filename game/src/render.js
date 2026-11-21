// Everything the player sees: the HUD, the two picture panels with their
// markers, the title and gallery screens, and the pause / clear / win overlays.
// Buttons are hit-tested through buttonAt(), so the loop owns clicks.

import { FIELD, FONT, FONT_DISPLAY, FOOTER, MODES, MODE_ORDER, PALETTE, PANEL } from './config.js';
import { SCENES } from './scenes.js';
import {
  SCREEN_GALLERY,
  SCREEN_GAME_WIN,
  SCREEN_LEVEL_CLEAR,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TIME_UP,
  SCREEN_TITLE,
} from './state.js';

let buttons = [];

/** One cached thumbnail per scene, drawn once and reused every frame. */
const thumbnails = new Map();
function sceneThumbnail(scene) {
  let thumb = thumbnails.get(scene.id);
  if (!thumb) {
    thumb = document.createElement('canvas');
    thumb.width = 600;
    thumb.height = 420;
    scene.draw(thumb.getContext('2d'), new Set());
    thumbnails.set(scene.id, thumb);
  }
  return thumb;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align, font) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 400} ${size}px ${font || FONT}`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function button(ctx, id, x, y, w, h, label, opts) {
  const o = opts || {};
  buttons.push({ id, x, y, w, h });
  ctx.fillStyle = o.active ? PALETTE.accent : o.disabled ? '#232c40' : PALETTE.button;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = o.active ? PALETTE.accentDark : PALETTE.hudBorder;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, x + w / 2, y + h / 2 + 1, o.size || 18, o.active ? '#1d2733' : o.disabled ? PALETTE.muted : PALETTE.text, o.active ? 700 : 600, 'center');
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawPanelFrame(ctx, x) {
  ctx.fillStyle = PALETTE.panelFrame;
  roundRect(ctx, x - 6, PANEL.y - 6, PANEL.width + 12, PANEL.height + 12, 12);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelFrameInner;
  ctx.lineWidth = 2;
  ctx.stroke();
}

/** A small dark chip labelling a panel, drawn inside its top-left corner. */
function panelChip(ctx, x, label) {
  ctx.font = `700 13px ${FONT}`;
  const w = ctx.measureText(label).width + 24;
  ctx.fillStyle = 'rgba(10, 14, 24, 0.72)';
  roundRect(ctx, x + 10, PANEL.y + 10, w, 26, 13);
  ctx.fill();
  text(ctx, label, x + 22, PANEL.y + 24, 13, '#ffffff', 700);
}

function drawFoundMarker(ctx, x, y, at, now) {
  const age = now - at;
  const r = 26 + (age < 0.25 ? (0.25 - age) * 60 : 0);
  ctx.strokeStyle = PALETTE.good;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x - 3, y + 8);
  ctx.lineTo(x + 11, y - 8);
  ctx.stroke();
}

function drawPlay(ctx, g, pointer) {
  const s = g.state;
  // Top HUD.
  ctx.fillStyle = PALETTE.hudPanel;
  ctx.fillRect(0, 0, FIELD.width, 76);
  ctx.fillStyle = PALETTE.hudBorder;
  ctx.fillRect(0, 76, FIELD.width, 2);
  text(ctx, 'PICTURE HUNT', 30, 30, 24, PALETTE.accent, 800, 'left', FONT_DISPLAY);
  text(ctx, `${s.scene.name}  ·  ${s.scene.subtitle}`, 30, 56, 14, PALETTE.muted, 400);
  const found = s.found.size;
  const total = s.activeDiffs.length;
  text(ctx, `FOUND  ${found} / ${total}`, 640, 32, 30, found === total ? PALETTE.good : PALETTE.text, 800, 'center', FONT_DISPLAY);
  // Remaining pips under the counter.
  for (let i = 0; i < total; i += 1) {
    ctx.fillStyle = i < found ? PALETTE.good : '#3a4763';
    ctx.beginPath();
    ctx.arc(640 - ((total - 1) * 16) / 2 + i * 16, 58, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, `SCORE  ${s.score}`, 980, 26, 20, PALETTE.text, 700, 'left');
  if (s.combo > 1) text(ctx, `COMBO x${s.combo}`, 980, 52, 16, PALETTE.gold, 800, 'left');
  if (s.timeTotal > 0) {
    const urgent = s.timeLeft <= 10;
    text(ctx, `TIME ${formatTime(s.timeLeft)}`, 1250, 26, 22, urgent ? PALETTE.bad : PALETTE.text, 800, 'right');
    text(ctx, MODES[s.modeId].name.toUpperCase(), 1250, 52, 13, PALETTE.muted, 600, 'right');
  } else {
    text(ctx, MODES[s.modeId].name.toUpperCase(), 1250, 26, 16, PALETTE.muted, 700, 'right');
    text(ctx, `BEST ${s.save.best}`, 1250, 52, 13, PALETTE.muted, 600, 'right');
  }

  // The two pictures.
  drawPanelFrame(ctx, PANEL.leftX);
  drawPanelFrame(ctx, PANEL.rightX);
  if (s.panels) {
    ctx.drawImage(s.panels.base, PANEL.leftX, PANEL.y);
    ctx.drawImage(s.panels.variant, PANEL.rightX, PANEL.y);
  }
  // Small label chips inside each panel's top-left corner.
  panelChip(ctx, PANEL.leftX, 'ORIGINAL');
  panelChip(ctx, PANEL.rightX, 'FIND THE DIFFERENCES');
  // Markers on both panels for every difference found.
  for (const mark of s.foundMarks) {
    drawFoundMarker(ctx, PANEL.leftX + mark.x, PANEL.y + mark.y, mark.at, s.elapsed);
    drawFoundMarker(ctx, PANEL.rightX + mark.x, PANEL.y + mark.y, mark.at, s.elapsed);
  }
  // Wrong-click X marks.
  for (const flash of s.wrongFlashes) {
    const ox = flash.panel === 'left' ? PANEL.leftX : PANEL.rightX;
    ctx.strokeStyle = PALETTE.bad;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const x = ox + flash.x;
    const y = PANEL.y + flash.y;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 12);
    ctx.lineTo(x + 12, y + 12);
    ctx.moveTo(x + 12, y - 12);
    ctx.lineTo(x - 12, y + 12);
    ctx.stroke();
  }
  // Hint pulse on both panels.
  if (s.hintPulse) {
    const pulse = 22 + Math.sin(s.elapsed * 6) * 6;
    for (const ox of [PANEL.leftX, PANEL.rightX]) {
      ctx.strokeStyle = PALETTE.hint;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(ox + s.hintPulse.x, PANEL.y + s.hintPulse.y, pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = PALETTE.hint;
      ctx.font = `700 13px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('LOOK HERE', ox + s.hintPulse.x, PANEL.y + s.hintPulse.y - pulse - 12);
    }
  }
  // Crosshair at the pointer, over the panels only.
  if (pointer.inside && pointer.y >= PANEL.y && pointer.y < PANEL.y + PANEL.height) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pointer.x - 20, pointer.y);
    ctx.lineTo(pointer.x - 8, pointer.y);
    ctx.moveTo(pointer.x + 8, pointer.y);
    ctx.lineTo(pointer.x + 20, pointer.y);
    ctx.moveTo(pointer.x, pointer.y - 20);
    ctx.lineTo(pointer.x, pointer.y - 8);
    ctx.moveTo(pointer.x, pointer.y + 8);
    ctx.lineTo(pointer.x, pointer.y + 20);
    ctx.stroke();
  }

  // Footer: toast, level dots, buttons.
  ctx.fillStyle = PALETTE.hudPanel;
  ctx.fillRect(0, FOOTER.y, FIELD.width, FOOTER.height);
  ctx.fillStyle = PALETTE.hudBorder;
  ctx.fillRect(0, FOOTER.y, FIELD.width, 2);
  const toast = s.toast && s.toast.until > s.elapsed ? s.toast.text : 'Click a difference on either picture — or press H for a hint.';
  text(ctx, toast, 640, FOOTER.y + 34, 19, PALETTE.text, 600, 'center');
  // Level dots.
  SCENES.forEach((scene, i) => {
    const cx = 640 - ((SCENES.length - 1) * 34) / 2 + i * 34;
    const cy = FOOTER.y + 66;
    ctx.fillStyle = i === s.sceneIndex ? PALETTE.accent : s.save.cleared[scene.id] ? PALETTE.good : i < s.save.unlocked ? '#3a4763' : '#232c40';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, String(i + 1), cx, cy + 26, 12, PALETTE.muted, 600, 'center');
  });
  text(ctx, 'LEVELS', 640 - ((SCENES.length - 1) * 34) / 2 - 66, FOOTER.y + 66, 13, PALETTE.muted, 700, 'right');
  button(ctx, 'hint', 30, FOOTER.y + 96, 220, 52, `HINT  (${s.hintsLeft} left)`, { disabled: s.hintsLeft <= 0 });
  button(ctx, 'pause', 270, FOOTER.y + 96, 150, 52, 'PAUSE');
  button(ctx, 'gallery', 440, FOOTER.y + 96, 150, 52, 'LEVELS');
  button(ctx, 'mute', 1100, FOOTER.y + 96, 150, 52, 'SOUND');
  text(ctx, 'Arrows / mouse to aim · Enter or click to mark · H hint · P pause · M mute', 640, FOOTER.y + 168, 13, PALETTE.muted, 400, 'center');
}

function drawTitle(ctx, g) {
  const s = g.state;
  ctx.fillStyle = PALETTE.backdropTop;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  text(ctx, 'PICTURE HUNT', 640, 120, 72, PALETTE.accent, 800, 'center', FONT_DISPLAY);
  text(ctx, 'SPOT THE DIFFERENCE', 640, 168, 26, PALETTE.text, 700, 'center', FONT_DISPLAY);
  text(ctx, 'Six hand-drawn scenes. Two pictures. Seven sneaky differences each.', 640, 208, 19, PALETTE.muted, 400, 'center');
  text(ctx, 'Find them all before the clock runs out — combos multiply your score.', 640, 236, 19, PALETTE.muted, 400, 'center');
  // Mode selector.
  text(ctx, 'DIFFICULTY', 640, 300, 15, PALETTE.muted, 700, 'center');
  MODE_ORDER.forEach((modeId, i) => {
    const mode = MODES[modeId];
    button(ctx, `mode:${modeId}`, 340 + i * 210, 318, 190, 64, mode.name, { active: s.modeId === modeId });
    text(ctx, mode.label, 435 + i * 210, 396, 13, PALETTE.muted, 400, 'center');
  });
  button(ctx, 'play', 490, 440, 300, 64, '▶  START HUNTING', { size: 22 });
  if (s.save.best > 0) text(ctx, `BEST SCORE  ${s.save.best}`, 640, 532, 18, PALETTE.gold, 700, 'center');
  text(ctx, 'How to play: click a difference on either picture. Wrong clicks cost points.', 640, 580, 16, PALETTE.muted, 400, 'center');
  text(ctx, 'Mouse or arrow keys to aim · Enter or click to mark · H hint · P pause', 640, 608, 16, PALETTE.muted, 400, 'center');
  text(ctx, 'All art is drawn in code — no photos, no copied games.', 640, 648, 14, PALETTE.muted, 400, 'center');
}

function drawGallery(ctx, g) {
  const s = g.state;
  text(ctx, 'CHOOSE A SCENE', 640, 64, 40, PALETTE.text, 800, 'center', FONT_DISPLAY);
  text(ctx, `${MODES[s.modeId].name} mode · ${MODES[s.modeId].label}`, 640, 100, 16, PALETTE.muted, 400, 'center');
  const cardW = 380;
  const cardH = 250;
  const gapX = 30;
  const gapY = 26;
  const startX = (FIELD.width - (cardW * 3 + gapX * 2)) / 2;
  const startY = 132;
  SCENES.forEach((scene, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);
    const locked = i >= s.save.unlocked;
    const cleared = !!s.save.cleared[scene.id];
    buttons.push({ id: `level:${i}`, x, y, w: cardW, h: cardH, disabled: locked });
    ctx.fillStyle = locked ? '#1a2233' : PALETTE.hudPanel;
    roundRect(ctx, x, y, cardW, cardH, 14);
    ctx.fill();
    ctx.strokeStyle = cleared ? PALETTE.good : PALETTE.hudBorder;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (!locked) {
      const thumb = sceneThumbnail(scene);
      ctx.drawImage(thumb, x + 10, y + 10, cardW - 20, 176);
    } else {
      ctx.strokeStyle = PALETTE.muted;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x + cardW / 2, y + 88, 16, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = PALETTE.muted;
      ctx.fillRect(x + cardW / 2 - 20, y + 88, 40, 28);
      text(ctx, 'LOCKED', x + cardW / 2, y + 140, 15, PALETTE.muted, 700, 'center');
      text(ctx, 'Clear the previous scene to unlock', x + cardW / 2, y + 164, 13, PALETTE.muted, 400, 'center');
    }
    text(ctx, `${i + 1}. ${scene.name}`, x + 16, y + 208, 20, locked ? PALETTE.muted : PALETTE.text, 700);
    text(ctx, cleared ? `✓ Cleared · best ${s.save.cleared[scene.id]} pts` : scene.subtitle, x + 16, y + 232, 13, cleared ? PALETTE.good : PALETTE.muted, 400);
  });
  button(ctx, 'back-title', 490, 668, 300, 44, '←  BACK TO TITLE');
}

function drawOverlay(ctx, title, lines, buttonSpecs) {
  ctx.fillStyle = 'rgba(10, 14, 24, 0.78)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  const w = 640;
  const h = 120 + lines.length * 34 + 96;
  const x = (FIELD.width - w) / 2;
  const y = (FIELD.height - h) / 2;
  ctx.fillStyle = PALETTE.hudPanel;
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = PALETTE.hudBorder;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, title, 640, y + 52, 36, PALETTE.accent, 800, 'center', FONT_DISPLAY);
  lines.forEach((line, i) => {
    text(ctx, line.text, 640, y + 108 + i * 34, line.size || 19, line.color || PALETTE.text, line.weight || 400, 'center');
  });
  const totalW = buttonSpecs.reduce((sum, b) => sum + b.w + 16, -16);
  let bx = 640 - totalW / 2;
  buttonSpecs.forEach((b) => {
    button(ctx, b.id, bx, y + h - 72, b.w, 52, b.label);
    bx += b.w + 16;
  });
}

function drawLevelClear(ctx, g) {
  const s = g.state;
  drawPlay(ctx, g, { inside: false, x: 0, y: 0 });
  const gained = s.score - s.levelStartScore;
  drawOverlay(ctx, 'LEVEL CLEAR!', [
    { text: `${s.scene.name} — all ${s.activeDiffs.length} differences found`, color: PALETTE.good, weight: 700 },
    { text: `Level score  ${gained} points`, size: 22, weight: 700 },
    { text: `Total score  ${s.score}   ·   Best  ${s.save.best}`, color: PALETTE.muted },
    { text: s.sceneIndex + 1 < SCENES.length ? `Next: ${SCENES[s.sceneIndex + 1].name}` : 'That was the last scene!', color: PALETTE.muted },
  ], s.sceneIndex + 1 < SCENES.length
    ? [{ id: 'next', label: 'NEXT LEVEL ▶', w: 200 }, { id: 'gallery', label: 'LEVELS', w: 150 }, { id: 'replay', label: 'REPLAY', w: 150 }]
    : [{ id: 'gallery', label: 'LEVELS', w: 150 }, { id: 'replay', label: 'REPLAY', w: 150 }]);
}

function drawGameWin(ctx, g) {
  const s = g.state;
  drawPlay(ctx, g, { inside: false, x: 0, y: 0 });
  drawOverlay(ctx, 'YOU FOUND THEM ALL!', [
    { text: 'Every difference in all six scenes — a perfect hunt.', color: PALETTE.good, weight: 700 },
    { text: `Final score  ${s.score}`, size: 24, weight: 800 },
    { text: `Best score  ${s.save.best}`, color: PALETTE.gold, weight: 700 },
    { text: 'Try Expert mode for 7 differences and a 75-second clock.', color: PALETTE.muted },
  ], [
    { id: 'gallery', label: 'PLAY AGAIN', w: 180 },
    { id: 'back-title', label: 'TITLE', w: 150 },
  ]);
}

function drawTimeUp(ctx, g) {
  const s = g.state;
  drawPlay(ctx, g, { inside: false, x: 0, y: 0 });
  drawOverlay(ctx, "TIME'S UP!", [
    { text: `You found ${s.found.size} of ${s.activeDiffs.length} differences in ${s.scene.name}.`, color: PALETTE.text, weight: 600 },
    { text: `Score  ${s.score}   ·   Best  ${s.save.best}`, color: PALETTE.muted },
    { text: 'The unfound ones are still hiding in the right picture.', color: PALETTE.muted },
  ], [
    { id: 'retry', label: 'TRY AGAIN', w: 200 },
    { id: 'gallery', label: 'LEVELS', w: 150 },
  ]);
}

function drawPaused(ctx, g) {
  const s = g.state;
  drawPlay(ctx, g, { inside: false, x: 0, y: 0 });
  drawOverlay(ctx, 'PAUSED', [
    { text: `${s.scene.name} — ${s.found.size} of ${s.activeDiffs.length} found`, color: PALETTE.text, weight: 600 },
    { text: `Score  ${s.score}`, color: PALETTE.muted },
  ], [
    { id: 'resume', label: '▶  RESUME', w: 180 },
    { id: 'retry', label: 'RESTART', w: 150 },
    { id: 'gallery', label: 'LEVELS', w: 150 },
  ]);
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;
  return {
    draw(game, pointer) {
      buttons = [];
      ctx.clearRect(0, 0, FIELD.width, FIELD.height);
      ctx.fillStyle = PALETTE.backdrop;
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      const screen = game.state.screen;
      if (screen === SCREEN_TITLE) drawTitle(ctx, game);
      else if (screen === SCREEN_GALLERY) drawGallery(ctx, game);
      else if (screen === SCREEN_PLAY) drawPlay(ctx, game, pointer);
      else if (screen === SCREEN_PAUSED) drawPaused(ctx, game);
      else if (screen === SCREEN_LEVEL_CLEAR) drawLevelClear(ctx, game);
      else if (screen === SCREEN_GAME_WIN) drawGameWin(ctx, game);
      else if (screen === SCREEN_TIME_UP) drawTimeUp(ctx, game);
    },
    buttonAt(x, y) {
      for (let i = buttons.length - 1; i >= 0; i -= 1) {
        const b = buttons[i];
        if (b.disabled) continue;
        if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) return b.id;
      }
      return null;
    },
  };
}

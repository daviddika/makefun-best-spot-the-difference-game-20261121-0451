// The game's state: screens, levels, scoring, timer, hints, combo and saves.
// One createGame() owns everything the renderer and the loop need; it never
// touches the DOM itself, so the screenshot stager can drive it directly.

import {
  COMBO_WINDOW,
  FIND_POINTS,
  FLAWLESS_BONUS,
  HINTS_PER_LEVEL,
  HINT_COST,
  MAX_COMBO,
  MODES,
  SAVE_KEY,
  TIME_BONUS_PER_SECOND,
  WRONG_PENALTY,
  WRONG_TIME_PENALTY,
} from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_GALLERY = 'gallery';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_CLEAR = 'level-clear';
export const SCREEN_GAME_WIN = 'game-win';
export const SCREEN_TIME_UP = 'time-up';

export function loadSave() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return { best: 0, unlocked: 1, cleared: {}, mode: 'casual' };
    const parsed = JSON.parse(raw);
    return {
      best: Number(parsed.best) || 0,
      unlocked: Math.min(SCENES.length, Math.max(1, Number(parsed.unlocked) || 1)),
      cleared: parsed.cleared || {},
      mode: MODES[parsed.mode] ? parsed.mode : 'casual',
    };
  } catch {
    return { best: 0, unlocked: 1, cleared: {}, mode: 'casual' };
  }
}

function persistSave(save) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Storage can be off: the save then lasts this visit only.
  }
}

/** Build the offscreen pictures for a level: base on the left, variant right. */
function renderPanels(scene, activeDiffs) {
  const base = document.createElement('canvas');
  base.width = 600;
  base.height = 420;
  const variant = document.createElement('canvas');
  variant.width = 600;
  variant.height = 420;
  scene.draw(base.getContext('2d'), new Set());
  scene.draw(variant.getContext('2d'), new Set(activeDiffs.map((d) => d.id)));
  return { base, variant };
}

export function createGame() {
  const save = loadSave();
  const game = {
    screen: SCREEN_TITLE,
    save,
    modeId: save.mode,
    sceneIndex: 0,
    scene: SCENES[0],
    activeDiffs: [],
    found: new Set(),
    panels: null,
    score: 0,
    combo: 0,
    comboTimer: 0,
    timeLeft: 0,
    timeTotal: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintPulse: null, // {x, y, until} — the pulsing ring a hint leaves behind
    wrongFlashes: [], // {x, y, panel, until} — red X marks on wrong clicks
    foundMarks: [], // {x, y, at} — green rings, drawn on both panels
    wrongClicks: 0,
    toast: null, // {text, until} — the "found it" line at the bottom
    levelStartScore: 0,
    timeUpAt: 0,
    lastTickSecond: -1,
    elapsed: 0,
  };

  function startLevel(index) {
    const scene = SCENES[index];
    const mode = MODES[game.modeId];
    game.sceneIndex = index;
    game.scene = scene;
    game.activeDiffs = scene.diffs.slice(0, mode.diffs);
    game.found = new Set();
    game.panels = renderPanels(scene, game.activeDiffs);
    game.hintsLeft = HINTS_PER_LEVEL;
    game.hintPulse = null;
    game.wrongFlashes = [];
    game.foundMarks = [];
    game.wrongClicks = 0;
    game.combo = 0;
    game.comboTimer = 0;
    game.timeTotal = mode.time;
    game.timeLeft = mode.time;
    game.lastTickSecond = -1;
    game.levelStartScore = game.score;
    game.screen = SCREEN_PLAY;
    game.toast = { text: `${scene.name} — find ${game.activeDiffs.length} differences!`, until: game.elapsed + 3 };
  }

  function clearLevel() {
    const mode = MODES[game.modeId];
    let bonus = 0;
    if (mode.time > 0) bonus += Math.ceil(game.timeLeft) * TIME_BONUS_PER_SECOND;
    if (game.wrongClicks === 0) bonus += FLAWLESS_BONUS;
    game.score += bonus;
    game.save.cleared[game.scene.id] = Math.max(game.save.cleared[game.scene.id] || 0, game.score - game.levelStartScore);
    game.save.unlocked = Math.min(SCENES.length, Math.max(game.save.unlocked, game.sceneIndex + 2));
    if (game.score > game.save.best) game.save.best = game.score;
    persistSave(game.save);
    game.screen = game.sceneIndex + 1 >= SCENES.length ? SCREEN_GAME_WIN : SCREEN_LEVEL_CLEAR;
    return bonus;
  }

  function timeUp() {
    game.screen = SCREEN_TIME_UP;
    game.timeUpAt = game.elapsed;
    if (game.score > game.save.best) {
      game.save.best = game.score;
      persistSave(game.save);
    }
  }

  /** Click at logical field coordinates; returns what happened, for sounds. */
  function clickAt(x, y) {
    if (game.screen !== SCREEN_PLAY) return 'none';
    // Which panel, if either, was clicked?
    let panel = null;
    let px = 0;
    let py = 0;
    const panels = [
      { name: 'left', x: 30, y: 92 },
      { name: 'right', x: 650, y: 92 },
    ];
    for (const p of panels) {
      if (x >= p.x && x < p.x + 600 && y >= p.y && y < p.y + 420) {
        panel = p.name;
        px = x - p.x;
        py = y - p.y;
      }
    }
    if (!panel) return 'none';
    // Nearest unfound difference.
    let best = null;
    let bestDist = Infinity;
    for (const diff of game.activeDiffs) {
      if (game.found.has(diff.id)) continue;
      const dist = Math.hypot(px - diff.x, py - diff.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = diff;
      }
    }
    if (best && bestDist <= Math.max(best.r, 30)) {
      game.found.add(best.id);
      game.foundMarks.push({ x: best.x, y: best.y, at: game.elapsed });
      game.combo = game.comboTimer > 0 ? Math.min(game.combo + 1, MAX_COMBO) : 1;
      game.comboTimer = COMBO_WINDOW;
      const gained = FIND_POINTS * game.combo;
      game.score += gained;
      game.toast = { text: `Found it! ${best.label}  (+${gained}${game.combo > 1 ? ` · combo x${game.combo}` : ''})`, until: game.elapsed + 3 };
      game.hintPulse = null;
      if (game.found.size >= game.activeDiffs.length) {
        const bonus = clearLevel();
        game.toast = { text: `Level clear! Bonus +${bonus}`, until: game.elapsed + 4 };
        return 'clear';
      }
      return 'found';
    }
    // Wrong click: penalty, combo broken, red X where it landed.
    game.wrongClicks += 1;
    game.combo = 0;
    game.comboTimer = 0;
    game.score = Math.max(0, game.score - WRONG_PENALTY);
    if (game.timeLeft > 0) game.timeLeft = Math.max(0, game.timeLeft - WRONG_TIME_PENALTY);
    game.wrongFlashes.push({ x: px, y: py, panel, until: game.elapsed + 0.9 });
    game.toast = { text: `Not a difference — −${WRONG_PENALTY} points${game.timeLeft > 0 ? `, −${WRONG_TIME_PENALTY}s` : ''}`, until: game.elapsed + 2 };
    return 'wrong';
  }

  function useHint() {
    if (game.screen !== SCREEN_PLAY || game.hintsLeft <= 0) return null;
    const remaining = game.activeDiffs.filter((d) => !game.found.has(d.id));
    if (remaining.length === 0) return null;
    const diff = remaining[Math.floor(Math.random() * remaining.length)];
    game.hintsLeft -= 1;
    game.score = Math.max(0, game.score - HINT_COST);
    game.hintPulse = { x: diff.x, y: diff.y, until: game.elapsed + 4 };
    game.toast = { text: `Hint: look near here… (−${HINT_COST} points, ${game.hintsLeft} left)`, until: game.elapsed + 3 };
    return diff;
  }

  function setMode(modeId) {
    if (!MODES[modeId]) return;
    game.modeId = modeId;
    game.save.mode = modeId;
    persistSave(game.save);
  }

  function tick(dt) {
    game.elapsed += dt;
    if (game.comboTimer > 0) {
      game.comboTimer -= dt;
      if (game.comboTimer <= 0) game.combo = 0;
    }
    if (game.screen === SCREEN_PLAY && game.timeLeft > 0) {
      game.timeLeft -= dt;
      const whole = Math.ceil(game.timeLeft);
      if (whole <= 10 && whole !== game.lastTickSecond) {
        game.lastTickSecond = whole;
        game.tickSound = true;
      }
      if (game.timeLeft <= 0) {
        game.timeLeft = 0;
        timeUp();
      }
    }
    game.wrongFlashes = game.wrongFlashes.filter((f) => f.until > game.elapsed);
    if (game.hintPulse && game.hintPulse.until <= game.elapsed) game.hintPulse = null;
  }

  return {
    state: game,
    startLevel,
    clickAt,
    useHint,
    setMode,
    tick,
    toTitle() {
      game.screen = SCREEN_TITLE;
    },
    toGallery() {
      game.screen = SCREEN_GALLERY;
    },
    resume() {
      if (game.screen === SCREEN_PAUSED) game.screen = SCREEN_PLAY;
    },
    pause() {
      if (game.screen === SCREEN_PLAY) game.screen = SCREEN_PAUSED;
    },
    nextLevel() {
      startLevel(Math.min(game.sceneIndex + 1, SCENES.length - 1));
    },
    retryLevel() {
      startLevel(game.sceneIndex);
    },
  };
}

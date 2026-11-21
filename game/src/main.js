// Boot and the one loop: input is read every frame, the game advances in fixed
// 1/60 s steps, and the renderer paints what is there. The game moves between
// seven screens: title, gallery, play, paused, level-clear, game-win, time-up.
//
// ?shot=title|gallery|play|clear (with &seed= ignored) stages that scene
// instead of running the loop, paints it twice and sets window.__shotReady.

import { STEP } from './config.js';
import { createGame, SCREEN_PLAY } from './state.js';
import { createInput, ACTION_BACK, ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_PAUSE } from './input.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';
import { isMuted, playClick, playFound, playHint, playLevelClear, playTick, playWrong, setMuted, unlockAudio } from './audio.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const game = createGame();
const renderer = createRenderer(canvas);

function announce(message) {
  status.textContent = message;
}

function runShot(name) {
  const sceneParam = Number.parseInt(params.get('scene') ?? '', 10);
  const staged = stageShot(name, game, Number.isInteger(sceneParam) ? sceneParam : 0);
  let painted = 0;
  function paint() {
    renderer.draw(game, { inside: false, x: 0, y: 0 });
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
  return staged;
}

function runGame() {
  const input = createInput(canvas);
  let best = game.state.save.best;
  let accumulator = 0;
  let last = performance.now();

  function handleButton(id) {
    const s = game.state;
    if (id === 'play') {
      unlockAudio();
      playClick();
      // Start at the first scene not yet cleared, or the first scene.
      const sceneIds = ['park', 'kitchen', 'harbor', 'forest', 'space', 'market'];
      let start = 0;
      while (start < 5 && s.save.cleared[sceneIds[start]]) start += 1;
      game.startLevel(Math.min(start, s.save.unlocked - 1));
      announce(`Playing ${s.scene.name}. Find ${s.activeDiffs.length} differences.`);
    } else if (id.startsWith('mode:')) {
      game.setMode(id.slice(5));
      playClick();
    } else if (id.startsWith('level:')) {
      const index = Number(id.slice(6));
      if (index < s.save.unlocked) {
        unlockAudio();
        playClick();
        game.startLevel(index);
        announce(`Playing ${s.scene.name}. Find ${s.activeDiffs.length} differences.`);
      }
    } else if (id === 'hint') {
      const diff = game.useHint();
      if (diff) playHint();
    } else if (id === 'pause') {
      game.pause();
      playClick();
    } else if (id === 'resume') {
      game.resume();
      playClick();
    } else if (id === 'retry') {
      unlockAudio();
      playClick();
      game.retryLevel();
    } else if (id === 'next') {
      playClick();
      game.nextLevel();
    } else if (id === 'replay') {
      playClick();
      game.retryLevel();
    } else if (id === 'gallery') {
      playClick();
      game.toGallery();
    } else if (id === 'back-title') {
      playClick();
      game.toTitle();
    } else if (id === 'mute') {
      setMuted(!isMuted());
      playClick();
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    const s = game.state;
    if (actions & ACTION_MUTE) setMuted(!isMuted());
    if (actions & ACTION_PAUSE) {
      if (s.screen === SCREEN_PLAY) {
        game.pause();
        announce('Paused.');
      } else if (s.screen === 'paused') {
        game.resume();
        announce('Playing.');
      }
    }
    if (actions & ACTION_HINT && s.screen === SCREEN_PLAY) {
      const diff = game.useHint();
      if (diff) playHint();
    }
    if (actions & ACTION_BACK && (s.screen === 'gallery' || s.screen === 'paused')) {
      game.toTitle();
    }
    if (actions & ACTION_CONFIRM) {
      unlockAudio();
      if (s.screen === 'title') handleButton('play');
      else if (s.screen === SCREEN_PLAY) {
        const result = game.clickAt(input.pointer.x, input.pointer.y);
        if (result === 'found') playFound(s.combo);
        else if (result === 'wrong') playWrong();
        else if (result === 'clear') playLevelClear();
        if (result !== 'none') announce(s.toast ? s.toast.text : '');
      }
    }
  }

  function handleClick() {
    const click = input.takeClick();
    if (!click) return;
    unlockAudio();
    const s = game.state;
    const buttonId = renderer.buttonAt(click.x, click.y);
    if (buttonId) {
      handleButton(buttonId);
      return;
    }
    if (s.screen === SCREEN_PLAY) {
      const result = game.clickAt(click.x, click.y);
      if (result === 'found') playFound(s.combo);
      else if (result === 'wrong') playWrong();
      else if (result === 'clear') playLevelClear();
      if (result !== 'none') announce(s.toast ? s.toast.text : '');
    }
  }

  function step(dt) {
    const before = game.state.screen;
    game.tick(dt);
    if (game.state.tickSound) {
      game.state.tickSound = false;
      playTick();
    }
    if (before === SCREEN_PLAY && game.state.screen === 'time-up') {
      announce(`Time's up. You found ${game.state.found.size} of ${game.state.activeDiffs.length}.`);
    }
    if (before === SCREEN_PLAY && (game.state.screen === 'level-clear' || game.state.screen === 'game-win')) {
      playLevelClear();
      if (game.state.screen === 'game-win') announce(`You found them all! Final score ${game.state.score}.`);
    }
    const delta = input.arrowDelta();
    if (delta && game.state.screen === SCREEN_PLAY) {
      input.pointer.x = Math.max(0, Math.min(1280, input.pointer.x + delta.x * dt));
      input.pointer.y = Math.max(0, Math.min(720, input.pointer.y + delta.y * dt));
      input.pointer.inside = true;
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    handleClick();
    while (accumulator >= STEP) {
      step(STEP);
      accumulator -= STEP;
    }
    renderer.draw(game, input.pointer);
    if (game.state.score > best) best = game.state.score;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.state.screen === SCREEN_PLAY) {
      game.pause();
      announce('Paused.');
    }
  });

  announce('Picture Hunt. Press Enter or click Start Hunting to play.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();

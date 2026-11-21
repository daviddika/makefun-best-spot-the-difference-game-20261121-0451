// The screenshot scenes behind ?shot=title|gallery|play|clear. Each one drives
// the real game into a fixed state and leaves it there, so a screenshot is a
// real render of the game's own code: the play shot has three differences
// already found (green markers on both pictures, several still unfound) and
// the counter reading 3 / 7.

import { SCREEN_GALLERY, SCREEN_LEVEL_CLEAR, SCREEN_PLAY, SCREEN_TITLE } from './state.js';

/** Mark differences as found the way a player would: score, combo, markers. */
function fakeFinds(game, count) {
  const g = game.state;
  for (let i = 0; i < count && i < g.activeDiffs.length; i += 1) {
    const diff = g.activeDiffs[i];
    g.found.add(diff.id);
    g.foundMarks.push({ x: diff.x, y: diff.y, at: 0 });
  }
  g.score = 320;
  g.combo = 2;
  g.comboTimer = 8;
  const lastFound = g.activeDiffs[Math.min(count, g.activeDiffs.length) - 1];
  g.toast = { text: `Found it! ${lastFound.label}  (+200 · combo x2)`, until: 9999 };
}

/**
 * Set the game to the named shot and return the screen to draw. Any other
 * name stages the title. Paints twice, then sets window.__shotReady.
 */
export function stageShot(name, game, sceneIndex) {
  const g = game.state;
  const scene = Number.isInteger(sceneIndex) ? Math.max(0, Math.min(5, sceneIndex)) : 0;
  if (name === 'gallery') {
    game.toGallery();
    return { screen: SCREEN_GALLERY };
  }
  if (name === 'play') {
    game.setMode('expert');
    game.startLevel(scene);
    fakeFinds(game, 3);
    g.timeLeft = 52;
    g.timeTotal = 75;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'clear') {
    game.setMode('timed');
    game.startLevel(1);
    fakeFinds(game, 6);
    // Finish the level for real so the overlay shows the true bonus.
    const last = g.activeDiffs[g.activeDiffs.length - 1];
    g.found.add(last.id);
    g.foundMarks.push({ x: last.x, y: last.y, at: 0 });
    g.score = 640;
    g.save.best = Math.max(g.save.best, 640);
    g.save.cleared.kitchen = 640;
    g.toast = { text: 'Level clear! All 6 differences found in Cozy Kitchen.', until: 9999 };
    game.state.screen = SCREEN_LEVEL_CLEAR;
    return { screen: SCREEN_LEVEL_CLEAR };
  }
  // Title: preload the park pictures so the backdrop strip shows.
  game.setMode('casual');
  game.startLevel(0);
  game.toTitle();
  return { screen: SCREEN_TITLE };
}

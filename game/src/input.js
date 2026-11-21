// Mouse and keyboard input. The pointer is a crosshair the mouse moves and the
// arrow keys nudge; Enter/Space clicks where it sits, so the whole game is
// playable with keyboard alone. Actions are drained once per frame.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_MUTE = 8;
export const ACTION_BACK = 16;

const KEY_ARROW_STEP = 26;

export function createInput(canvas) {
  let actions = 0;
  // Pointer position in logical field coordinates (the canvas is scaled by CSS).
  const pointer = { x: 640, y: 300, inside: false, clicked: false, clickX: 0, clickY: 0 };
  const keys = new Set();

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  canvas.addEventListener('pointermove', (event) => {
    const p = toLogical(event);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.inside = true;
  });
  canvas.addEventListener('pointerdown', (event) => {
    const p = toLogical(event);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.clicked = true;
    pointer.clickX = p.x;
    pointer.clickY = p.y;
    event.preventDefault();
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    keys.add(event.code);
    if (event.code === 'Enter' || event.code === 'Space') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    } else if (event.code === 'KeyP' || event.code === 'Escape') {
      actions |= ACTION_PAUSE;
    } else if (event.code === 'KeyH') {
      actions |= ACTION_HINT;
    } else if (event.code === 'KeyM') {
      actions |= ACTION_MUTE;
    } else if (event.code === 'Backspace') {
      actions |= ACTION_BACK;
    }
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', () => keys.clear());

  return {
    pointer,
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClick() {
      if (!pointer.clicked) return null;
      pointer.clicked = false;
      return { x: pointer.clickX, y: pointer.clickY };
    },
    /** Arrow-key nudge for the crosshair, in logical pixels per second. */
    arrowDelta() {
      let dx = 0;
      let dy = 0;
      if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= 1;
      if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;
      if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= 1;
      if (keys.has('ArrowDown') || keys.has('KeyS')) dy += 1;
      if (dx === 0 && dy === 0) return null;
      const len = Math.hypot(dx, dy);
      return { x: (dx / len) * KEY_ARROW_STEP * 8, y: (dy / len) * KEY_ARROW_STEP * 8 };
    },
  };
}

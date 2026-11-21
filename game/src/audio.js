// Synthesised sound effects with the Web Audio API — no audio files, nothing
// loaded over the network. Every sound is a few oscillators and a gain envelope.

let context = null;
let muted = false;

function audioContext() {
  if (context) return context;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  context = new AudioCtx();
  return context;
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

/** Resume the context after a user gesture (browsers block audio before one). */
export function unlockAudio() {
  const ctx = audioContext();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

function tone(freq, startAt, duration, type, volume, slideTo) {
  const ctx = audioContext();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + startAt + duration);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration + 0.05);
}

/** A satisfying two-note chime when a difference is found. */
export function playFound(combo) {
  const base = 523.25 * Math.pow(1.059463, Math.min(combo, 5));
  tone(base, 0, 0.16, 'sine', 0.22);
  tone(base * 1.5, 0.09, 0.22, 'sine', 0.2);
  tone(base * 2, 0.18, 0.28, 'triangle', 0.12);
}

/** A soft thud for a wrong click. */
export function playWrong() {
  tone(160, 0, 0.18, 'sawtooth', 0.12, 90);
  tone(110, 0.02, 0.2, 'square', 0.06, 70);
}

/** A sparkle arpeggio when a hint is spent. */
export function playHint() {
  tone(880, 0, 0.12, 'sine', 0.14);
  tone(1174.66, 0.07, 0.12, 'sine', 0.14);
  tone(1567.98, 0.14, 0.2, 'sine', 0.12);
}

/** A click for buttons and menu moves. */
export function playClick() {
  tone(660, 0, 0.06, 'triangle', 0.1);
}

/** A little fanfare when a level is cleared. */
export function playLevelClear() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => tone(freq, i * 0.11, 0.24, 'triangle', 0.18));
  tone(1318.5, 0.46, 0.4, 'sine', 0.14);
}

/** A low tick when the timer drops under ten seconds. */
export function playTick() {
  tone(980, 0, 0.05, 'square', 0.06);
}

/** A short jingle when all six scenes are cleared. */
export function playGameWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
  notes.forEach((freq, i) => tone(freq, i * 0.13, 0.26, 'triangle', 0.16));
}

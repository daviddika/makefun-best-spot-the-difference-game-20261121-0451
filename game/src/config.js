// Picture Hunt — Spot the Difference. Every tuning number, colour and layout
// constant in one place. The playfield is a fixed 1280x720 logical area; the
// renderer scales it to the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** One picture panel: the two near-identical pictures sit side by side. */
export const PANEL = { width: 600, height: 420, y: 92, leftX: 30, rightX: 650 };

/** The top HUD bar and the bottom control bar. */
export const HUD = { height: 76 };
export const FOOTER = { y: 532, height: 188 };

/** How close (in panel pixels) a click must land to a difference to count. */
export const HIT_RADIUS = 34;

/** Points for a find, before the combo multiplier. */
export const FIND_POINTS = 100;
/** Points lost on a wrong click. */
export const WRONG_PENALTY = 25;
/** Seconds lost on a wrong click in Timed / Expert modes. */
export const WRONG_TIME_PENALTY = 5;
/** Points a hint costs. */
export const HINT_COST = 50;
/** Hints per level. */
export const HINTS_PER_LEVEL = 3;
/** Combo multiplier caps at this value. */
export const MAX_COMBO = 5;
/** Seconds a find stays "fresh" for the combo chain. */
export const COMBO_WINDOW = 12;

/** Difficulty modes: how many differences are hidden and how much time. */
export const MODES = {
  casual: { id: 'casual', name: 'Casual', diffs: 5, time: 0, label: 'No timer · 5 differences' },
  timed: { id: 'timed', name: 'Timed', diffs: 6, time: 120, label: '120 seconds · 6 differences' },
  expert: { id: 'expert', name: 'Expert', diffs: 7, time: 75, label: '75 seconds · 7 differences' },
};
export const MODE_ORDER = ['casual', 'timed', 'expert'];

/** Points bonus for finishing a level with time left (per second, Timed/Expert). */
export const TIME_BONUS_PER_SECOND = 10;
/** Points bonus for finishing a level without a wrong click. */
export const FLAWLESS_BONUS = 150;

export const PALETTE = {
  backdrop: '#141a26',
  backdropTop: '#1c2436',
  panelFrame: '#2c3750',
  panelFrameInner: '#46587c',
  text: '#f2f4f8',
  muted: '#9aa7bd',
  accent: '#ffd166',
  accentDark: '#e0a92e',
  good: '#4ade80',
  goodDark: '#16a34a',
  bad: '#f87171',
  hint: '#c084fc',
  hudPanel: '#1e2739',
  hudBorder: '#33415e',
  button: '#2b3a58',
  buttonHover: '#3a4c72',
  gold: '#fbbf24',
  silver: '#cbd5e1',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
export const FONT_DISPLAY = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';

/** Where the best score and unlocked levels are kept between visits. */
export const SAVE_KEY = 'picture-hunt.save.v1';

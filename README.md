# Picture Hunt — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/daviddika/makefun-best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/daviddika/makefun-best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

An original spot-the-difference game for the
[make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451):
two near-identical pictures side by side, find every difference before the
clock runs out. All art is drawn procedurally in code — no photos, no copied
assets, no network requests.

## Play

Serve `game/` with any static server and open `game/index.html` in desktop
Chrome (or run `node serve.mjs` and open http://localhost:8123):

- **Click** a difference on either picture — or aim with the arrow keys and
  press **Enter**. A green ring marks every find on both panels.
- **H** spends a hint (3 per level, −50 points) and pulses a ring around one
  unfound difference. **P** pauses, **M** mutes.
- Wrong clicks cost 25 points (and 5 seconds in Timed/Expert).
- Finds in quick succession build a combo up to x5.

## What's inside

- **6 hand-drawn scenes** — Sunny Park, Cozy Kitchen, Harbor at Dusk,
  Enchanted Forest, Space Station, Market Street — each with 7 differences
  hidden by design (a vanished bird, a clock that moved, a sail that changed
  colour…).
- **3 difficulty modes** — Casual (5 differences, no timer), Timed (6, 120 s),
  Expert (7, 75 s) — with level progression, unlocks, and a gallery.
- **Scoring systems that interact** — combo multiplier, time bonus, flawless
  bonus, hint cost, wrong-click penalty — plus synthesized WebAudio sound
  effects (no audio files) and a persistent best score.
- **Screenshots** are real renders of the game's own code in headless Chrome
  (`?shot=play|gallery|title|clear` stages each scene).

## Layout

- `game/index.html` — the page; `game/src/` — one job per file:
  `config.js` (tuning), `random.js` (seeded RNG), `scenes.js` (the six
  pictures and their differences), `state.js` (rules, scoring, timer),
  `render.js` (HUD, panels, menus), `input.js` (mouse + keyboard),
  `audio.js` (synthesized sounds), `shots.js` (screenshot staging),
  `main.js` (boot + loop).
- `main.ts` — the hand-in program: copies `game/` + `screenshots/` to
  `/output` and writes `dossier.json` via `vendor/makefun-game.ts`.
- `screenshots/` — 4 JPEGs, first by name is the cover.

## License

MIT — see [LICENSE](LICENSE).

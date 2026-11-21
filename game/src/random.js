// A small seeded random generator (mulberry32), so a scene draws the same way
// every time for a given seed — the two panels of a level share one seed and
// differ only where a difference says so.

export function createRandom(seed) {
  let state = seed >>> 0;
  return {
    next() {
      state |= 0;
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(min, max) {
      return min + this.next() * (max - min);
    },
    int(min, max) {
      return Math.floor(this.range(min, max + 1));
    },
    pick(list) {
      return list[Math.floor(this.next() * list.length)];
    },
  };
}

/** A stable seed for a scene: the same scene always draws the same picture. */
export function sceneSeed(sceneIndex) {
  return 0x9e3779b9 ^ (sceneIndex * 2654435761);
}

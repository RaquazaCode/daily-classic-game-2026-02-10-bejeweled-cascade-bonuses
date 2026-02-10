export type RNG = {
  next: () => number;
  nextInt: (maxExclusive: number) => number;
  getState: () => number;
};

function mix32(n: number) {
  let x = n | 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x45d9f3b);
  x ^= x >>> 16;
  x = Math.imul(x, 0x45d9f3b);
  x ^= x >>> 16;
  return x >>> 0;
}

export function seedFromString(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return mix32(hash);
}

export function createRng(initialSeed: number): RNG {
  let state = initialSeed >>> 0;

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    nextInt(maxExclusive: number) {
      if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
        throw new Error(`Invalid maxExclusive: ${maxExclusive}`);
      }
      return Math.floor(next() * maxExclusive);
    },
    getState() {
      return state >>> 0;
    },
  };
}

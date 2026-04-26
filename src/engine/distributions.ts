import type { PRNG } from 'seedrandom';

/**
 * Sample a boolean from a Bernoulli distribution.
 */
export function sampleBinary(rng: PRNG, pTrue: number): boolean {
  return rng() < pTrue;
}

/**
 * Box-Muller transform for normal distribution sampling.
 */
function sampleNormal(rng: PRNG, mean: number, stddev: number): number {
  // rng() returns [0, 1); shift to (0, 1] so log() never sees 0.
  const u1 = 1 - rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

/**
 * Sample from a triangular distribution.
 */
function sampleTriangular(rng: PRNG, min: number, mode: number, max: number): number {
  const u = rng();
  const fc = (mode - min) / (max - min);
  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  }
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

/**
 * Sample from a continuous distribution, optionally clamping to [min, max].
 */
export function sampleContinuous(
  rng: PRNG,
  distribution: { type: 'normal' | 'uniform' | 'triangular'; params: number[] },
  min?: number,
  max?: number
): number {
  let value: number;

  switch (distribution.type) {
    case 'normal':
      value = sampleNormal(rng, distribution.params[0], distribution.params[1]);
      break;
    case 'uniform':
      value = distribution.params[0] + rng() * (distribution.params[1] - distribution.params[0]);
      break;
    case 'triangular':
      value = sampleTriangular(rng, distribution.params[0], distribution.params[1], distribution.params[2]);
      break;
  }

  if (min !== undefined && value < min) value = min;
  if (max !== undefined && value > max) value = max;
  return value;
}

/**
 * Sample a category from a discrete probability distribution.
 */
export function sampleCategorical(rng: PRNG, probabilities: Record<string, number>): string {
  const r = rng();
  let cumulative = 0;
  const entries = Object.entries(probabilities);
  for (const [category, prob] of entries) {
    cumulative += prob;
    if (r < cumulative) return category;
  }
  return entries[entries.length - 1][0];
}

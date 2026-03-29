import { describe, it, expect } from 'vitest';
import seedrandom from 'seedrandom';
import { sampleBinary, sampleContinuous, sampleCategorical } from '@engine/distributions';

describe('sampleBinary', () => {
  it('returns true when random value is below pTrue', () => {
    const rng = seedrandom('test-seed');
    let trueCount = 0;
    const runs = 10000;
    for (let i = 0; i < runs; i++) {
      if (sampleBinary(seedrandom(`seed-${i}`), 0.7)) trueCount++;
    }
    expect(trueCount / runs).toBeCloseTo(0.7, 1);
  });

  it('always returns true when pTrue is 1', () => {
    for (let i = 0; i < 100; i++) {
      expect(sampleBinary(seedrandom(`seed-${i}`), 1.0)).toBe(true);
    }
  });

  it('always returns false when pTrue is 0', () => {
    for (let i = 0; i < 100; i++) {
      expect(sampleBinary(seedrandom(`seed-${i}`), 0.0)).toBe(false);
    }
  });
});

describe('sampleContinuous', () => {
  it('samples from a normal distribution with correct mean', () => {
    const runs = 10000;
    let sum = 0;
    for (let i = 0; i < runs; i++) {
      sum += sampleContinuous(seedrandom(`seed-${i}`), {
        type: 'normal',
        params: [100, 15],
      });
    }
    const mean = sum / runs;
    expect(mean).toBeCloseTo(100, 0);
  });

  it('samples from a uniform distribution within bounds', () => {
    for (let i = 0; i < 1000; i++) {
      const val = sampleContinuous(seedrandom(`seed-${i}`), {
        type: 'uniform',
        params: [10, 20],
      });
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThanOrEqual(20);
    }
  });

  it('samples from a triangular distribution within bounds', () => {
    for (let i = 0; i < 1000; i++) {
      const val = sampleContinuous(seedrandom(`seed-${i}`), {
        type: 'triangular',
        params: [0, 50, 100],
      });
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    }
  });

  it('clamps values to min/max when provided', () => {
    for (let i = 0; i < 1000; i++) {
      const val = sampleContinuous(
        seedrandom(`seed-${i}`),
        { type: 'normal', params: [100, 50] },
        90,
        110
      );
      expect(val).toBeGreaterThanOrEqual(90);
      expect(val).toBeLessThanOrEqual(110);
    }
  });
});

describe('sampleCategorical', () => {
  it('samples from categorical distribution with correct frequencies', () => {
    const probs = { low: 0.2, medium: 0.5, high: 0.3 };
    const counts: Record<string, number> = { low: 0, medium: 0, high: 0 };
    const runs = 10000;
    for (let i = 0; i < runs; i++) {
      const result = sampleCategorical(seedrandom(`seed-${i}`), probs);
      counts[result]++;
    }
    expect(counts.low / runs).toBeCloseTo(0.2, 1);
    expect(counts.medium / runs).toBeCloseTo(0.5, 1);
    expect(counts.high / runs).toBeCloseTo(0.3, 1);
  });

  it('always returns the only option when probability is 1', () => {
    const probs = { only: 1.0 };
    for (let i = 0; i < 100; i++) {
      expect(sampleCategorical(seedrandom(`seed-${i}`), probs)).toBe('only');
    }
  });
});

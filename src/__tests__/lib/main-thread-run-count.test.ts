import { describe, it, expect } from 'vitest';
import { mainThreadRunCount } from '@/hooks/useSimulation';

describe('mainThreadRunCount', () => {
  it('passes through requests at or below the cap', () => {
    expect(mainThreadRunCount(0)).toBe(0);
    expect(mainThreadRunCount(1)).toBe(1);
    expect(mainThreadRunCount(250)).toBe(250);
  });

  it('caps interactive 5000-run jobs at 250 on the main thread', () => {
    expect(mainThreadRunCount(5000)).toBe(250);
    expect(mainThreadRunCount(251)).toBe(250);
  });
});

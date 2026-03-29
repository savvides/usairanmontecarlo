import { describe, it, expect } from 'vitest';
import { computeNodeConfidence, getConfidenceTier } from '@/lib/confidence';
import type { NodeDiagnostics, SourceCitation } from '@engine/types';

describe('computeNodeConfidence', () => {
  it('returns high confidence for all-exact matches with high source', () => {
    const diag: NodeDiagnostics = { exact: 5000, interpolated: 0, default: 0 };
    const source: SourceCitation = { citation: '', url: '', confidence: 'high' };
    const score = computeNodeConfidence(diag, 5000, 'binary', 0.5, source);
    expect(score).toBeGreaterThanOrEqual(0.7);
  });

  it('returns low confidence for all-default with low source', () => {
    const diag: NodeDiagnostics = { exact: 0, interpolated: 0, default: 5000 };
    const source: SourceCitation = { citation: '', url: '', confidence: 'low' };
    const score = computeNodeConfidence(diag, 5000, 'binary', 0.5, source);
    expect(score).toBeLessThan(0.4);
  });

  it('penalizes extreme binary probabilities (low effective sample)', () => {
    const diag: NodeDiagnostics = { exact: 5000, interpolated: 0, default: 0 };
    const source: SourceCitation = { citation: '', url: '', confidence: 'high' };
    const score50 = computeNodeConfidence(diag, 5000, 'binary', 0.5, source);
    const score02 = computeNodeConfidence(diag, 5000, 'binary', 0.02, source);
    expect(score50).toBeGreaterThan(score02);
  });

  it('interpolated matches score between exact and default', () => {
    const source: SourceCitation = { citation: '', url: '', confidence: 'medium' };
    const allExact = computeNodeConfidence({ exact: 5000, interpolated: 0, default: 0 }, 5000, 'binary', 0.5, source);
    const allInterp = computeNodeConfidence({ exact: 0, interpolated: 5000, default: 0 }, 5000, 'binary', 0.5, source);
    const allDefault = computeNodeConfidence({ exact: 0, interpolated: 0, default: 5000 }, 5000, 'binary', 0.5, source);
    expect(allExact).toBeGreaterThan(allInterp);
    expect(allInterp).toBeGreaterThan(allDefault);
  });
});

describe('getConfidenceTier', () => {
  it('returns "high" for scores >= 0.7', () => {
    expect(getConfidenceTier(0.7)).toBe('high');
    expect(getConfidenceTier(1.0)).toBe('high');
  });

  it('returns "medium" for scores 0.4-0.69', () => {
    expect(getConfidenceTier(0.4)).toBe('medium');
    expect(getConfidenceTier(0.69)).toBe('medium');
  });

  it('returns "low" for scores < 0.4', () => {
    expect(getConfidenceTier(0.39)).toBe('low');
    expect(getConfidenceTier(0.0)).toBe('low');
  });
});

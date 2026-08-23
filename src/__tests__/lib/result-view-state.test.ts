import { describe, it, expect } from 'vitest';
import { resultViewState } from '@/components/simulation/ResultsPanel';

describe('resultViewState', () => {
  it('is running when a sim is in flight and there are no results yet', () => {
    expect(resultViewState(true, false)).toBe('running');
  });

  it('is empty when idle with no results', () => {
    expect(resultViewState(false, false)).toBe('empty');
  });

  it('is updating when a newer sim is in flight over existing results', () => {
    expect(resultViewState(true, true)).toBe('updating');
  });

  it('is ready when results exist and nothing is in flight', () => {
    expect(resultViewState(false, true)).toBe('ready');
  });
});

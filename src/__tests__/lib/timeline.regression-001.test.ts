// Regression: ISSUE-001/002 — landing page metadata drifted (hardcoded "March 29")
// Found by /qa on 2026-04-25
// Report: .gstack/qa-reports/qa-report-localhost-2026-04-25.md

import { describe, it, expect } from 'vitest';
import { timeline, formatLongDate, describePhaseStatus } from '@/lib/timeline';
import type { PhaseStatus } from '@/lib/timeline';

describe('formatLongDate', () => {
  it('formats ISO date as long English form', () => {
    expect(formatLongDate('2026-04-24')).toBe('April 24, 2026');
  });

  it('handles single-digit days correctly', () => {
    expect(formatLongDate('2026-02-08')).toBe('February 8, 2026');
  });

  it('reflects timeline.lastUpdated without drift', () => {
    const result = formatLongDate(timeline.lastUpdated);
    expect(result).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
    expect(result).not.toBe('March 29, 2026');
  });
});

describe('describePhaseStatus', () => {
  it('groups consecutive observed phases as a range', () => {
    const status: Record<string, PhaseStatus> = {
      '1': 'observed', '2': 'observed', '3': 'mixed', '4': 'projected',
    };
    expect(describePhaseStatus(status)).toBe(
      'Phases 1–2 are locked to observed historical data. Phase 3 is mixed observed and projected. Phase 4 is fully projected'
    );
  });

  it('uses singular grammar for single observed phase', () => {
    const status: Record<string, PhaseStatus> = { '1': 'observed', '2': 'projected' };
    expect(describePhaseStatus(status)).toContain('Phase 1 is locked to observed');
  });

  it('uses singular grammar for single projected phase', () => {
    const status: Record<string, PhaseStatus> = {
      '1': 'observed', '2': 'observed', '8': 'projected',
    };
    expect(describePhaseStatus(status)).toContain('Phase 8 is fully projected');
  });

  it('uses plural grammar when multiple projected phases', () => {
    const status: Record<string, PhaseStatus> = {
      '7': 'projected', '8': 'projected',
    };
    expect(describePhaseStatus(status)).toContain('Phases 7–8 are fully projected');
  });

  it('reflects current timeline.json without saying everything is projected', () => {
    const desc = describePhaseStatus(timeline.phaseStatus as Record<string, PhaseStatus>);
    expect(desc).not.toContain('Phases 3–8 are probabilistic projections');
    expect(desc).toContain('mixed observed and projected');
  });

  it('handles unsorted phase keys correctly', () => {
    const status: Record<string, PhaseStatus> = {
      '8': 'projected', '1': 'observed', '5': 'mixed', '2': 'observed', '3': 'mixed',
    };
    const desc = describePhaseStatus(status);
    expect(desc).toContain('Phases 1–2');
    expect(desc).toContain('Phases 3–5');
    expect(desc).toContain('Phase 8');
  });
});

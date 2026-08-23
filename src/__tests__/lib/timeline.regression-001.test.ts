// Regression: ISSUE-001/002 — landing page metadata drifted (hardcoded "March 29")
// Found by /qa on 2026-04-25
// Report: .gstack/qa-reports/qa-report-localhost-2026-04-25.md

import { describe, it, expect } from 'vitest';
import { timeline, formatLongDate, describePhaseStatus } from '@/lib/timeline';
import type { PhaseStatus } from '@/lib/timeline';
import { phaseContent } from '@/lib/phase-content';

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

describe('August 2026 snapshot contract', () => {
  it('lastUpdated and observedThrough are 2026-08-23', () => {
    expect(timeline.lastUpdated).toBe('2026-08-23');
    expect(timeline.observedThrough).toBe('2026-08-23');
  });

  it('formatLongDate of lastUpdated is August 23, 2026', () => {
    expect(formatLongDate(timeline.lastUpdated)).toBe('August 23, 2026');
  });

  it('includes the Islamabad Memorandum on 2026-06-17', () => {
    const mou = timeline.events.find((e) => e.date === '2026-06-17');
    expect(mou).toBeDefined();
    expect(mou!.phase).toBe(7);
    expect(mou!.label.toLowerCase()).toMatch(/islamabad|mou|memorandum/);
  });

  it('includes Trump declaring the MoU over on 2026-07-08', () => {
    const over = timeline.events.find((e) => e.date === '2026-07-08');
    expect(over).toBeDefined();
    expect(over!.phase).toBe(7);
  });

  it('includes the 60-day MoU window lapse on 2026-08-17', () => {
    const lapse = timeline.events.find((e) => e.date === '2026-08-17');
    expect(lapse).toBeDefined();
    expect(lapse!.phase).toBe(7);
  });

  it('keeps events sorted by date', () => {
    const dates = timeline.events.map((e) => e.date);
    expect(dates).toEqual([...dates].sort());
  });

  it('does not lead mixed-phase copy with a stale snapshot date', () => {
    const stale = /As of (April 24|May 22), 2026/;
    for (const p of phaseContent.filter((x) => x.phase >= 3)) {
      expect(p.paragraphs.join(' ')).not.toMatch(stale);
    }
  });

  it('phase 3 editorial names the current snapshot date', () => {
    const p3 = phaseContent.find((p) => p.phase === 3);
    expect(p3).toBeDefined();
    expect(p3!.paragraphs[0]).toContain('August 23, 2026');
  });
});

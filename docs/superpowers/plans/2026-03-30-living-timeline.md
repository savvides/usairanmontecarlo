# Living Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a living timeline showing observed vs. projected phases, event annotations, phase status badges, a "last updated" banner, and a CLI update script — so the simulation stays current as the conflict evolves.

**Architecture:** A `timeline.json` data file drives the UI state. A TimelineBar D3 component replaces the CascadeStrip at the bottom. PhaseProgress gets status badges (observed/mixed/projected). The SimulationShell adds a "last updated" banner. A CLI script (`scripts/update.mjs`) helps the maintainer push new events.

**Tech Stack:** TypeScript, D3.js, Next.js, Node.js (CLI script)

---

## File Structure

```
src/
├── data/
│   └── timeline.json                    # NEW: event timeline + metadata
├── components/
│   └── simulation/
│       ├── TimelineBar.tsx              # NEW: replaces CascadeStrip
│       ├── PhaseProgress.tsx            # MODIFY: add status badges
│       ├── SimulationShell.tsx          # MODIFY: add banner, swap CascadeStrip
│       └── CascadeStrip.tsx             # DELETE (replaced by TimelineBar)
├── lib/
│   └── timeline.ts                      # NEW: timeline data types + helpers
scripts/
└── update.mjs                           # NEW: CLI update helper
```

---

### Task 1: Timeline Data File + Types

**Files:**
- Create: `src/data/timeline.json`
- Create: `src/lib/timeline.ts`

- [ ] **Step 1: Create timeline.json**

Create `src/data/timeline.json`:
```json
{
  "lastUpdated": "2026-03-30",
  "observedThrough": "2026-03-29",
  "currentPhase": 3,
  "phaseStatus": {
    "1": "observed",
    "2": "observed",
    "3": "mixed",
    "4": "projected",
    "5": "projected",
    "6": "projected",
    "7": "projected",
    "8": "projected"
  },
  "events": [
    {
      "date": "2026-02-28",
      "label": "US/Israel strike Iran",
      "description": "Surprise 12-hour campaign: ~900 strikes across 26 provinces. Khamenei and 7+ senior officials killed. Nuclear facilities at Natanz and Fordow hit.",
      "phase": 1,
      "source": "Al Jazeera, PBS, CFR"
    },
    {
      "date": "2026-03-01",
      "label": "Iran retaliates",
      "description": "Iran launches 500+ ballistic/naval missiles and ~2,000 drones. 40% aimed at Israel, 60% at US regional targets. Bahrain, Kuwait, Oman struck.",
      "phase": 2,
      "source": "Al Jazeera, Reuters"
    },
    {
      "date": "2026-03-02",
      "label": "Hezbollah enters war",
      "description": "Hezbollah resumes rocket and drone attacks on Israel within 48 hours of the initial strike.",
      "phase": 2,
      "source": "Bloomberg, Times of Israel"
    },
    {
      "date": "2026-03-04",
      "label": "Strait of Hormuz closed",
      "description": "Iran closes the Strait of Hormuz to foreign shipping. All major carriers suspend transits. Insurance cancelled from March 5.",
      "phase": 2,
      "source": "CNBC, Wikipedia"
    },
    {
      "date": "2026-03-10",
      "label": "Oil production drops 10M+ bpd",
      "description": "Kuwait, Iraq, Saudi Arabia, and UAE production collectively drops by 10+ million barrels per day.",
      "phase": 4,
      "source": "IEA, CNBC"
    },
    {
      "date": "2026-03-12",
      "label": "UNSC Resolution 2817",
      "description": "Security Council adopts resolution condemning Iran's attacks on neighbors. 13-0-2 (Russia and China abstain).",
      "phase": 5,
      "source": "UN Press, Al Jazeera"
    },
    {
      "date": "2026-03-25",
      "label": "Ceasefire talks deadlocked",
      "description": "Iran rejects US 15-point ceasefire proposal as 'maximalist.' Issues counterproposal demanding reparations and sovereignty over Hormuz.",
      "phase": 5,
      "source": "NPR, PBS, CNBC"
    },
    {
      "date": "2026-03-28",
      "label": "Houthis enter war",
      "description": "Houthis launch ballistic missiles at Israel and declare entry into the war, demanding strikes on Iran and Hezbollah stop.",
      "phase": 3,
      "source": "Bloomberg, Stimson Center"
    }
  ]
}
```

- [ ] **Step 2: Create timeline types and helpers**

Create `src/lib/timeline.ts`:
```typescript
export type PhaseStatus = 'observed' | 'mixed' | 'projected';

export interface TimelineEvent {
  date: string;
  label: string;
  description: string;
  phase: number;
  source: string;
}

export interface TimelineData {
  lastUpdated: string;
  observedThrough: string;
  currentPhase: number;
  phaseStatus: Record<string, PhaseStatus>;
  events: TimelineEvent[];
}

export function getPhaseStatus(timeline: TimelineData, phase: number): PhaseStatus {
  return timeline.phaseStatus[String(phase)] ?? 'projected';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function daysSinceUpdate(lastUpdated: string): number {
  const now = new Date();
  const updated = new Date(lastUpdated + 'T00:00:00');
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/timeline.json src/lib/timeline.ts
git commit -m "feat: add timeline data file and type helpers"
```

---

### Task 2: TimelineBar Component

**Files:**
- Create: `src/components/simulation/TimelineBar.tsx`

- [ ] **Step 1: Create the TimelineBar component**

Create `src/components/simulation/TimelineBar.tsx`:
```tsx
'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { TimelineData } from '@/lib/timeline';
import { formatDate } from '@/lib/timeline';

interface TimelineBarProps {
  timeline: TimelineData;
  currentPhase: number;
  onEventClick?: (event: TimelineData['events'][0]) => void;
}

export function TimelineBar({ timeline, currentPhase, onEventClick }: TimelineBarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svgRef.current.parentElement;
    const totalWidth = container?.clientWidth ?? 900;
    const height = 80;
    const margin = { top: 10, right: 30, bottom: 25, left: 30 };
    const w = totalWidth - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    svg.attr('width', totalWidth).attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const events = timeline.events.map((e) => ({
      ...e,
      parsedDate: new Date(e.date + 'T00:00:00'),
    }));

    const today = new Date();
    const minDate = events.length > 0 ? d3.min(events, (e) => e.parsedDate)! : today;
    // Extend 30 days past today for projected zone
    const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const x = d3.scaleTime().domain([minDate, maxDate]).range([0, w]);

    const observedEnd = new Date(timeline.observedThrough + 'T00:00:00');

    // Observed zone (solid background)
    g.append('rect')
      .attr('x', 0)
      .attr('y', h / 2 - 3)
      .attr('width', Math.max(0, x(observedEnd)))
      .attr('height', 6)
      .attr('rx', 3)
      .attr('fill', '#4a8bb5')
      .attr('opacity', 0.4);

    // Projected zone (dashed)
    g.append('rect')
      .attr('x', x(observedEnd))
      .attr('y', h / 2 - 3)
      .attr('width', Math.max(0, w - x(observedEnd)))
      .attr('height', 6)
      .attr('rx', 3)
      .attr('fill', '#2a2a3a')
      .attr('opacity', 0.6);

    // NOW marker
    const nowX = x(today);
    g.append('line')
      .attr('x1', nowX)
      .attr('x2', nowX)
      .attr('y1', 0)
      .attr('y2', h)
      .attr('stroke', '#e8e8ed')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,2');

    g.append('text')
      .attr('x', nowX)
      .attr('y', -2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e8e8ed')
      .attr('font-size', '8px')
      .attr('font-family', "'JetBrains Mono', monospace")
      .text('NOW');

    // Zone labels
    g.append('text')
      .attr('x', Math.min(x(observedEnd) / 2, w / 4))
      .attr('y', h + 16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#4a8bb5')
      .attr('font-size', '8px')
      .attr('font-family', "'JetBrains Mono', monospace")
      .text('OBSERVED');

    g.append('text')
      .attr('x', Math.max(x(observedEnd) + (w - x(observedEnd)) / 2, w * 0.75))
      .attr('y', h + 16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#55556a')
      .attr('font-size', '8px')
      .attr('font-family', "'JetBrains Mono', monospace")
      .text('PROJECTED');

    // Event markers
    const tooltip = d3.select(tooltipRef.current);

    events.forEach((event) => {
      const cx = x(event.parsedDate);
      const isCurrentPhase = event.phase === currentPhase;

      const marker = g
        .append('circle')
        .attr('cx', cx)
        .attr('cy', h / 2)
        .attr('r', isCurrentPhase ? 6 : 4)
        .attr('fill', event.parsedDate <= observedEnd ? '#4a8bb5' : '#55556a')
        .attr('stroke', isCurrentPhase ? '#e8e8ed' : 'none')
        .attr('stroke-width', isCurrentPhase ? 1.5 : 0)
        .attr('cursor', 'pointer');

      // Date label below marker (only for major events or if spread out enough)
      g.append('text')
        .attr('x', cx)
        .attr('y', h / 2 + 16)
        .attr('text-anchor', 'middle')
        .attr('fill', '#55556a')
        .attr('font-size', '7px')
        .attr('font-family', "'JetBrains Mono', monospace")
        .text(formatDate(event.date));

      // Hover tooltip
      marker
        .on('mouseenter', (mouseEvent) => {
          tooltip
            .style('display', 'block')
            .style('left', `${mouseEvent.pageX + 10}px`)
            .style('top', `${mouseEvent.pageY - 10}px`)
            .html(
              `<div class="text-xs font-semibold text-text-primary">${event.label}</div>
               <div class="text-[10px] text-text-secondary mt-1">${formatDate(event.date)}</div>
               <div class="text-[10px] text-text-secondary mt-1 leading-relaxed">${event.description}</div>
               <div class="text-[9px] text-text-muted mt-1.5 font-mono">${event.source}</div>`
            );
        })
        .on('mouseleave', () => {
          tooltip.style('display', 'none');
        })
        .on('click', () => {
          if (onEventClick) onEventClick(event);
        });
    });
  }, [timeline, currentPhase, onEventClick]);

  return (
    <div className="relative border-t border-border bg-surface px-2 py-1">
      <svg ref={svgRef} className="w-full overflow-visible" />
      <div
        ref={tooltipRef}
        className="fixed z-50 hidden max-w-xs rounded-lg border border-border bg-surface-elevated p-3 shadow-lg"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/simulation/TimelineBar.tsx
git commit -m "feat: add TimelineBar component with event markers and tooltips"
```

---

### Task 3: Phase Status Badges

**Files:**
- Modify: `src/components/simulation/PhaseProgress.tsx`

- [ ] **Step 1: Update PhaseProgress to accept and display phase status**

Read `src/components/simulation/PhaseProgress.tsx` and replace its entire content with:

```tsx
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { PhaseStatus } from '@/lib/timeline';

interface PhaseProgressProps {
  currentPhase: number;
  totalPhases: number;
  completedPhases: Set<number>;
  canNavigateFreely: boolean;
  onPhaseClick: (phase: number) => void;
  phaseStatuses?: Record<string, PhaseStatus>;
}

const PHASE_LABELS = [
  'Tensions',
  'Escalation',
  'Conflict',
  'Economic',
  'Geopolitical',
  'Humanitarian',
  'Resolution',
  'Aftermath',
];

const STATUS_ICONS: Record<PhaseStatus, string> = {
  observed: '●',
  mixed: '◐',
  projected: '○',
};

const STATUS_LABELS: Record<PhaseStatus, string> = {
  observed: 'OBS',
  mixed: 'NOW',
  projected: 'PROJ',
};

export function PhaseProgress({
  currentPhase,
  totalPhases,
  completedPhases,
  canNavigateFreely,
  onPhaseClick,
  phaseStatuses,
}: PhaseProgressProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-surface border-b border-border">
      {Array.from({ length: totalPhases }, (_, i) => {
        const phase = i + 1;
        const isCurrent = phase === currentPhase;
        const isCompleted = completedPhases.has(phase);
        const isClickable = canNavigateFreely || isCompleted || phase <= currentPhase;
        const status = phaseStatuses?.[String(phase)];

        return (
          <button
            key={phase}
            onClick={() => isClickable && onPhaseClick(phase)}
            disabled={!isClickable}
            className={cn(
              'flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors',
              isCurrent && 'bg-accent/15 text-accent',
              isCompleted && !isCurrent && 'text-text-secondary hover:text-text-primary',
              !isCurrent && !isCompleted && isClickable && 'text-text-muted hover:text-text-secondary',
              !isClickable && 'text-text-muted/40 cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono',
                isCurrent && 'bg-accent text-white',
                !isCurrent && status === 'observed' && 'bg-accent/20 text-accent',
                !isCurrent && status === 'mixed' && 'bg-warning/20 text-warning',
                !isCurrent && status === 'projected' && 'bg-surface-elevated text-text-muted',
                !isCurrent && !status && (isCompleted ? 'bg-success/20 text-success' : 'bg-surface-elevated text-text-muted')
              )}
            >
              {status ? STATUS_ICONS[status] : phase}
            </span>
            <span className="hidden lg:inline">{PHASE_LABELS[i]}</span>
            {status && (
              <span
                className={cn(
                  'hidden xl:inline text-[8px] font-mono uppercase',
                  status === 'observed' && 'text-accent/60',
                  status === 'mixed' && 'text-warning/60',
                  status === 'projected' && 'text-text-muted/40'
                )}
              >
                {STATUS_LABELS[status]}
              </span>
            )}
          </button>
        );
      })}
      <div className="ml-auto">
        <Link
          href="/methodology"
          className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-elevated text-text-muted text-[10px] font-mono hover:text-text-secondary transition-colors"
          title="Methodology"
        >
          ?
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/simulation/PhaseProgress.tsx
git commit -m "feat: add observed/mixed/projected status badges to phase progress bar"
```

---

### Task 4: Wire Timeline into SimulationShell + Last Updated Banner

**Files:**
- Modify: `src/components/simulation/SimulationShell.tsx`

- [ ] **Step 1: Update SimulationShell**

Read `src/components/simulation/SimulationShell.tsx`. Make these changes:

1. Replace the `CascadeStrip` import with `TimelineBar`:
```typescript
import { TimelineBar } from './TimelineBar';
```

2. Add timeline imports:
```typescript
import timelineData from '@data/timeline.json';
import type { TimelineData } from '@/lib/timeline';
import { daysSinceUpdate } from '@/lib/timeline';

const timeline = timelineData as TimelineData;
```

3. Remove the `CascadeStrip` import line.

4. Inside the component, before the return statement, add:
```typescript
const daysAgo = daysSinceUpdate(timeline.lastUpdated);
const updatedLabel = daysAgo === 0 ? 'Updated today' : daysAgo === 1 ? 'Updated yesterday' : `Updated ${daysAgo} days ago`;
```

5. Add a "Last Updated" banner. Right after the opening `<div className="flex h-screen flex-col bg-background">` and BEFORE the `<PhaseProgress>` component, add:
```tsx
{/* Last Updated Banner */}
<div className="flex items-center justify-between px-4 py-1.5 bg-surface-elevated border-b border-border text-[10px]">
  <span className="font-mono text-text-muted">
    Data as of {timeline.observedThrough} · {updatedLabel}
  </span>
  <span className="font-mono text-accent/60">
    Phase {timeline.currentPhase} active
  </span>
</div>
```

6. Pass `phaseStatuses` to PhaseProgress:
```tsx
<PhaseProgress
  currentPhase={phase.currentPhase}
  totalPhases={phase.totalPhases}
  completedPhases={phase.completedPhases}
  canNavigateFreely={phase.canNavigateFreely}
  onPhaseClick={phase.goToPhase}
  phaseStatuses={timeline.phaseStatus}
/>
```

7. Replace the `<CascadeStrip>` at the bottom with:
```tsx
<TimelineBar
  timeline={timeline}
  currentPhase={phase.currentPhase}
/>
```

- [ ] **Step 2: Delete CascadeStrip.tsx**

```bash
rm src/components/simulation/CascadeStrip.tsx
```

- [ ] **Step 3: Verify build**

```bash
npx next build 2>&1 | tail -10
```
Expected: Build succeeds

- [ ] **Step 4: Verify tests**

```bash
npx vitest run
```
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/components/simulation/SimulationShell.tsx src/components/simulation/PhaseProgress.tsx
git rm src/components/simulation/CascadeStrip.tsx
git commit -m "feat: wire timeline bar, phase badges, and last-updated banner into simulation"
```

---

### Task 5: Update CLI Script

**Files:**
- Create: `scripts/update.mjs`

- [ ] **Step 1: Create the update helper script**

Create `scripts/update.mjs`:
```javascript
#!/usr/bin/env node

/**
 * Simulation Update Helper
 *
 * Usage: node scripts/update.mjs
 *
 * Interactive script that helps maintain the simulation:
 * 1. Prompts for new timeline events
 * 2. Updates the "lastUpdated" and "observedThrough" dates
 * 3. Validates all JSON data files
 * 4. Runs tests
 * 5. Commits and pushes
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const TIMELINE_PATH = 'src/data/timeline.json';

async function main() {
  console.log('\n🔄 Simulation Update Helper\n');

  // Load current timeline
  const timeline = JSON.parse(readFileSync(TIMELINE_PATH, 'utf-8'));
  console.log(`Current data: ${timeline.events.length} events, last updated ${timeline.lastUpdated}`);
  console.log(`Observed through: ${timeline.observedThrough}\n`);

  // Ask about new events
  let addMore = true;
  const newEvents = [];

  while (addMore) {
    const wantEvent = await ask('Add a new timeline event? (y/n): ');
    if (wantEvent.toLowerCase() !== 'y') {
      addMore = false;
      break;
    }

    const date = await ask('  Date (YYYY-MM-DD): ');
    const label = await ask('  Label (short): ');
    const description = await ask('  Description (1-2 sentences): ');
    const phase = parseInt(await ask('  Phase (1-8): '), 10);
    const source = await ask('  Source: ');

    newEvents.push({ date, label, description, phase, source });
    console.log(`  ✓ Added: "${label}" on ${date}\n`);
  }

  if (newEvents.length > 0) {
    timeline.events.push(...newEvents);
    timeline.events.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Update dates
  const today = new Date().toISOString().split('T')[0];
  const newObserved = await ask(`\nObserved through date (current: ${timeline.observedThrough}, today: ${today}): `);
  if (newObserved.trim()) {
    timeline.observedThrough = newObserved.trim();
  }
  timeline.lastUpdated = today;

  // Update phase statuses
  const currentPhase = parseInt(await ask(`Current active phase (current: ${timeline.currentPhase}): `) || String(timeline.currentPhase), 10);
  timeline.currentPhase = currentPhase;

  for (let i = 1; i <= 8; i++) {
    if (i < currentPhase) {
      timeline.phaseStatus[String(i)] = 'observed';
    } else if (i === currentPhase) {
      timeline.phaseStatus[String(i)] = 'mixed';
    } else {
      timeline.phaseStatus[String(i)] = 'projected';
    }
  }

  // Write updated timeline
  writeFileSync(TIMELINE_PATH, JSON.stringify(timeline, null, 2) + '\n');
  console.log(`\n✓ Updated ${TIMELINE_PATH}`);
  console.log(`  ${timeline.events.length} events, observed through ${timeline.observedThrough}`);

  // Validate
  console.log('\n📋 Validating...');
  try {
    JSON.parse(readFileSync(TIMELINE_PATH, 'utf-8'));
    console.log('  ✓ timeline.json valid');
  } catch (e) {
    console.error('  ✗ timeline.json invalid:', e.message);
    process.exit(1);
  }

  // Run tests
  console.log('\n🧪 Running tests...');
  try {
    execSync('npx vitest run', { stdio: 'inherit' });
  } catch {
    console.error('\n✗ Tests failed. Fix issues before pushing.');
    process.exit(1);
  }

  // Build
  console.log('\n🏗️  Building...');
  try {
    execSync('npx next build', { stdio: 'inherit' });
  } catch {
    console.error('\n✗ Build failed. Fix issues before pushing.');
    process.exit(1);
  }

  // Commit and push
  const shouldPush = await ask('\nCommit and push? (y/n): ');
  if (shouldPush.toLowerCase() === 'y') {
    execSync('git add -A', { stdio: 'inherit' });
    const msg = `data: update simulation — ${newEvents.length} new events, observed through ${timeline.observedThrough}`;
    execSync(`git commit -m "${msg}"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('\n✓ Pushed. GitHub Pages will auto-deploy.');
  } else {
    console.log('\nChanges saved locally. Run `git add -A && git commit && git push` when ready.');
  }

  rl.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Add npm script**

Add to `package.json` scripts:
```json
"update": "node scripts/update.mjs"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/update.mjs package.json
git commit -m "feat: add CLI update helper script for pushing simulation updates"
```

---

### Task 6: Final Verification + Push

**Files:** None new — verification only.

- [ ] **Step 1: Run tests**

```bash
npx vitest run
```
Expected: All 62 tests pass

- [ ] **Step 2: Build**

```bash
npx next build 2>&1 | tail -10
```
Expected: Build succeeds with all routes

- [ ] **Step 3: Push**

```bash
git push
```

---

## Summary

After completing all 6 tasks:

- **timeline.json** — structured event timeline with dates, descriptions, sources, and phase metadata
- **TimelineBar** — D3 component showing conflict timeline with OBSERVED/PROJECTED zones, NOW marker, and clickable event markers with tooltips
- **Phase status badges** — ●/◐/○ icons with OBS/NOW/PROJ labels in the progress bar
- **Last Updated banner** — persistent "Data as of March 30 · Updated today" indicator
- **Update CLI** — `npm run update` interactive script for pushing new events
- **CascadeStrip removed** — replaced by the more informative TimelineBar

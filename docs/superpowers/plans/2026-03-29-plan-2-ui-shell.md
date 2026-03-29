# Plan 2: UI Shell + Phase 1 Complete

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js web app with landing page, three-panel simulation layout, D3 visualizations, and full Phase 1 wired end-to-end — a user can land on the site, begin the simulation, pick scenario cards, and watch probability distributions update in real time.

**Architecture:** Next.js 14+ App Router with static export for Vercel. React hooks manage simulation state and Web Worker lifecycle. D3.js renders visualizations inside React components via refs. Framer Motion handles transitions. Tailwind + shadcn/ui for the UI shell. Dark theme throughout.

**Tech Stack:** Next.js 14+, React 19, TypeScript, Tailwind CSS, shadcn/ui, D3.js, Framer Motion

**Existing code:** The simulation engine is complete in `src/engine/` with full test coverage (49 tests). Phase 1 data lives in `src/data/`. This plan adds the UI layer on top.

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, dark theme
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Tailwind base + custom styles
│   └── simulation/
│       └── page.tsx            # Simulation experience (client component)
│
├── components/
│   ├── landing/
│   │   └── Hero.tsx            # Landing hero section
│   ├── simulation/
│   │   ├── SimulationShell.tsx  # Three-panel layout orchestrator
│   │   ├── ContextPanel.tsx     # Left panel: editorial content
│   │   ├── InteractionPanel.tsx # Center panel: scenario cards + sliders
│   │   ├── ResultsPanel.tsx     # Right panel: D3 visualizations
│   │   ├── PhaseProgress.tsx    # Top progress bar
│   │   └── CascadeStrip.tsx     # Bottom cascade preview
│   ├── cards/
│   │   └── ScenarioCard.tsx     # Individual scenario card component
│   ├── visualizations/
│   │   ├── DistributionChart.tsx # Histogram/density for continuous vars
│   │   ├── ProbabilityBar.tsx    # Horizontal bars for binary/categorical
│   │   └── SensitivitySparkline.tsx # Inline sensitivity indicators
│   └── ui/                      # shadcn/ui components (auto-generated)
│
├── hooks/
│   ├── useSimulation.ts         # Engine state management
│   ├── useWorker.ts             # Web Worker lifecycle
│   └── usePhase.ts              # Phase navigation state
│
├── lib/
│   ├── phase-content.ts         # Editorial content for each phase
│   └── utils.ts                 # shadcn/ui cn() utility
│
├── engine/                      # (existing — unchanged)
├── data/                        # (existing — unchanged)
└── __tests__/                   # (existing — unchanged)
```

---

### Task 1: Convert to Next.js

**Files:**
- Modify: `package.json`
- Replace: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/lib/utils.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Install Next.js and UI dependencies**

Run:
```bash
npm install next@latest react@latest react-dom@latest
npm install -D @types/react @types/react-dom
npm install tailwindcss @tailwindcss/postcss postcss
npm install d3 framer-motion
npm install -D @types/d3
npm install class-variance-authority clsx tailwind-merge lucide-react
```

- [ ] **Step 2: Create next.config.ts**

Create `next.config.ts`:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
```

- [ ] **Step 3: Create postcss.config.mjs**

Create `postcss.config.mjs`:
```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

- [ ] **Step 4: Create tailwind.config.ts**

Create `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#12121a',
        'surface-elevated': '#1a1a25',
        border: '#2a2a3a',
        'text-primary': '#e8e8ed',
        'text-secondary': '#8888a0',
        'text-muted': '#55556a',
        accent: '#4a8bb5',
        'accent-hover': '#5a9bc5',
        warning: '#c49a3c',
        danger: '#b54a4a',
        'danger-high': '#d45555',
        success: '#4a9b6a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Create globals.css**

Create `src/app/globals.css`:
```css
@import 'tailwindcss';

@theme {
  --color-background: #0a0a0f;
  --color-surface: #12121a;
  --color-surface-elevated: #1a1a25;
  --color-border: #2a2a3a;
  --color-text-primary: #e8e8ed;
  --color-text-secondary: #8888a0;
  --color-text-muted: #55556a;
  --color-accent: #4a8bb5;
  --color-accent-hover: #5a9bc5;
  --color-warning: #c49a3c;
  --color-danger: #b54a4a;
  --color-danger-high: #d45555;
  --color-success: #4a9b6a;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

body {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

/* Scrollbar styling for dark theme */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--color-background);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}
```

- [ ] **Step 6: Replace tsconfig.json for Next.js**

Replace `tsconfig.json` entirely with:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@engine/*": ["./src/engine/*"],
      "@data/*": ["./src/data/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 7: Update vitest.config.ts for new paths**

Replace `vitest.config.ts` with:
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
});
```

- [ ] **Step 8: Create utils.ts (shadcn/ui helper)**

Create `src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 9: Create root layout**

Create `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'USA vs Iran War Simulation — Monte Carlo Analysis',
  description:
    'Interactive Monte Carlo simulation exploring the cascading consequences of a US-Iran military conflict across military, economic, geopolitical, and humanitarian domains.',
  openGraph: {
    title: 'USA vs Iran War Simulation',
    description: 'Monte Carlo analysis of conflict scenarios and their cascading consequences.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Create placeholder landing page**

Create `src/app/page.tsx`:
```tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-text-primary">
        USA vs Iran War Simulation
      </h1>
      <p className="mt-4 text-text-secondary">Monte Carlo Analysis — Loading...</p>
      <Link
        href="/simulation"
        className="mt-8 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
      >
        Begin Simulation
      </Link>
    </main>
  );
}
```

- [ ] **Step 11: Update package.json scripts**

Add Next.js scripts to `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 12: Verify existing tests still pass**

Run:
```bash
npx vitest run
```
Expected: All 49 tests PASS

- [ ] **Step 13: Verify Next.js dev server starts**

Run:
```bash
npx next build 2>&1 | tail -5
```
Expected: Build succeeds (may have warnings, but no errors)

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: convert to Next.js with Tailwind dark theme and landing page"
```

---

### Task 2: React Hooks — useSimulation, useWorker, usePhase

**Files:**
- Create: `src/hooks/usePhase.ts`
- Create: `src/hooks/useSimulation.ts`
- Create: `src/hooks/useWorker.ts`

- [ ] **Step 1: Create usePhase hook**

Create `src/hooks/usePhase.ts`:
```typescript
'use client';

import { useState, useCallback } from 'react';

export interface PhaseState {
  currentPhase: number;
  completedPhases: Set<number>;
  isFirstVisit: boolean;
}

const TOTAL_PHASES = 8;

export function usePhase() {
  const [state, setState] = useState<PhaseState>({
    currentPhase: 1,
    completedPhases: new Set<number>(),
    isFirstVisit: true,
  });

  const goToPhase = useCallback((phase: number) => {
    if (phase < 1 || phase > TOTAL_PHASES) return;
    // On first visit, can only go forward or to completed phases
    setState((prev) => {
      if (prev.isFirstVisit && phase > prev.currentPhase && !prev.completedPhases.has(phase - 1)) {
        return prev;
      }
      return { ...prev, currentPhase: phase };
    });
  }, []);

  const advancePhase = useCallback(() => {
    setState((prev) => {
      const newCompleted = new Set(prev.completedPhases);
      newCompleted.add(prev.currentPhase);
      const nextPhase = Math.min(prev.currentPhase + 1, TOTAL_PHASES);
      const allComplete = newCompleted.size === TOTAL_PHASES;
      return {
        currentPhase: nextPhase,
        completedPhases: newCompleted,
        isFirstVisit: allComplete ? false : prev.isFirstVisit,
      };
    });
  }, []);

  const resetPhases = useCallback(() => {
    setState({
      currentPhase: 1,
      completedPhases: new Set<number>(),
      isFirstVisit: true,
    });
  }, []);

  return {
    ...state,
    totalPhases: TOTAL_PHASES,
    goToPhase,
    advancePhase,
    resetPhases,
    canAdvance: state.currentPhase < TOTAL_PHASES,
    canNavigateFreely: !state.isFirstVisit,
  };
}
```

- [ ] **Step 2: Create useWorker hook**

Create `src/hooks/useWorker.ts`:
```typescript
'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { SimGraph, NodeOverride, SimulationResult } from '@engine/types';
import { SimulationWorker } from '@engine/worker-client';

export function useWorker() {
  const workerRef = useRef<SimulationWorker | null>(null);

  useEffect(() => {
    // Web Worker initialization happens in useSimulation
    // This hook just manages the lifecycle
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const initWorker = useCallback((url: string | URL) => {
    workerRef.current = new SimulationWorker();
    workerRef.current.init(url);
  }, []);

  const runInWorker = useCallback(
    async (
      graph: SimGraph,
      overrides: NodeOverride[],
      runCount: number,
      seed: number
    ): Promise<SimulationResult> => {
      if (!workerRef.current) {
        throw new Error('Worker not initialized');
      }
      return workerRef.current.run(graph, overrides, runCount, seed);
    },
    []
  );

  const terminateWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  return { initWorker, runInWorker, terminateWorker };
}
```

- [ ] **Step 3: Create useSimulation hook**

Create `src/hooks/useSimulation.ts`:
```typescript
'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { buildGraph, runSimulation, applyScenario } from '@engine/index';
import type { SimNode, SimGraph, SimulationResult, ScenarioCard } from '@engine/types';

export interface PhaseResults {
  /** For each node ID, array of sampled values across all runs */
  distributions: Map<string, number[]>;
  /** Summary statistics per node */
  stats: Map<string, { mean: number; min: number; max: number; p10: number; p90: number }>;
}

function computeStats(values: number[]): { mean: number; min: number; max: number; p10: number; p90: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    mean,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p10: sorted[Math.floor(sorted.length * 0.1)],
    p90: sorted[Math.floor(sorted.length * 0.9)],
  };
}

function extractPhaseResults(
  result: SimulationResult,
  graph: SimGraph,
  phase: number
): PhaseResults {
  const phaseNodeIds = graph.phaseNodes.get(phase) ?? [];
  const distributions = new Map<string, number[]>();
  const stats = new Map<string, { mean: number; min: number; max: number; p10: number; p90: number }>();

  for (const nodeId of phaseNodeIds) {
    const idx = result.nodeIndexMap.get(nodeId)!;
    const values: number[] = [];
    for (let i = 0; i < result.runCount; i++) {
      values.push(result.runs[i][idx]);
    }
    distributions.set(nodeId, values);
    stats.set(nodeId, computeStats(values));
  }

  return { distributions, stats };
}

export function useSimulation(nodes: SimNode[]) {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<Map<number, ScenarioCard>>(new Map());
  const graphRef = useRef<SimGraph | null>(null);

  const baseGraph = useMemo(() => {
    const g = buildGraph(nodes);
    graphRef.current = g;
    return g;
  }, [nodes]);

  const activeGraph = useMemo(() => {
    let g = baseGraph;
    for (const scenario of selectedScenarios.values()) {
      g = applyScenario(g, scenario);
    }
    return g;
  }, [baseGraph, selectedScenarios]);

  const run = useCallback(
    (runCount: number = 1000, seed: number = Date.now()) => {
      setIsRunning(true);
      // Use requestAnimationFrame to avoid blocking the UI
      requestAnimationFrame(() => {
        const r = runSimulation(activeGraph, runCount, seed);
        setResult(r);
        setIsRunning(false);
      });
    },
    [activeGraph]
  );

  const selectScenario = useCallback((scenario: ScenarioCard) => {
    setSelectedScenarios((prev) => {
      const next = new Map(prev);
      // Replace any existing scenario for the same phase
      next.set(scenario.phase, scenario);
      return next;
    });
  }, []);

  const clearScenario = useCallback((phase: number) => {
    setSelectedScenarios((prev) => {
      const next = new Map(prev);
      next.delete(phase);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setSelectedScenarios(new Map());
    setResult(null);
  }, []);

  const getPhaseResults = useCallback(
    (phase: number): PhaseResults | null => {
      if (!result) return null;
      return extractPhaseResults(result, activeGraph, phase);
    },
    [result, activeGraph]
  );

  return {
    baseGraph,
    activeGraph,
    result,
    isRunning,
    selectedScenarios,
    run,
    selectScenario,
    clearScenario,
    resetAll,
    getPhaseResults,
  };
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: No errors (or only Next.js plugin warnings)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add React hooks for simulation state, worker, and phase navigation"
```

---

### Task 3: Phase Content Data

**Files:**
- Create: `src/lib/phase-content.ts`

- [ ] **Step 1: Create editorial content for Phase 1**

Create `src/lib/phase-content.ts`:
```typescript
export interface PhaseContent {
  phase: number;
  title: string;
  subtitle: string;
  paragraphs: string[];
  sources: string[];
}

export const phaseContent: PhaseContent[] = [
  {
    phase: 1,
    title: 'Pre-Conflict Tensions',
    subtitle: 'The landscape before the first shot',
    paragraphs: [
      'The US-Iran confrontation operates across multiple interconnected domains simultaneously. Iran\'s nuclear program — now enriching uranium to levels that narrow the gap to weapons-grade material — sits at the center of an escalation matrix that includes proxy warfare across Iraq, Syria, Lebanon, and Yemen, maritime tensions in the Persian Gulf, and a sanctions regime that has reshaped Iran\'s economy and domestic politics.',
      'The variables in this phase represent the pre-conflict baseline: how many forces are deployed, how advanced the nuclear program is, how active the proxy networks are, and whether diplomatic channels remain open. These starting conditions don\'t just set the stage — they constrain every outcome that follows. A conflict that begins during a diplomatic freeze looks fundamentally different from one that erupts during failed negotiations.',
      'Use the scenario cards to explore different trigger events. Each one shifts the probability landscape across all downstream phases — not just the immediate military response, but the economic shockwaves, geopolitical realignments, and long-term consequences that cascade from this starting point.',
    ],
    sources: [
      'IISS Military Balance 2025',
      'IAEA Board of Governors Reports',
      'CSIS Iran Threat Assessment',
      'Crisis Group Middle East Reports',
    ],
  },
];

export function getPhaseContent(phase: number): PhaseContent | undefined {
  return phaseContent.find((p) => p.phase === phase);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/phase-content.ts
git commit -m "feat: add Phase 1 editorial content"
```

---

### Task 4: Scenario Card Component

**Files:**
- Create: `src/components/cards/ScenarioCard.tsx`

- [ ] **Step 1: Create the ScenarioCard component**

Create `src/components/cards/ScenarioCard.tsx`:
```tsx
'use client';

import { motion } from 'framer-motion';
import type { ScenarioCard as ScenarioCardType } from '@engine/types';
import { cn } from '@/lib/utils';

interface ScenarioCardProps {
  scenario: ScenarioCardType;
  isSelected: boolean;
  onSelect: (scenario: ScenarioCardType) => void;
}

export function ScenarioCard({ scenario, isSelected, onSelect }: ScenarioCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(scenario)}
      className={cn(
        'w-full rounded-lg border p-4 text-left transition-colors',
        isSelected
          ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(74,139,181,0.15)]'
          : 'border-border bg-surface hover:border-text-muted hover:bg-surface-elevated'
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      layout
    >
      <h3
        className={cn(
          'text-sm font-semibold',
          isSelected ? 'text-accent' : 'text-text-primary'
        )}
      >
        {scenario.title}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
        {scenario.description}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[10px] font-mono text-text-muted">
          {scenario.overrides.length} variable{scenario.overrides.length !== 1 ? 's' : ''} affected
        </span>
      </div>
    </motion.button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/cards/ScenarioCard.tsx
git commit -m "feat: add ScenarioCard component"
```

---

### Task 5: D3 Visualization — ProbabilityBar

**Files:**
- Create: `src/components/visualizations/ProbabilityBar.tsx`

- [ ] **Step 1: Create the ProbabilityBar component**

Create `src/components/visualizations/ProbabilityBar.tsx`:
```tsx
'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { SimNode, CategoricalNode, BinaryNode } from '@engine/types';

interface ProbabilityBarProps {
  node: SimNode;
  values: number[];
  width?: number;
  height?: number;
}

export function ProbabilityBar({ node, values, width = 280, height = 120 }: ProbabilityBarProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || values.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 8, right: 12, bottom: 20, left: 12 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    let labels: string[];
    let frequencies: number[];

    if (node.type === 'binary') {
      labels = ['No', 'Yes'];
      const trueCount = values.filter((v) => v === 1).length;
      frequencies = [(values.length - trueCount) / values.length, trueCount / values.length];
    } else if (node.type === 'categorical') {
      const catNode = node as CategoricalNode;
      labels = catNode.categories;
      frequencies = labels.map((_, idx) => {
        return values.filter((v) => v === idx).length / values.length;
      });
    } else {
      return; // continuous nodes use DistributionChart
    }

    const x = d3.scaleLinear().domain([0, 1]).range([0, w]);
    const y = d3
      .scaleBand()
      .domain(labels)
      .range([0, h])
      .padding(0.3);

    // Color scale based on probability
    const colorScale = (freq: number) => {
      if (freq > 0.5) return '#b54a4a'; // danger
      if (freq > 0.3) return '#c49a3c'; // warning
      return '#4a8bb5'; // accent
    };

    // Bars
    g.selectAll('.bar')
      .data(labels)
      .join('rect')
      .attr('class', 'bar')
      .attr('y', (d) => y(d)!)
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('fill', (_, i) => colorScale(frequencies[i]))
      .attr('rx', 2)
      .transition()
      .duration(400)
      .attr('width', (_, i) => x(frequencies[i]));

    // Labels
    g.selectAll('.label')
      .data(labels)
      .join('text')
      .attr('class', 'label')
      .attr('x', 0)
      .attr('y', (d) => y(d)! - 3)
      .attr('fill', '#8888a0')
      .attr('font-size', '10px')
      .attr('font-family', 'Inter, system-ui, sans-serif')
      .text((d) => d.replace(/_/g, ' '));

    // Percentage labels
    g.selectAll('.pct')
      .data(labels)
      .join('text')
      .attr('class', 'pct')
      .attr('x', (_, i) => Math.max(x(frequencies[i]) + 4, 4))
      .attr('y', (d) => y(d)! + y.bandwidth() / 2 + 3)
      .attr('fill', '#e8e8ed')
      .attr('font-size', '10px')
      .attr('font-family', "'JetBrains Mono', monospace")
      .text((_, i) => `${(frequencies[i] * 100).toFixed(1)}%`);
  }, [node, values, width, height]);

  return <svg ref={svgRef} className="overflow-visible" />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/visualizations/ProbabilityBar.tsx
git commit -m "feat: add ProbabilityBar D3 visualization component"
```

---

### Task 6: D3 Visualization — DistributionChart

**Files:**
- Create: `src/components/visualizations/DistributionChart.tsx`

- [ ] **Step 1: Create the DistributionChart component**

Create `src/components/visualizations/DistributionChart.tsx`:
```tsx
'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { ContinuousNode } from '@engine/types';

interface DistributionChartProps {
  node: ContinuousNode;
  values: number[];
  width?: number;
  height?: number;
}

export function DistributionChart({ node, values, width = 280, height = 140 }: DistributionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || values.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 12, right: 12, bottom: 28, left: 40 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Histogram bins
    const x = d3.scaleLinear().domain([node.min, node.max]).range([0, w]);

    const histogram = d3
      .bin()
      .domain(x.domain() as [number, number])
      .thresholds(x.ticks(25));

    const bins = histogram(values);
    const maxCount = d3.max(bins, (b) => b.length) ?? 1;
    const y = d3.scaleLinear().domain([0, maxCount]).range([h, 0]);

    // Color based on x position (severity)
    const colorScale = d3
      .scaleLinear<string>()
      .domain([node.min, (node.min + node.max) / 2, node.max])
      .range(['#4a8bb5', '#c49a3c', '#b54a4a']);

    // Bars
    g.selectAll('.bin')
      .data(bins)
      .join('rect')
      .attr('class', 'bin')
      .attr('x', (d) => x(d.x0!) + 1)
      .attr('width', (d) => Math.max(0, x(d.x1!) - x(d.x0!) - 1))
      .attr('y', h)
      .attr('height', 0)
      .attr('fill', (d) => colorScale((d.x0! + d.x1!) / 2))
      .attr('opacity', 0.8)
      .transition()
      .duration(400)
      .attr('y', (d) => y(d.length))
      .attr('height', (d) => h - y(d.length));

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat((d) => `${d}`))
      .call((g) => {
        g.selectAll('text').attr('fill', '#8888a0').attr('font-size', '9px');
        g.selectAll('line').attr('stroke', '#2a2a3a');
        g.select('.domain').attr('stroke', '#2a2a3a');
      });

    // X axis label
    g.append('text')
      .attr('x', w / 2)
      .attr('y', h + 24)
      .attr('text-anchor', 'middle')
      .attr('fill', '#55556a')
      .attr('font-size', '9px')
      .text(node.unit);

    // Y axis (minimal)
    g.append('g')
      .call(d3.axisLeft(y).ticks(3).tickFormat((d) => `${d}`))
      .call((g) => {
        g.selectAll('text').attr('fill', '#8888a0').attr('font-size', '9px');
        g.selectAll('line').attr('stroke', '#2a2a3a');
        g.select('.domain').attr('stroke', '#2a2a3a');
      });

    // Mean line
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    g.append('line')
      .attr('x1', x(mean))
      .attr('x2', x(mean))
      .attr('y1', 0)
      .attr('y2', h)
      .attr('stroke', '#e8e8ed')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,3')
      .attr('opacity', 0.6);

    // Mean label
    g.append('text')
      .attr('x', x(mean) + 4)
      .attr('y', 8)
      .attr('fill', '#e8e8ed')
      .attr('font-size', '9px')
      .attr('font-family', "'JetBrains Mono', monospace")
      .text(`μ=${mean.toFixed(1)}`);
  }, [node, values, width, height]);

  return <svg ref={svgRef} className="overflow-visible" />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/visualizations/DistributionChart.tsx
git commit -m "feat: add DistributionChart D3 histogram visualization"
```

---

### Task 7: D3 Visualization — SensitivitySparkline

**Files:**
- Create: `src/components/visualizations/SensitivitySparkline.tsx`

- [ ] **Step 1: Create the SensitivitySparkline component**

Create `src/components/visualizations/SensitivitySparkline.tsx`:
```tsx
'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface SensitivitySparklineProps {
  /** Standard deviation of the values — higher = more sensitive */
  stddev: number;
  /** Max possible stddev for normalization */
  maxStddev: number;
  width?: number;
  height?: number;
}

export function SensitivitySparkline({
  stddev,
  maxStddev,
  width = 60,
  height = 16,
}: SensitivitySparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const normalized = Math.min(stddev / maxStddev, 1);

    // Color: blue (low sensitivity) -> amber (medium) -> red (high)
    const color = d3
      .scaleLinear<string>()
      .domain([0, 0.5, 1])
      .range(['#4a8bb5', '#c49a3c', '#b54a4a']);

    svg
      .attr('width', width)
      .attr('height', height)
      .append('rect')
      .attr('x', 0)
      .attr('y', (height - 4) / 2)
      .attr('width', width)
      .attr('height', 4)
      .attr('rx', 2)
      .attr('fill', '#1a1a25');

    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', (height - 4) / 2)
      .attr('width', 0)
      .attr('height', 4)
      .attr('rx', 2)
      .attr('fill', color(normalized))
      .transition()
      .duration(400)
      .attr('width', normalized * width);
  }, [stddev, maxStddev, width, height]);

  return <svg ref={svgRef} className="inline-block" />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/visualizations/SensitivitySparkline.tsx
git commit -m "feat: add SensitivitySparkline visualization"
```

---

### Task 8: Simulation Panels — Context, Interaction, Results

**Files:**
- Create: `src/components/simulation/ContextPanel.tsx`
- Create: `src/components/simulation/InteractionPanel.tsx`
- Create: `src/components/simulation/ResultsPanel.tsx`
- Create: `src/components/simulation/PhaseProgress.tsx`

- [ ] **Step 1: Create PhaseProgress component**

Create `src/components/simulation/PhaseProgress.tsx`:
```tsx
'use client';

import { cn } from '@/lib/utils';

interface PhaseProgressProps {
  currentPhase: number;
  totalPhases: number;
  completedPhases: Set<number>;
  canNavigateFreely: boolean;
  onPhaseClick: (phase: number) => void;
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

export function PhaseProgress({
  currentPhase,
  totalPhases,
  completedPhases,
  canNavigateFreely,
  onPhaseClick,
}: PhaseProgressProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-surface border-b border-border">
      {Array.from({ length: totalPhases }, (_, i) => {
        const phase = i + 1;
        const isCurrent = phase === currentPhase;
        const isCompleted = completedPhases.has(phase);
        const isClickable = canNavigateFreely || isCompleted || phase <= currentPhase;

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
                isCompleted && !isCurrent && 'bg-success/20 text-success',
                !isCurrent && !isCompleted && 'bg-surface-elevated text-text-muted'
              )}
            >
              {isCompleted && !isCurrent ? '✓' : phase}
            </span>
            <span className="hidden lg:inline">{PHASE_LABELS[i]}</span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create ContextPanel component**

Create `src/components/simulation/ContextPanel.tsx`:
```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { PhaseContent } from '@/lib/phase-content';

interface ContextPanelProps {
  content: PhaseContent;
}

export function ContextPanel({ content }: ContextPanelProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={content.phase}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className="h-full overflow-y-auto p-5"
      >
        <div className="mb-1 text-xs font-mono text-accent uppercase tracking-widest">
          Phase {content.phase}
        </div>
        <h2 className="text-xl font-bold text-text-primary">{content.title}</h2>
        <p className="mt-1 text-sm text-text-secondary">{content.subtitle}</p>

        <div className="mt-5 space-y-4">
          {content.paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-text-secondary">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <h4 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">
            Sources
          </h4>
          <ul className="space-y-1">
            {content.sources.map((source, i) => (
              <li key={i} className="text-xs text-text-muted">
                {source}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Create InteractionPanel component**

Create `src/components/simulation/InteractionPanel.tsx`:
```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ScenarioCard } from '@/components/cards/ScenarioCard';
import type { ScenarioCard as ScenarioCardType } from '@engine/types';

interface InteractionPanelProps {
  scenarios: ScenarioCardType[];
  selectedScenarioId: string | null;
  onSelectScenario: (scenario: ScenarioCardType) => void;
  phase: number;
  onAdvance: () => void;
  canAdvance: boolean;
}

export function InteractionPanel({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  phase,
  onAdvance,
  canAdvance,
}: InteractionPanelProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex h-full flex-col overflow-y-auto p-5"
      >
        <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
          Scenario Selection
        </h3>
        <p className="text-xs text-text-secondary mb-4">
          Choose a crisis trigger to see how it shifts the probability landscape.
        </p>

        <div className="flex-1 space-y-3">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              isSelected={scenario.id === selectedScenarioId}
              onSelect={onSelectScenario}
            />
          ))}
        </div>

        {canAdvance && (
          <button
            onClick={onAdvance}
            className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Continue to Next Phase →
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Create ResultsPanel component**

Create `src/components/simulation/ResultsPanel.tsx`:
```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ProbabilityBar } from '@/components/visualizations/ProbabilityBar';
import { DistributionChart } from '@/components/visualizations/DistributionChart';
import type { SimNode, ContinuousNode } from '@engine/types';
import type { PhaseResults } from '@/hooks/useSimulation';

interface ResultsPanelProps {
  nodes: SimNode[];
  phaseResults: PhaseResults | null;
  phase: number;
  isRunning: boolean;
}

export function ResultsPanel({ nodes, phaseResults, phase, isRunning }: ResultsPanelProps) {
  if (!phaseResults) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-sm text-text-muted">
          {isRunning ? 'Running simulation...' : 'Select a scenario to see results'}
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`results-${phase}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full overflow-y-auto p-5"
      >
        <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-4">
          Outcome Distributions
        </h3>

        <div className="space-y-6">
          {nodes.map((node) => {
            const values = phaseResults.distributions.get(node.id);
            if (!values) return null;

            const stats = phaseResults.stats.get(node.id);

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border border-border bg-surface-elevated p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-medium text-text-primary">
                      {node.label}
                    </h4>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {node.description.length > 80
                        ? node.description.slice(0, 80) + '...'
                        : node.description}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      node.source.confidence === 'high'
                        ? 'bg-success/10 text-success'
                        : node.source.confidence === 'medium'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {node.source.confidence}
                  </span>
                </div>

                {node.type === 'continuous' ? (
                  <DistributionChart
                    node={node as ContinuousNode}
                    values={values}
                    width={260}
                    height={120}
                  />
                ) : (
                  <ProbabilityBar node={node} values={values} width={260} height={100} />
                )}

                {stats && (
                  <div className="mt-2 flex gap-3 text-[10px] font-mono text-text-muted">
                    <span>mean: {stats.mean.toFixed(2)}</span>
                    <span>p10: {stats.p10.toFixed(2)}</span>
                    <span>p90: {stats.p90.toFixed(2)}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/simulation/
git commit -m "feat: add simulation panels — context, interaction, results, phase progress"
```

---

### Task 9: SimulationShell — Three-Panel Orchestrator

**Files:**
- Create: `src/components/simulation/SimulationShell.tsx`

- [ ] **Step 1: Create the SimulationShell component**

Create `src/components/simulation/SimulationShell.tsx`:
```tsx
'use client';

import { useEffect, useMemo } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { usePhase } from '@/hooks/usePhase';
import { PhaseProgress } from './PhaseProgress';
import { ContextPanel } from './ContextPanel';
import { InteractionPanel } from './InteractionPanel';
import { ResultsPanel } from './ResultsPanel';
import { getPhaseContent } from '@/lib/phase-content';
import type { SimNode, ScenarioCard as ScenarioCardType } from '@engine/types';

interface SimulationShellProps {
  nodes: SimNode[];
  scenarios: ScenarioCardType[];
}

export function SimulationShell({ nodes, scenarios }: SimulationShellProps) {
  const phase = usePhase();
  const simulation = useSimulation(nodes);

  // Run simulation on mount and whenever scenarios change
  useEffect(() => {
    simulation.run(1000);
  }, [simulation.run]);

  const content = getPhaseContent(phase.currentPhase);
  const phaseScenarios = useMemo(
    () => scenarios.filter((s) => s.phase === phase.currentPhase),
    [scenarios, phase.currentPhase]
  );
  const selectedScenario = simulation.selectedScenarios.get(phase.currentPhase);
  const phaseResults = simulation.getPhaseResults(phase.currentPhase);

  // Get nodes for the current phase
  const phaseNodes = useMemo(() => {
    const phaseNodeIds = simulation.activeGraph.phaseNodes.get(phase.currentPhase) ?? [];
    return phaseNodeIds
      .map((id) => simulation.activeGraph.nodes.get(id))
      .filter((n): n is SimNode => n !== undefined);
  }, [simulation.activeGraph, phase.currentPhase]);

  const handleSelectScenario = (scenario: ScenarioCardType) => {
    if (selectedScenario?.id === scenario.id) {
      simulation.clearScenario(phase.currentPhase);
    } else {
      simulation.selectScenario(scenario);
    }
    // Re-run simulation after a tick to let state update
    setTimeout(() => simulation.run(1000), 0);
  };

  if (!content) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-text-muted">Phase {phase.currentPhase} content coming soon</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Phase progress bar */}
      <PhaseProgress
        currentPhase={phase.currentPhase}
        totalPhases={phase.totalPhases}
        completedPhases={phase.completedPhases}
        canNavigateFreely={phase.canNavigateFreely}
        onPhaseClick={phase.goToPhase}
      />

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Context */}
        <div className="w-[320px] border-r border-border flex-shrink-0">
          <ContextPanel content={content} />
        </div>

        {/* Center: Interaction */}
        <div className="w-[320px] border-r border-border flex-shrink-0">
          <InteractionPanel
            scenarios={phaseScenarios}
            selectedScenarioId={selectedScenario?.id ?? null}
            onSelectScenario={handleSelectScenario}
            phase={phase.currentPhase}
            onAdvance={phase.advancePhase}
            canAdvance={phase.canAdvance}
          />
        </div>

        {/* Right: Results */}
        <div className="flex-1">
          <ResultsPanel
            nodes={phaseNodes}
            phaseResults={phaseResults}
            phase={phase.currentPhase}
            isRunning={simulation.isRunning}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/simulation/SimulationShell.tsx
git commit -m "feat: add SimulationShell three-panel orchestrator"
```

---

### Task 10: Simulation Page — Wire Everything Together

**Files:**
- Create: `src/app/simulation/page.tsx`

- [ ] **Step 1: Create the simulation page**

Create `src/app/simulation/page.tsx`:
```tsx
'use client';

import { SimulationShell } from '@/components/simulation/SimulationShell';
import phase1Nodes from '@data/nodes/phase-1-tensions.json';
import phase1Scenarios from '@data/scenarios/phase-1-scenarios.json';
import type { SimNode, ScenarioCard } from '@engine/types';

const nodes = phase1Nodes as unknown as SimNode[];
const scenarios = phase1Scenarios as unknown as ScenarioCard[];

export default function SimulationPage() {
  return <SimulationShell nodes={nodes} scenarios={scenarios} />;
}
```

- [ ] **Step 2: Verify build succeeds**

Run:
```bash
npx next build 2>&1 | tail -10
```
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/simulation/
git commit -m "feat: wire simulation page with Phase 1 data"
```

---

### Task 11: Landing Page — Cinematic Hero

**Files:**
- Replace: `src/app/page.tsx`

- [ ] **Step 1: Create the full landing page**

Replace `src/app/page.tsx` with:
```tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(74,139,181,0.08)_0%,_transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl text-center px-6">
        <div className="mb-4 text-xs font-mono text-accent uppercase tracking-[0.3em]">
          Monte Carlo Simulation
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-text-primary sm:text-6xl">
          USA vs Iran
        </h1>
        <h2 className="mt-2 text-2xl font-light text-text-secondary sm:text-3xl">
          War Simulation
        </h2>

        <p className="mt-6 text-sm leading-relaxed text-text-secondary max-w-lg mx-auto">
          An interactive Monte Carlo simulation exploring the cascading consequences of a
          US-Iran military conflict. Walk through 8 phases — from pre-conflict tensions to
          long-term aftermath — and see how decisions in one domain ripple across military,
          economic, geopolitical, and humanitarian outcomes.
        </p>

        <p className="mt-4 text-xs text-text-muted max-w-md mx-auto">
          Each simulation runs thousands of scenarios through a Bayesian network to show
          you not just what might happen, but how likely each outcome is — and why.
        </p>

        <Link
          href="/simulation"
          className="mt-10 inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          Begin Simulation
          <span className="text-white/60">→</span>
        </Link>

        <div className="mt-12 flex items-center justify-center gap-6 text-[10px] font-mono text-text-muted">
          <span>As of March 2026</span>
          <span className="h-3 w-px bg-border" />
          <span>Research-backed parameters</span>
          <span className="h-3 w-px bg-border" />
          <span>Open source</span>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: create cinematic landing page"
```

---

### Task 12: Build Verification & Test Suite

**Files:** None new — verification only

- [ ] **Step 1: Run the full test suite**

Run:
```bash
npx vitest run
```
Expected: All 49+ tests PASS

- [ ] **Step 2: Run Next.js build**

Run:
```bash
npx next build 2>&1 | tail -15
```
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit any fixes if needed**

If the build surfaced issues, fix and commit them.

- [ ] **Step 4: Final commit log review**

Run:
```bash
git log --oneline
```
Verify clean commit history.

---

## Summary

After completing all 12 tasks, you will have:

- **Next.js 14+ app** with static export for Vercel
- **Dark theme** with custom color palette (STRATFOR meets Bloomberg)
- **Cinematic landing page** with simulation overview
- **Three-panel simulation layout** — context (left), interaction (center), results (right)
- **Phase progress bar** with linear progression + free navigation after completion
- **Scenario cards** — 4 interactive cards for Phase 1 with visual selection state
- **D3 visualizations** — ProbabilityBar (categorical/binary), DistributionChart (continuous), SensitivitySparkline
- **React hooks** — useSimulation (engine state), usePhase (navigation), useWorker (Web Worker lifecycle)
- **Full Phase 1 wired end-to-end** — user can select scenario cards and see probability distributions update in real time
- **All 49 existing engine tests still passing**

**Plan 3 (Phases 2-8 + Polish)** will add remaining phase data, cascade Sankey, phase-specific visualizations, URL sharing, responsive layout, and accessibility.

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

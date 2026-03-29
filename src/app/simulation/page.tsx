'use client';

import { useMemo } from 'react';
import { SimulationShell } from '@/components/simulation/SimulationShell';
import type { SimNode, ScenarioCard } from '@engine/types';

import phase1Nodes from '@data/nodes/phase-1-tensions.json';
import phase2Nodes from '@data/nodes/phase-2-escalation.json';
import phase3Nodes from '@data/nodes/phase-3-conflict.json';
import phase4Nodes from '@data/nodes/phase-4-economic.json';
import phase5Nodes from '@data/nodes/phase-5-geopolitical.json';
import phase6Nodes from '@data/nodes/phase-6-humanitarian.json';
import phase7Nodes from '@data/nodes/phase-7-resolution.json';
import phase8Nodes from '@data/nodes/phase-8-aftermath.json';

import phase1Scenarios from '@data/scenarios/phase-1-scenarios.json';
import phase2Scenarios from '@data/scenarios/phase-2-scenarios.json';
import phase3Scenarios from '@data/scenarios/phase-3-scenarios.json';
import phase4Scenarios from '@data/scenarios/phase-4-scenarios.json';
import phase5Scenarios from '@data/scenarios/phase-5-scenarios.json';
import phase6Scenarios from '@data/scenarios/phase-6-scenarios.json';
import phase7Scenarios from '@data/scenarios/phase-7-scenarios.json';
import phase8Scenarios from '@data/scenarios/phase-8-scenarios.json';

const allNodes = [
  ...phase1Nodes,
  ...phase2Nodes,
  ...phase3Nodes,
  ...phase4Nodes,
  ...phase5Nodes,
  ...phase6Nodes,
  ...phase7Nodes,
  ...phase8Nodes,
] as unknown as SimNode[];

const allScenarios = [
  ...phase1Scenarios,
  ...phase2Scenarios,
  ...phase3Scenarios,
  ...phase4Scenarios,
  ...phase5Scenarios,
  ...phase6Scenarios,
  ...phase7Scenarios,
  ...phase8Scenarios,
] as unknown as ScenarioCard[];

export default function SimulationPage() {
  return <SimulationShell nodes={allNodes} scenarios={allScenarios} />;
}

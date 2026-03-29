'use client';

import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import type { SimGraph, SimulationResult } from '@engine/types';

interface CascadeStripProps {
  graph: SimGraph;
  result: SimulationResult | null;
  currentPhase: number;
  width?: number;
  height?: number;
}

// Summary node IDs per phase — these are the key output nodes we track
const PHASE_SUMMARY_NODES: Record<number, string> = {
  1: 'escalation_trigger_probability',
  2: 'escalation_ladder_position',
  3: 'overall_military_balance',
  4: 'global_gdp_impact',
  5: 'regional_power_dynamics_shift',
  6: 'humanitarian_cost_index',
  7: 'resolution_type',
  8: 'long_term_stability_assessment',
};

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

// Severity color mapping (0=low severity, 1=high severity)
const severityColor = d3
  .scaleLinear<string>()
  .domain([0, 0.5, 1])
  .range(['#4a8bb5', '#c49a3c', '#b54a4a']);

export function CascadeStrip({
  graph,
  result,
  currentPhase,
  width = 900,
  height = 100,
}: CascadeStripProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Compute per-phase severity scores from simulation results
  const phaseSeverity = useMemo(() => {
    if (!result) return new Map<number, number>();

    const severity = new Map<number, number>();

    for (let phase = 1; phase <= 8; phase++) {
      const nodeId = PHASE_SUMMARY_NODES[phase];
      if (!nodeId) continue;

      const idx = result.nodeIndexMap.get(nodeId);
      if (idx === undefined) continue;

      const node = graph.nodes.get(nodeId);
      if (!node) continue;

      // Compute mean value, normalize to 0-1 severity
      let sum = 0;
      for (let i = 0; i < result.runCount; i++) {
        sum += result.runs[i][idx];
      }
      const mean = sum / result.runCount;

      if (node.type === 'binary') {
        // pTrue = severity (higher probability of trigger = higher severity)
        severity.set(phase, mean);
      } else if (node.type === 'categorical') {
        // Normalize: higher category index = higher severity
        const maxIdx = node.categories.length - 1;
        severity.set(phase, maxIdx > 0 ? mean / maxIdx : 0);
      } else if (node.type === 'continuous') {
        // Normalize to 0-1 range
        severity.set(phase, (mean - node.min) / (node.max - node.min));
      }
    }

    return severity;
  }, [result, graph]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 8, right: 20, bottom: 20, left: 20 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const phaseWidth = w / 8;
    const nodeRadius = 8;

    // Draw phase columns
    for (let i = 0; i < 8; i++) {
      const phase = i + 1;
      const cx = i * phaseWidth + phaseWidth / 2;
      const cy = h / 2;
      const sev = phaseSeverity.get(phase) ?? 0;

      // Connection to next phase
      if (i < 7) {
        const nextSev = phaseSeverity.get(phase + 1) ?? 0;
        const avgSev = (sev + nextSev) / 2;
        const nextCx = (i + 1) * phaseWidth + phaseWidth / 2;

        g.append('path')
          .attr(
            'd',
            `M ${cx + nodeRadius} ${cy} C ${cx + phaseWidth * 0.4} ${cy}, ${nextCx - phaseWidth * 0.4} ${cy}, ${nextCx - nodeRadius} ${cy}`
          )
          .attr('fill', 'none')
          .attr('stroke', result ? severityColor(avgSev) : '#2a2a3a')
          .attr('stroke-width', result ? 2 + avgSev * 4 : 2)
          .attr('opacity', result ? 0.6 + avgSev * 0.4 : 0.3);
      }

      // Phase node circle
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', nodeRadius)
        .attr('fill', phase === currentPhase ? '#4a8bb5' : result ? severityColor(sev) : '#1a1a25')
        .attr('stroke', phase === currentPhase ? '#5a9bc5' : '#2a2a3a')
        .attr('stroke-width', phase === currentPhase ? 2 : 1);

      // Phase number
      g.append('text')
        .attr('x', cx)
        .attr('y', cy + 3)
        .attr('text-anchor', 'middle')
        .attr('fill', phase === currentPhase ? '#fff' : '#8888a0')
        .attr('font-size', '8px')
        .attr('font-family', "'JetBrains Mono', monospace")
        .text(phase);

      // Phase label below
      g.append('text')
        .attr('x', cx)
        .attr('y', h + 12)
        .attr('text-anchor', 'middle')
        .attr('fill', phase === currentPhase ? '#e8e8ed' : '#55556a')
        .attr('font-size', '8px')
        .attr('font-family', 'Inter, system-ui, sans-serif')
        .text(PHASE_LABELS[i]);
    }
  }, [phaseSeverity, currentPhase, width, height, result]);

  return (
    <div className="border-t border-border bg-surface px-4 py-2">
      <svg ref={svgRef} className="w-full overflow-visible" />
    </div>
  );
}

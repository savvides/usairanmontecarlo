'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { SimNode, CategoricalNode } from '@engine/types';

interface ProbabilityBarProps {
  node: SimNode;
  values: number[];
  width?: number;
}

export function ProbabilityBar({ node, values, width = 280 }: ProbabilityBarProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Compute labels and frequencies first so we can size the SVG
  let labels: string[];
  let frequencies: number[];

  if (node.type === 'binary') {
    labels = ['No', 'Yes'];
    const trueCount = values.filter((v) => v === 1).length;
    frequencies = values.length > 0
      ? [(values.length - trueCount) / values.length, trueCount / values.length]
      : [0.5, 0.5];
  } else if (node.type === 'categorical') {
    const catNode = node as CategoricalNode;
    labels = catNode.categories;
    frequencies = labels.map((_, idx) => {
      return values.length > 0 ? values.filter((v) => v === idx).length / values.length : 0;
    });
  } else {
    labels = [];
    frequencies = [];
  }

  // Each row: 14px label + 4px gap + 16px bar = 34px per row, plus 6px gap between rows
  const rowHeight = 40;
  const barHeight = 16;
  const labelHeight = 14;
  const margin = { top: 4, right: 12, bottom: 4, left: 12 };
  const totalHeight = margin.top + labels.length * rowHeight + margin.bottom;

  useEffect(() => {
    if (!svgRef.current || values.length === 0 || labels.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const w = width - margin.left - margin.right;

    const g = svg
      .attr('width', width)
      .attr('height', totalHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 1]).range([0, w]);

    const colorScale = (freq: number) => {
      if (freq > 0.5) return '#b54a4a';
      if (freq > 0.3) return '#c49a3c';
      return '#4a8bb5';
    };

    labels.forEach((label, i) => {
      const rowY = i * rowHeight;

      // Label above bar
      g.append('text')
        .attr('x', 0)
        .attr('y', rowY + labelHeight - 2)
        .attr('fill', '#8888a0')
        .attr('font-size', '10px')
        .attr('font-family', 'Inter, system-ui, sans-serif')
        .text(label.replace(/_/g, ' '));

      // Bar
      g.append('rect')
        .attr('x', 0)
        .attr('y', rowY + labelHeight + 2)
        .attr('height', barHeight)
        .attr('width', 0)
        .attr('fill', colorScale(frequencies[i]))
        .attr('rx', 2)
        .transition()
        .duration(400)
        .attr('width', x(frequencies[i]));

      // Percentage label to the right of bar
      g.append('text')
        .attr('x', Math.max(x(frequencies[i]) + 6, 6))
        .attr('y', rowY + labelHeight + 2 + barHeight / 2 + 4)
        .attr('fill', '#e8e8ed')
        .attr('font-size', '10px')
        .attr('font-family', "'JetBrains Mono', monospace")
        .text(`${(frequencies[i] * 100).toFixed(1)}%`);
    });
  }, [node, values, width, labels, frequencies, totalHeight]);

  return <svg ref={svgRef} style={{ height: totalHeight }} className="overflow-visible" />;
}

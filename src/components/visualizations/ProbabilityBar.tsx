'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { SimNode, CategoricalNode } from '@engine/types';

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
      return;
    }

    const x = d3.scaleLinear().domain([0, 1]).range([0, w]);
    const y = d3
      .scaleBand()
      .domain(labels)
      .range([0, h])
      .padding(0.3);

    const colorScale = (freq: number) => {
      if (freq > 0.5) return '#b54a4a';
      if (freq > 0.3) return '#c49a3c';
      return '#4a8bb5';
    };

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

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

    const x = d3.scaleLinear().domain([node.min, node.max]).range([0, w]);

    const histogram = d3
      .bin()
      .domain(x.domain() as [number, number])
      .thresholds(x.ticks(25));

    const bins = histogram(values);
    const maxCount = d3.max(bins, (b) => b.length) ?? 1;
    const y = d3.scaleLinear().domain([0, maxCount]).range([h, 0]);

    const colorScale = d3
      .scaleLinear<string>()
      .domain([node.min, (node.min + node.max) / 2, node.max])
      .range(['#4a8bb5', '#c49a3c', '#b54a4a']);

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

    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat((d) => `${d}`))
      .call((g) => {
        g.selectAll('text').attr('fill', '#8888a0').attr('font-size', '9px');
        g.selectAll('line').attr('stroke', '#2a2a3a');
        g.select('.domain').attr('stroke', '#2a2a3a');
      });

    g.append('text')
      .attr('x', w / 2)
      .attr('y', h + 24)
      .attr('text-anchor', 'middle')
      .attr('fill', '#55556a')
      .attr('font-size', '9px')
      .text(node.unit);

    g.append('g')
      .call(d3.axisLeft(y).ticks(3).tickFormat((d) => `${d}`))
      .call((g) => {
        g.selectAll('text').attr('fill', '#8888a0').attr('font-size', '9px');
        g.selectAll('line').attr('stroke', '#2a2a3a');
        g.select('.domain').attr('stroke', '#2a2a3a');
      });

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

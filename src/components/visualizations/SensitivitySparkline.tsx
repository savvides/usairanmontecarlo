'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface SensitivitySparklineProps {
  stddev: number;
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

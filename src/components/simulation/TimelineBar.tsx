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

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const events = timeline.events.map((e) => ({
      ...e,
      parsedDate: new Date(e.date + 'T00:00:00'),
    }));

    const today = new Date();
    const minDate = events.length > 0 ? d3.min(events, (e) => e.parsedDate)! : today;
    const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const x = d3.scaleTime().domain([minDate, maxDate]).range([0, w]);
    const observedEnd = new Date(timeline.observedThrough + 'T00:00:00');

    // Observed zone
    g.append('rect')
      .attr('x', 0).attr('y', h / 2 - 3)
      .attr('width', Math.max(0, x(observedEnd)))
      .attr('height', 6).attr('rx', 3)
      .attr('fill', '#4a8bb5').attr('opacity', 0.4);

    // Projected zone
    g.append('rect')
      .attr('x', x(observedEnd)).attr('y', h / 2 - 3)
      .attr('width', Math.max(0, w - x(observedEnd)))
      .attr('height', 6).attr('rx', 3)
      .attr('fill', '#2a2a3a').attr('opacity', 0.6);

    // NOW marker
    const nowX = x(today);
    g.append('line')
      .attr('x1', nowX).attr('x2', nowX).attr('y1', 0).attr('y2', h)
      .attr('stroke', '#e8e8ed').attr('stroke-width', 1.5).attr('stroke-dasharray', '3,2');
    g.append('text')
      .attr('x', nowX).attr('y', -2).attr('text-anchor', 'middle')
      .attr('fill', '#e8e8ed').attr('font-size', '8px')
      .attr('font-family', "'JetBrains Mono', monospace").text('NOW');

    // Zone labels
    g.append('text')
      .attr('x', Math.min(x(observedEnd) / 2, w / 4)).attr('y', h + 16)
      .attr('text-anchor', 'middle').attr('fill', '#4a8bb5')
      .attr('font-size', '8px').attr('font-family', "'JetBrains Mono', monospace")
      .text('OBSERVED');
    g.append('text')
      .attr('x', Math.max(x(observedEnd) + (w - x(observedEnd)) / 2, w * 0.75)).attr('y', h + 16)
      .attr('text-anchor', 'middle').attr('fill', '#55556a')
      .attr('font-size', '8px').attr('font-family', "'JetBrains Mono', monospace")
      .text('PROJECTED');

    // Event markers with tooltips
    const tooltip = d3.select(tooltipRef.current);

    events.forEach((event) => {
      const cx = x(event.parsedDate);
      const isCurrentPhase = event.phase === currentPhase;

      const marker = g.append('circle')
        .attr('cx', cx).attr('cy', h / 2)
        .attr('r', isCurrentPhase ? 6 : 4)
        .attr('fill', event.parsedDate <= observedEnd ? '#4a8bb5' : '#55556a')
        .attr('stroke', isCurrentPhase ? '#e8e8ed' : 'none')
        .attr('stroke-width', isCurrentPhase ? 1.5 : 0)
        .attr('cursor', 'pointer');

      g.append('text')
        .attr('x', cx).attr('y', h / 2 + 16)
        .attr('text-anchor', 'middle').attr('fill', '#55556a')
        .attr('font-size', '7px').attr('font-family', "'JetBrains Mono', monospace")
        .text(formatDate(event.date));

      marker
        .on('mouseenter', (mouseEvent) => {
          tooltip.style('display', 'block')
            .style('left', `${mouseEvent.pageX + 10}px`)
            .style('top', `${mouseEvent.pageY - 10}px`)
            .html(
              `<div class="text-xs font-semibold text-text-primary">${event.label}</div>
               <div class="text-[10px] text-text-secondary mt-1">${formatDate(event.date)}</div>
               <div class="text-[10px] text-text-secondary mt-1 leading-relaxed">${event.description}</div>
               <div class="text-[9px] text-text-muted mt-1.5 font-mono">${event.source}</div>`
            );
        })
        .on('mouseleave', () => { tooltip.style('display', 'none'); })
        .on('click', () => { if (onEventClick) onEventClick(event); });
    });
  }, [timeline, currentPhase, onEventClick]);

  return (
    <div className="relative border-t border-border bg-surface px-2 py-1">
      <svg ref={svgRef} className="w-full overflow-visible" />
      <div ref={tooltipRef} className="fixed z-50 hidden max-w-xs rounded-lg border border-border bg-surface-elevated p-3 shadow-lg" style={{ pointerEvents: 'none' }} />
    </div>
  );
}

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

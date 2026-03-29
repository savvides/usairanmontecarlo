import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(74,139,181,0.08)_0%,_transparent_70%)]" />

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

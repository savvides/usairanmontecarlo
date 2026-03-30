import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(74,139,181,0.08)_0%,_transparent_70%)]" />

      <div className="relative z-10 max-w-2xl text-center px-6">
        <div className="mb-4 text-xs font-mono text-accent uppercase tracking-[0.3em]">
          Monte Carlo Analysis of the 2026 Conflict
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-text-primary sm:text-6xl">
          USA vs Iran
        </h1>
        <h2 className="mt-2 text-2xl font-light text-text-secondary sm:text-3xl">
          War Simulation
        </h2>

        <p className="mt-6 text-sm leading-relaxed text-text-secondary max-w-lg mx-auto">
          The war began February 28, 2026. US and Israeli forces struck Iran in a surprise
          12-hour campaign, killing Supreme Leader Khamenei and destroying the nuclear program.
          This simulation models what happens next — tracing the conflict through retaliation,
          active fighting, economic shockwaves, and the paths to resolution.
        </p>

        <p className="mt-4 text-xs text-text-muted max-w-md mx-auto">
          Phases 1–2 are locked to observed historical data. Phases 3–8 are probabilistic
          projections — each simulation runs 5,000 scenarios through a Bayesian network to show
          the range of outcomes and how likely each one is.
        </p>

        <Link
          href="/simulation"
          className="mt-10 inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          Begin Simulation
          <span className="text-white/60">→</span>
        </Link>

        <div className="mt-12 flex items-center justify-center gap-6 text-[10px] font-mono text-text-muted">
          <span>As of March 29, 2026</span>
          <span className="h-3 w-px bg-border" />
          <span>Research-backed parameters</span>
          <span className="h-3 w-px bg-border" />
          <span>Open source</span>
          <span className="h-3 w-px bg-border" />
          <Link href="/methodology" className="hover:text-text-secondary transition-colors">
            Methodology
          </Link>
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-text-primary">
        USA vs Iran War Simulation
      </h1>
      <p className="mt-4 text-text-secondary">Monte Carlo Analysis — Loading...</p>
      <Link
        href="/simulation"
        className="mt-8 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
      >
        Begin Simulation
      </Link>
    </main>
  );
}

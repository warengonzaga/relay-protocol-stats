import { Link } from 'react-router-dom';

export default function RetirementPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col justify-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Relay Protocol Stats</p>
        <section className="mt-5 rounded-2xl border border-amber-500/20 bg-zinc-900/80 p-6 sm:p-10">
          <p className="text-sm font-semibold text-amber-300">Project discontinued</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Relay Protocol Stats is no longer maintained.
          </h1>
          <div className="mt-5 space-y-4 text-sm leading-6 text-zinc-300 sm:text-base">
            <p>
              Relay is changing its API. The replacement Requests API requires an active API key and only returns
              requests owned by the authenticated integrator.
            </p>
            <p>
              Keeping this public dashboard running would require a hosted server to protect and provide that key,
              which is not sustainable for this project.
            </p>
            <p>
              The existing dashboard is preserved as-is, but API changes mean it may no longer load current data.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/stats"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open the existing dashboard
            </Link>
            <a
              href="https://docs.relay.link/references/api/api_guides/migrating-to-requests-v3"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              Relay API migration guide
            </a>
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            Read the full{' '}
            <a
              href="https://github.com/warengonzaga/relay-protocol-stats#project-status"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 underline underline-offset-4 hover:text-white"
            >
              project status notice
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

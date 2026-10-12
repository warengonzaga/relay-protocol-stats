import { Link } from 'react-router-dom';

export default function ProjectNotice() {
  return (
    <aside
      aria-label="Project status"
      className="mb-6 flex flex-col gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between"
    >
      <p>
        <strong>This page may no longer work.</strong> Relay Protocol Stats is discontinued, and Relay API changes may
        prevent current data from loading.
      </p>
      <Link to="/" className="shrink-0 font-medium text-amber-200 underline underline-offset-4 hover:text-white">
        Read the project notice
      </Link>
    </aside>
  );
}

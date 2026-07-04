import { FILTERS } from '../constants';

const ACTIVE_TAB = 'px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white';
const INACTIVE_TAB = 'px-3 py-1 rounded text-sm font-medium text-slate-600 hover:bg-slate-200';

/**
 * Renders All / Active / Completed filter tabs.
 *
 * @param {{ filter: string, onFilterChange: (filter: string) => void }} props
 */
export default function FilterBar({ filter, onFilterChange }) {
  return (
    <div role="tablist" className="flex gap-1 mb-4 justify-center">
      {FILTERS.map((f) => (
        <button
          key={f}
          role="tab"
          aria-selected={filter === f}
          onClick={() => onFilterChange(f)}
          className={filter === f ? ACTIVE_TAB : INACTIVE_TAB}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );
}

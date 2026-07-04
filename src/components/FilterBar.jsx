import { FILTERS } from '../constants';

const ACTIVE_TAB = 'px-3 py-1 rounded text-sm font-medium bg-[#c4746e] text-[#282727]';
const INACTIVE_TAB = 'px-3 py-1 rounded text-sm font-medium text-[#737c73] hover:bg-[#393836] hover:text-[#c5c9c5]';

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

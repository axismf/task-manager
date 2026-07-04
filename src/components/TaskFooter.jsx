/**
 * Displays the count of active (incomplete) tasks.
 *
 * @param {{ activeCount: number }} props
 */
export default function TaskFooter({ activeCount }) {
  const label = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;

  return (
    <footer className="mt-4 pt-3 border-t border-slate-100 text-sm text-slate-500 text-center">
      <span>{label}</span>
    </footer>
  );
}

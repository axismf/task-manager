/**
 * Displays the count of active (incomplete) tasks.
 *
 * @param {{ activeCount: number }} props
 */
export default function TaskFooter({ activeCount }) {
  const label = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;

  return (
    <footer className="mt-4 pt-3 border-t border-[#625e5a] text-sm text-[#737c73] text-center">
      <span>{label}</span>
    </footer>
  );
}

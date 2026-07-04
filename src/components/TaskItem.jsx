/**
 * Renders a single task row: completion checkbox, task text, and delete button.
 *
 * @param {{ task: object, onToggle: (id: string) => void, onDelete: (id: string) => void }} props
 */
export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className="flex items-center gap-3 py-2 border-b border-[#625e5a] group">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.text}" as ${task.completed ? 'active' : 'completed'}`}
        className="h-4 w-4 accent-[#c4746e] cursor-pointer"
      />
      <span className={`flex-1 ${task.completed ? 'line-through text-[#737c73]' : 'text-[#c5c9c5]'}`}>
        {task.text}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        aria-label={`Delete "${task.text}"`}
        className="text-[#737c73] hover:text-[#c4746e] opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </li>
  );
}

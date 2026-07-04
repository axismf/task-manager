/**
 * Renders a single task row: completion checkbox, task text, and delete button.
 *
 * @param {{ task: object, onToggle: (id: string) => void, onDelete: (id: string) => void }} props
 */
export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className="flex items-center gap-3 py-2 border-b border-slate-100 group">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.text}" as ${task.completed ? 'active' : 'completed'}`}
        className="h-4 w-4 accent-blue-600 cursor-pointer"
      />
      <span className={`flex-1 ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
        {task.text}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        aria-label={`Delete "${task.text}"`}
        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </li>
  );
}

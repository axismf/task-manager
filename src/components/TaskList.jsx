import { EMPTY_MESSAGES } from '../constants';
import TaskItem from './TaskItem';

/**
 * Renders the filtered list of tasks, or a contextual empty-state message.
 *
 * @param {{
 *   tasks: object[],
 *   filter: string,
 *   onToggle: (id: string) => void,
 *   onDelete: (id: string) => void,
 * }} props
 */
export default function TaskList({ tasks, filter, onToggle, onDelete }) {
  if (tasks.length === 0) {
    return (
      <p className="text-center text-slate-400 py-8 text-sm">
        {EMPTY_MESSAGES[filter]}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { STORAGE_KEY } from '../constants';

/**
 * Returns true only when the task object has the required shape.
 * @param {unknown} t
 * @returns {boolean}
 */
function isValidTask(t) {
  return (
    t !== null &&
    typeof t === 'object' &&
    typeof t.id === 'string' &&
    typeof t.text === 'string' &&
    typeof t.completed === 'boolean'
  );
}

/**
 * Reads and validates tasks from localStorage.
 * Falls back to [] on any error or malformed value.
 * @returns {import('../constants').Task[]}
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTask);
  } catch {
    return [];
  }
}

/**
 * Single source of truth for task state, filter state, derived values,
 * and localStorage synchronization.
 *
 * @returns {{
 *   tasks: object[],
 *   filter: string,
 *   filteredTasks: object[],
 *   activeCount: number,
 *   addTask: (text: string) => void,
 *   toggleTask: (id: string) => void,
 *   deleteTask: (id: string) => void,
 *   setFilter: (filter: string) => void,
 * }}
 */
export function useTasks() {
  // Lazy initializer: loadTasks runs exactly once on mount.
  const [tasks, setTasks] = useState(loadTasks);
  const [filter, setFilter] = useState('all');

  // Persist tasks to localStorage on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Quota exceeded or storage unavailable — keep in-memory state, do not crash.
    }
  }, [tasks]);

  const addTask = useCallback((text) => {
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, completed: false },
    ]);
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter((t) => !t.completed);
      case 'completed':
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const activeCount = useMemo(
    () => tasks.filter((t) => !t.completed).length,
    [tasks]
  );

  return {
    tasks,
    filter,
    filteredTasks,
    activeCount,
    addTask,
    toggleTask,
    deleteTask,
    setFilter,
  };
}

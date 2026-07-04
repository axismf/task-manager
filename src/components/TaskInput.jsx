import { useState } from 'react';

/**
 * Controlled text input + submit mechanism for adding new tasks.
 * Handles trimming and empty/whitespace rejection before calling onAdd.
 *
 * @param {{ onAdd: (text: string) => void }} props
 */
export default function TaskInput({ onAdd }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What needs to be done?"
        aria-label="New task"
        className="flex-1 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 active:bg-blue-800"
      >
        Add
      </button>
    </form>
  );
}

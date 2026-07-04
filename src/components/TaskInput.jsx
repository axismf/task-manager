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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What needs to be done?"
        aria-label="New task"
        className="flex-1 bg-[#181616] border border-[#625e5a] text-[#c5c9c5] placeholder-[#737c73] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c4746e]"
      />
      <button
        type="submit"
        className="bg-[#c4746e] text-[#282727] font-semibold px-4 py-2 rounded hover:brightness-110 active:brightness-90"
      >
        Add
      </button>
    </form>
  );
}

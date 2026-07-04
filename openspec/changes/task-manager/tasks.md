# Task Manager — Implementation Tasks

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 280–340 (all new files) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

```text
Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low
```

---

## Group 1 — Project Scaffold

- [ ] Task 1: Run Vite scaffold
  - Command: `npm create vite@latest . -- --template react` at repo root, then `npm install`
  - Done when: `node_modules/` exists and `npm run dev` starts the default Vite/React app without errors.

- [ ] Task 2: Install Tailwind CSS v3 and PostCSS dependencies
  - Command: `npm install -D tailwindcss@3 postcss autoprefixer`
  - Done when: `package.json` devDependencies contains `tailwindcss` at `^3.x`, `postcss`, and `autoprefixer`.

- [ ] Task 3: Initialize Tailwind config files
  - Command: `npx tailwindcss init -p`
  - Done when: `tailwind.config.js` and `postcss.config.js` exist at repo root.

- [x] Task 4: Configure `tailwind.config.js` content globs
  - File: `tailwind.config.js`
  - Replace the generated `content: []` with `content: ['./index.html', './src/**/*.{js,jsx}']`.
  - Done when: the `content` array matches the pattern above exactly.

- [x] Task 5: Replace `src/index.css` with Tailwind directives
  - File: `src/index.css`
  - Replace entire file content with:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
  - Done when: the file contains only those three lines.

- [x] Task 6: Remove unused scaffold assets
  - Delete: `src/App.css`, `src/assets/react.svg`, `public/vite.svg`
  - Done when: none of those three paths exist.

---

## Group 2 — `constants.js`

- [x] Task 7: Create `src/constants.js`
  - File: `src/constants.js`
  - Must export:
    - `STORAGE_KEY = 'task-manager:tasks'`
    - `FILTERS = ['all', 'active', 'completed']`
    - `EMPTY_MESSAGES = { all: 'No tasks yet. Add one above!', active: 'No active tasks.', completed: 'No completed tasks yet.' }`
  - Done when: the three named exports exist with exact string values matching the spec.

---

## Group 3 — `useTasks` hook

- [x] Task 8: Create `src/hooks/useTasks.js` — load helper
  - File: `src/hooks/useTasks.js`
  - Implement module-scope `loadTasks()` and `isValidTask(t)` helpers.
  - `loadTasks`: reads `STORAGE_KEY` from localStorage, parses JSON, validates it is an array, filters with `isValidTask`, falls back to `[]` on any error.
  - `isValidTask`: returns true only when `id`, `text` are strings and `completed` is boolean.
  - Done when: `loadTasks()` returns `[]` for absent key, invalid JSON, and wrong-shape values, and returns a filtered valid array otherwise.

- [x] Task 9: Implement `useTasks` hook — state, actions, persistence
  - File: `src/hooks/useTasks.js` (continue from Task 8)
  - State: `const [tasks, setTasks] = useState(loadTasks)` (lazy initializer), `const [filter, setFilter] = useState('all')`.
  - Actions: `addTask`, `toggleTask`, `deleteTask` — all use functional `setTasks` updaters and `useCallback`.
  - `useEffect([tasks])`: writes `JSON.stringify(tasks)` to localStorage under `STORAGE_KEY`, wrapped in try/catch.
  - Derived: `filteredTasks` via `useMemo([tasks, filter])`, `activeCount` via `useMemo([tasks])`.
  - Return shape: `{ tasks, filter, filteredTasks, activeCount, addTask, toggleTask, deleteTask, setFilter }`.
  - Done when: the hook exports all eight values and satisfies the ten acceptance criteria in the spec's `useTasks` section.

---

## Group 4 — Components

- [x] Task 10: Create `src/components/TaskInput.jsx`
  - Props: `{ onAdd: (text: string) => void }`
  - Internal state: `value` / `setValue` via `useState('')`.
  - Uses a `<form onSubmit={handleSubmit}>` with a text `<input>` and a `type="submit"` button — covers both Enter key and click in one handler.
  - `handleSubmit`: prevents default, trims value, returns early if empty, calls `onAdd(trimmed)`, clears input.
  - Tailwind classes per design §4.2.
  - Done when: ACs 1–4 of `TaskInput` spec are satisfied.

- [x] Task 11: Create `src/components/TaskItem.jsx`
  - Props: `{ task, onToggle, onDelete }`
  - Renders: controlled checkbox (`checked={task.completed}`), text span with `line-through` class when `task.completed`, delete button with `✕`.
  - Checkbox `onChange` calls `onToggle(task.id)`; delete button `onClick` calls `onDelete(task.id)`.
  - Tailwind classes per design §4.4 (including `group` / `group-hover` delete reveal).
  - Done when: ACs 1–4 of `TaskItem` spec are satisfied.

- [x] Task 12: Create `src/components/TaskList.jsx`
  - Props: `{ tasks, filter, onToggle, onDelete }`
  - Mutually exclusive branches: when `tasks.length === 0` render `<p>{EMPTY_MESSAGES[filter]}</p>`; otherwise render `<ul>` with one `<TaskItem>` per task.
  - Tailwind classes per design §4.5.
  - Done when: ACs 1–3 of `TaskList` spec are satisfied and contextual empty-state messages render correctly.

- [x] Task 13: Create `src/components/FilterBar.jsx`
  - Props: `{ filter, onFilterChange }`
  - Maps over `FILTERS` from `constants.js` to render three buttons.
  - Active button uses `ACTIVE_TAB` classes; inactive uses `INACTIVE_TAB` classes (per design §4.3).
  - Each button calls `onFilterChange(f)` on click.
  - Done when: ACs 1–4 of `FilterBar` spec are satisfied.

- [x] Task 14: Create `src/components/TaskFooter.jsx`
  - Props: `{ activeCount }`
  - Renders label: `"${activeCount} ${activeCount === 1 ? 'item' : 'items'} left"`.
  - Tailwind classes per design §4.6.
  - Done when: ACs 1–3 of `TaskFooter` spec are satisfied (0, 1, N item labels).

---

## Group 5 — `App.jsx` composition

- [x] Task 15: Rewrite `src/App.jsx`
  - Imports `useTasks` and all four components.
  - Calls `useTasks()`, destructures `filter, filteredTasks, activeCount, addTask, toggleTask, deleteTask, setFilter`.
  - Renders: page shell → `<TaskInput onAdd={addTask}>` → `<FilterBar filter={filter} onFilterChange={setFilter}>` → `<TaskList tasks={filteredTasks} filter={filter} onToggle={toggleTask} onDelete={deleteTask}>` → `<TaskFooter activeCount={activeCount}>`.
  - Tailwind layout per design §4.1.
  - Done when: all props flow correctly as per the prop flow map in design §6.

---

## Group 6 — Entry wiring

- [x] Task 16: Update `index.html`
  - File: `index.html`
  - Set `<title>Task Manager</title>`, ensure `<div id="root">` and `<script type="module" src="/src/main.jsx">` are present, `lang="en"` on `<html>`.
  - Done when: the file matches the template in design §7.6.

- [x] Task 17: Trim `src/main.jsx` to minimal wiring
  - File: `src/main.jsx`
  - Must import `StrictMode` from `react`, `createRoot` from `react-dom/client`, `App` from `./App.jsx`, and `./index.css`.
  - Renders `<StrictMode><App /></StrictMode>` into `document.getElementById('root')`.
  - Remove any scaffold boilerplate (counter, logo imports, etc.).
  - Done when: the file matches design §7.5 exactly.

---

## Group 7 — Smoke test

- [ ] Task 18: Verify `npm run dev` starts without errors
  - Run `npm run dev`.
  - Open the browser at the printed local URL.
  - Done when: the page loads without a blank screen or console errors and shows "Task Manager" heading.

- [ ] Task 19: Manual acceptance walkthrough
  - Add a task via Enter key → appears in list.
  - Add a task via the Add button → appears in list.
  - Toggle a task checkbox → line-through style applied; footer count decrements.
  - Delete a task → removed from all filter views.
  - Switch to Active filter → only incomplete tasks shown.
  - Switch to Completed filter → only completed tasks shown; empty state shows if none.
  - Hard-refresh the page → tasks still present; filter resets to All.
  - Done when: all nine success criteria from the proposal pass with zero console errors.

# Task Manager — Component & Architecture Design

## Purpose

Concrete implementation design for the Task Manager SPA. Translates the proposal and
spec into exact file paths, component contracts, hook internals, styling strategy, and
build configuration. This is the blueprint the `sdd-tasks` and `sdd-apply` phases
execute against.

**Non-negotiable constraints (from proposal):**

- React 18, functional components + hooks only.
- Tailwind CSS **v3** (not v4 — different PostCSS pipeline).
- Vite 5 scaffold.
- No external state library. State lives in a single `useTasks` hook.
- `localStorage` key: `"task-manager:tasks"`.

---

## 1. File Structure

Exact paths for every file created or modified. Root is the repository root
(`Testeo-OpenPencil/`).

```
Testeo-OpenPencil/
├── index.html                      # Vite entry HTML (modified from scaffold)
├── package.json                    # deps + scripts (from scaffold + Tailwind)
├── vite.config.js                  # Vite + React plugin (from scaffold)
├── postcss.config.js               # Tailwind v3 + autoprefixer (NEW)
├── tailwind.config.js              # content globs + theme (NEW)
├── .gitignore                      # from scaffold
└── src/
    ├── main.jsx                    # React root mount (from scaffold, trimmed)
    ├── index.css                   # Tailwind directives (replaces scaffold CSS)
    ├── App.jsx                     # Root composition — consumes useTasks
    ├── constants.js                # STORAGE_KEY, FILTERS, EMPTY_MESSAGES
    ├── hooks/
    │   └── useTasks.js             # All state + derived values + localStorage sync
    └── components/
        ├── TaskInput.jsx           # Controlled input + submit guard
        ├── FilterBar.jsx           # All / Active / Completed tabs
        ├── TaskList.jsx            # Filtered list OR empty state
        ├── TaskItem.jsx            # Single task row
        └── TaskFooter.jsx          # Active count indicator
```

**Files removed from the default Vite scaffold:** `src/App.css`, `src/assets/react.svg`,
`public/vite.svg` (unused; keeps the tree clean). `src/index.css` content is fully
replaced with Tailwind directives.

**Decision — plain `.js`/`.jsx`, no TypeScript.** The spec uses TS interfaces as
documentation, but the proposal pins JS. Interfaces below are JSDoc-documented contracts,
not compiled types. This keeps the scaffold to `npm create vite@latest -- --template react`
(not `react-ts`) and avoids a tsconfig surface the pipeline test does not need.

**Decision — a `constants.js` module.** Centralizes the storage key, the filter list, and
empty-state copy so the string `"task-manager:tasks"` and the filter values exist in
exactly one place. Prevents drift between `useTasks`, `FilterBar`, and `TaskList`.

---

## 2. Component Design

Each component is a pure functional component. Only `TaskInput` holds local state; every
other component is presentational and driven entirely by props.

### 2.1 `TaskInput.jsx`

**Contract (JSDoc):**

```js
/**
 * @param {{ onAdd: (text: string) => void }} props
 * onAdd receives a guaranteed non-empty, trimmed string.
 */
```

**Internal state:** `const [value, setValue] = useState('')` — the controlled input value.

**Guard responsibility:** trimming and empty/whitespace rejection live here. `onAdd` is
never called with an empty string.

**JSX outline:**

```
<form onSubmit={handleSubmit}>          // form → Enter key submits natively
  <input
    type="text"
    value={value}
    onChange={e => setValue(e.target.value)}
    placeholder="What needs to be done?"
    aria-label="New task"
  />
  <button type="submit">Add</button>
</form>
```

**Handler:**

```js
function handleSubmit(e) {
  e.preventDefault();               // stop native page reload
  const trimmed = value.trim();
  if (!trimmed) return;             // reject empty / whitespace-only
  onAdd(trimmed);
  setValue('');                     // clear on success only
}
```

Using a `<form>` with `type="submit"` covers BOTH acceptance paths (Enter key AND button
click) with a single handler — no separate `onKeyDown` needed. This is the correct
idiomatic approach: the browser already maps Enter-in-input and submit-button-click to the
form's submit event.

### 2.2 `FilterBar.jsx`

**Contract:**

```js
/**
 * @param {{ filter: 'all'|'active'|'completed',
 *           onFilterChange: (filter: string) => void }} props
 */
```

**Internal state:** none. Fully controlled by `filter` prop.

**JSX outline:** maps over `FILTERS` from `constants.js` (`['all', 'active', 'completed']`):

```
<div role="tablist">
  {FILTERS.map(f => (
    <button
      key={f}
      role="tab"
      aria-selected={filter === f}
      onClick={() => onFilterChange(f)}
      className={filter === f ? ACTIVE_TAB : INACTIVE_TAB}
    >
      {capitalize(f)}
    </button>
  ))}
</div>
```

Rendering from the constant guarantees exactly three controls (acceptance criterion #1)
and keeps labels in sync with the type.

### 2.3 `TaskList.jsx`

**Contract:**

```js
/**
 * @param {{ tasks: Task[],                       // already filtered by parent
 *           filter: 'all'|'active'|'completed',  // for the empty-state message
 *           onToggle: (id: string) => void,
 *           onDelete: (id: string) => void }} props
 */
```

**Design note — `filter` is passed in.** The spec's `TaskListProps` lists only
`tasks/onToggle/onDelete`, but the Empty State requirement mandates *contextual* messages
per filter. `TaskList` needs to know the active filter to pick the right message. Adding
`filter` to the props is the minimal, honest way to satisfy the contextual empty-state
requirement without `TaskList` reaching into global state. This is a deliberate, documented
extension of the spec's prop list, not scope creep.

**Internal state:** none.

**JSX outline (mutually exclusive branches — satisfies AC #3):**

```
tasks.length === 0
  ? <p className={EMPTY_STATE}>{EMPTY_MESSAGES[filter]}</p>
  : <ul>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
```

### 2.4 `TaskItem.jsx`

**Contract:**

```js
/**
 * @param {{ task: Task,
 *           onToggle: (id: string) => void,
 *           onDelete: (id: string) => void }} props
 */
```

**Internal state:** none.

**JSX outline:**

```
<li className={ROW}>
  <input
    type="checkbox"
    checked={task.completed}
    onChange={() => onToggle(task.id)}
    aria-label={`Mark "${task.text}" as ${task.completed ? 'active' : 'completed'}`}
  />
  <span className={task.completed ? TEXT_DONE : TEXT_ACTIVE}>
    {task.text}
  </span>
  <button
    onClick={() => onDelete(task.id)}
    aria-label={`Delete "${task.text}"`}
  >
    ✕
  </button>
</li>
```

`checked` (not `defaultChecked`) + `onChange` makes it a controlled checkbox reflecting
`task.completed` at all times (AC #1).

### 2.5 `TaskFooter.jsx`

**Contract:**

```js
/**
 * @param {{ activeCount: number }} props
 */
```

**Internal state:** none.

**Pluralization:**

```js
const label = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;
```

Covers `0 items left`, `1 item left`, `N items left` (all three ACs) with one expression.

**JSX outline:**

```
<footer className={FOOTER}>
  <span>{label}</span>
</footer>
```

---

## 3. `useTasks` Hook Internals

Single source of truth for all state. Lives at `src/hooks/useTasks.js`.

### 3.1 State shape

```js
const [tasks, setTasks]   = useState(loadTasks);   // Task[] — lazy initializer
const [filter, setFilter] = useState('all');       // never persisted
```

**Lazy initializer** (`useState(loadTasks)`, passing the function reference, NOT
`useState(loadTasks())`): the `localStorage` read runs exactly once on mount, before first
render — never on re-renders. This satisfies the "read once on mount" contract cleanly and
is the correct React idiom for expensive/side-effectful initial state.

### 3.2 Load helper (module scope)

```js
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];        // wrong shape → []
    return parsed.filter(isValidTask);            // drop malformed entries
  } catch {
    return [];                                    // malformed JSON or no storage → []
  }
}

function isValidTask(t) {
  return t
    && typeof t.id === 'string'
    && typeof t.text === 'string'
    && typeof t.completed === 'boolean';
}
```

Covers every persistence edge case in the spec: absent key → `[]`, invalid JSON → `[]`,
valid-JSON-wrong-shape (`{}`) → `[]`, and defensively drops any individual malformed task
object. Never throws.

### 3.3 localStorage write sync (useEffect pattern)

```js
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* quota exceeded / storage unavailable — keep in-memory state, do not crash */
  }
}, [tasks]);
```

Dependency array `[tasks]` → the write fires after every `tasks` change and after the
initial mount. `filter` is intentionally absent from the dependency array, so changing the
filter never triggers a write (satisfies "filter is not persisted"). The `try/catch`
silently swallows write failures.

### 3.4 Actions

All use functional `setState` updaters for correctness under batching, and immutable
updates so React detects the change.

```js
const addTask = useCallback((text) => {
  setTasks(prev => [
    ...prev,
    { id: crypto.randomUUID(), text, completed: false },   // appended to end
  ]);
}, []);

const toggleTask = useCallback((id) => {
  setTasks(prev => prev.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t     // flip only target; order kept
  ));
}, []);

const deleteTask = useCallback((id) => {
  setTasks(prev => prev.filter(t => t.id !== id));          // no-op if id absent
}, []);
```

`addTask` receives already-trimmed, non-empty text (guard is in `TaskInput`). `toggleTask`
preserves list order (`.map` keeps position) and all other fields (`...t` spread).
`deleteTask` is a pure filter — naturally a no-op when the id is not found.

`useCallback` gives stable identities so `TaskItem`/`FilterBar` props don't change on every
render — cheap correctness hygiene, not premature optimization.

### 3.5 Derived values (never stored)

```js
const filteredTasks = useMemo(() => {
  switch (filter) {
    case 'active':    return tasks.filter(t => !t.completed);
    case 'completed': return tasks.filter(t =>  t.completed);
    default:          return tasks;                 // 'all'
  }
}, [tasks, filter]);

const activeCount = useMemo(
  () => tasks.filter(t => !t.completed).length,
  [tasks]
);
```

`filteredTasks` and `activeCount` are ALWAYS derived — never duplicated into state. This is
the key correctness decision: a single mutation to `tasks` automatically produces a correct
filtered view and a correct count, with no possibility of them drifting out of sync.
`useMemo` avoids recomputing on unrelated renders.

### 3.6 Return shape

```js
return {
  tasks, filter, filteredTasks, activeCount,
  addTask, toggleTask, deleteTask, setFilter,
};
```

Matches the spec's `UseTasksReturn` exactly.

---

## 4. Tailwind Strategy

Utility classes only — no custom CSS beyond the three `@tailwind` directives. Class strings
referenced above (`ACTIVE_TAB`, `ROW`, etc.) resolve to these. They can live inline in JSX;
named here for design clarity.

### 4.1 App shell / layout

| Element | Classes |
|---|---|
| Page background | `min-h-screen bg-slate-100 text-slate-800` |
| Centered card | `max-w-md mx-auto mt-10 bg-white rounded-lg shadow p-6` |
| Heading | `text-2xl font-bold mb-4 text-center` |

### 4.2 Input (`TaskInput`)

| Element | Classes |
|---|---|
| Form | `flex gap-2 mb-4` |
| Text input | `flex-1 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500` |
| Submit button | `bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 active:bg-blue-800` |

### 4.3 Filter tabs (`FilterBar`)

| Element | Classes |
|---|---|
| Tab container | `flex gap-1 mb-4 justify-center` |
| Active tab (`ACTIVE_TAB`) | `px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white` |
| Inactive tab (`INACTIVE_TAB`) | `px-3 py-1 rounded text-sm font-medium text-slate-600 hover:bg-slate-200` |

### 4.4 Task row (`TaskItem`)

| Element | Classes |
|---|---|
| Row (`ROW`) | `flex items-center gap-3 py-2 border-b border-slate-100 group` |
| Checkbox | `h-4 w-4 accent-blue-600 cursor-pointer` |
| Active text (`TEXT_ACTIVE`) | `flex-1 text-slate-800` |
| Completed text (`TEXT_DONE`) | `flex-1 line-through text-slate-400` |
| Delete button | `text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity` |

`TEXT_DONE` provides the required completed visual state (`line-through` + muted color).
The delete button reveals on row hover via `group` / `group-hover` — pure Tailwind, no
custom transitions beyond the built-in `transition-opacity` utility (proposal allows
"transitions Tailwind provides out of the box").

### 4.5 List & empty state (`TaskList`)

| Element | Classes |
|---|---|
| List (`<ul>`) | `divide-y divide-slate-100` |
| Empty state (`EMPTY_STATE`) | `text-center text-slate-400 py-8 text-sm` |

### 4.6 Footer (`TaskFooter`)

| Element | Classes |
|---|---|
| Footer (`FOOTER`) | `mt-4 pt-3 border-t border-slate-100 text-sm text-slate-500 text-center` |

---

## 5. ID Generation Strategy

```js
{ id: crypto.randomUUID(), text, completed: false }
```

- `crypto.randomUUID()` is native in all modern evergreen browsers over `http://localhost`
  and any secure context — exactly the proposal's browser target. No dependency, no
  polyfill.
- Produces an RFC 4122 v4 UUID string — collision-free for the session-uniqueness
  requirement (spec Business Rule 5).
- Used only inside `addTask` in `useTasks`. No fallback to `Date.now()` is needed given the
  stated browser target; adding one would be dead code.

---

## 6. `App.jsx` Composition

`App` is the ONLY consumer of `useTasks`. It destructures the hook and distributes props
downward. No child touches `localStorage` or global state directly.

```jsx
import { useTasks } from './hooks/useTasks';
import TaskInput from './components/TaskInput';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import TaskFooter from './components/TaskFooter';

export default function App() {
  const {
    filter, filteredTasks, activeCount,
    addTask, toggleTask, deleteTask, setFilter,
  } = useTasks();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Task Manager</h1>

        <TaskInput onAdd={addTask} />
        <FilterBar filter={filter} onFilterChange={setFilter} />
        <TaskList
          tasks={filteredTasks}
          filter={filter}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
        <TaskFooter activeCount={activeCount} />
      </main>
    </div>
  );
}
```

**Prop flow map:**

| From | Prop | To | Backing |
|---|---|---|---|
| `App` | `onAdd` | `TaskInput` | `useTasks.addTask` |
| `App` | `filter`, `onFilterChange` | `FilterBar` | `useTasks.filter`, `useTasks.setFilter` |
| `App` | `tasks` (=`filteredTasks`), `filter`, `onToggle`, `onDelete` | `TaskList` | `useTasks` derived + actions |
| `TaskList` | `task`, `onToggle`, `onDelete` | `TaskItem` | forwarded |
| `App` | `activeCount` | `TaskFooter` | `useTasks.activeCount` |

Note `TaskList` receives `filteredTasks` under the prop name `tasks` — it renders whatever
list it is given and stays filter-agnostic except for choosing the empty-state message.

---

## 7. Vite + Tailwind v3 Configuration

### 7.1 Scaffold command

```bash
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p          # generates tailwind.config.js + postcss.config.js
```

**Pinning `tailwindcss@3` is mandatory.** Tailwind v4 changed the setup to a Vite plugin
(`@tailwindcss/vite`) and dropped the `postcss.config.js` + `init -p` flow. Installing v4
against this v3 config would break the build silently. The `@3` pin is the single most
important config decision in this section.

### 7.2 `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

The `content` globs MUST cover `index.html` and every `.jsx` under `src/`, or Tailwind's
JIT purge strips the utility classes and the UI renders unstyled. This is the most common
Tailwind-v3 setup failure — the globs above are the known-good pattern for a Vite React app.

> If the scaffold produced `"type": "module"` in `package.json` (Vite default), use the
> `export default` form above. If not, use `module.exports = { ... }`. The `init -p` command
> emits the correct form automatically; only edit the `content` array.

### 7.3 `postcss.config.js`

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

This is the Tailwind **v3** PostCSS pipeline. (Under v4 this would instead be
`'@tailwindcss/postcss'` — do not use that here.)

### 7.4 `src/index.css`

Replace the entire scaffold content with the three directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 7.5 `src/main.jsx`

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`StrictMode` double-invokes effects in dev. The `useTasks` write effect is idempotent
(writes the same serialized `tasks`), so StrictMode is safe here — no duplicate-write bug.

### 7.6 `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Task Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 7.7 `constants.js`

```js
export const STORAGE_KEY = 'task-manager:tasks';

export const FILTERS = ['all', 'active', 'completed'];

export const EMPTY_MESSAGES = {
  all:       'No tasks yet. Add one above!',
  active:    'No active tasks.',
  completed: 'No completed tasks yet.',
};
```

Exact strings from the spec's Empty State requirement. `STORAGE_KEY` is the single
definition of the persistence key.

---

## 8. Data Flow Diagram

```
                        ┌──────────────────────────────────────────────┐
                        │                   useTasks                     │
                        │                                                │
                        │  state: tasks[], filter                        │
                        │  derived (useMemo): filteredTasks, activeCount │
                        │  actions: addTask, toggleTask, deleteTask,     │
                        │           setFilter                            │
                        └───────────────▲───────────────┬───────────────┘
                                        │ actions        │ state + derived
                                        │ (callbacks)    │ (props)
                        ┌───────────────┴───────────────▼───────────────┐
                        │                     App                        │
                        └───┬──────────┬──────────────┬──────────────┬──┘
                            │          │              │              │
              onAdd ────────▼     onFilterChange▼   tasks/onToggle/  ▼ activeCount
                     ┌──────────┐  ┌──────────┐  onDelete┌────────┐ ┌──────────┐
                     │TaskInput │  │FilterBar │      ────▶│TaskList│ │TaskFooter│
                     └──────────┘  └──────────┘          └───┬────┘ └──────────┘
                                                             │ task/onToggle/onDelete
                                                        ┌────▼─────┐
                                                        │ TaskItem │ (×N)
                                                        └──────────┘

USER ACTION → STATE UPDATE → RENDER CYCLE (example: toggle a task)

 1. User clicks checkbox in TaskItem
         │
         ▼
 2. TaskItem calls onToggle(task.id)   ── forwarded from TaskList ── from App ── = useTasks.toggleTask
         │
         ▼
 3. toggleTask: setTasks(prev => prev.map(flip completed on match))   [immutable update]
         │
         ▼
 4. React re-renders useTasks consumer (App):
        • filteredTasks recomputed via useMemo (tasks changed)
        • activeCount   recomputed via useMemo (tasks changed)
         │
         ▼
 5. useEffect([tasks]) fires → localStorage.setItem("task-manager:tasks", JSON) [try/catch]
         │
         ▼
 6. App passes new filteredTasks → TaskList, new activeCount → TaskFooter
         │
         ▼
 7. DOM updates: row shows line-through, footer count decrements
    (filter unchanged throughout — a toggled task may drop out of the
     'active' view, but `filter` state is never touched)
```

**Add and delete follow the same loop:** action → immutable `setTasks` → memo recompute →
effect persists → re-render. The filter never changes as a side effect of add/toggle/delete
(spec Business Rule 2). `setFilter` is the only path that changes `filter`, and it does NOT
trigger the persistence effect (dependency array is `[tasks]` only).

---

## 9. Spec Traceability

| Spec requirement | Design element |
|---|---|
| Task Creation (trim, append, uuid, clear) | §2.1 `TaskInput` guard + §3.4 `addTask` |
| Task Completion Toggle (flip, keep order/filter) | §3.4 `toggleTask` (`.map`, `...t`) |
| Task Deletion | §3.4 `deleteTask` (`.filter`) |
| Filter Visibility (derived, not persisted) | §3.5 `filteredTasks` useMemo + §3.3 effect dep `[tasks]` |
| Empty State (contextual) | §2.3 `TaskList` branch + §7.7 `EMPTY_MESSAGES` |
| Active Task Count (pluralization) | §2.5 `TaskFooter` + §3.5 `activeCount` |
| localStorage Persistence (read-once, safe fallback, safe write) | §3.1 lazy init + §3.2 `loadTasks` + §3.3 effect |
| Filter resets on reload | §3.1 `useState('all')`, never read from storage |
| ID uniqueness | §5 `crypto.randomUUID()` |
| No component touches localStorage | §6 — only `useTasks` does |

---

## 10. Risks & Mitigations (design-level)

| Risk | Mitigation in design |
|---|---|
| Tailwind v4 installed instead of v3 | §7.1 explicit `tailwindcss@3` pin + §7.3 v3 PostCSS pipeline noted |
| Unstyled UI from wrong `content` globs | §7.2 known-good glob pattern documented as mandatory |
| `filter` accidentally persisted | §3.3 effect dependency array is `[tasks]` only — documented rationale |
| StrictMode double-write in dev | §7.5 effect is idempotent — noted as safe |
| Count/filter drift from duplicated state | §3.5 both are `useMemo`-derived, never stored |

---

## Next Recommended Phase

`sdd-tasks` — break this design into an ordered, dependency-aware task list: scaffold →
config → constants/hook → presentational components → App composition → manual verification
against the success criteria.

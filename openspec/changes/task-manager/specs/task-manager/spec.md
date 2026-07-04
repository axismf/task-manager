# Task Manager Specification

## Purpose

Define the complete functional behavior of the Task Manager SPA: task creation, completion, deletion, filtering, persistence, and edge cases. This spec is the source of truth for implementation and verification.

---

## Domains Covered

- `TaskInput` component
- `TaskList` component
- `TaskItem` component
- `FilterBar` component
- `TaskFooter` component
- `useTasks` hook
- `localStorage` contract
- Business rules and edge cases

---

## Data Model

### Task

```ts
interface Task {
  id: string;        // client-generated, unique within session
  text: string;      // non-empty, trimmed
  completed: boolean;
}
```

### Filter

```ts
type Filter = 'all' | 'active' | 'completed';
```

### App State (managed inside `useTasks`)

```ts
interface TaskState {
  tasks: Task[];
  filter: Filter;
}
```

---

## Requirements

---

### Requirement: Task Creation

The system MUST add a new task to the task list when the user submits a non-empty text value via the input field.

- The submitted text MUST be trimmed of leading and trailing whitespace before being stored.
- After a successful add, the input field MUST be cleared.
- The new task MUST be appended to the end of the task list.
- The new task MUST have `completed: false` on creation.
- The new task MUST have a unique `id` generated via `crypto.randomUUID()`.

#### Scenario: Add a task via Enter key

- GIVEN the input field is focused and contains "Buy milk"
- WHEN the user presses Enter
- THEN a task with `text: "Buy milk"` and `completed: false` is appended to the list
- AND the input field is cleared

#### Scenario: Add a task via submit button

- GIVEN the input field contains "Buy milk"
- WHEN the user clicks the submit button
- THEN a task with `text: "Buy milk"` and `completed: false` is appended to the list
- AND the input field is cleared

#### Scenario: Whitespace-only input is rejected

- GIVEN the input field contains "   " (spaces only)
- WHEN the user presses Enter or clicks submit
- THEN no task is added to the list
- AND no error message is displayed
- AND the input field is cleared (or left as-is — either is acceptable; the key constraint is no task added)

#### Scenario: Empty input is rejected

- GIVEN the input field is empty
- WHEN the user presses Enter or clicks submit
- THEN no task is added to the list
- AND no error message is displayed

---

### Requirement: Task Completion Toggle

The system MUST toggle the `completed` field of a task when the user activates its completion control (checkbox or equivalent).

- The `completed` value MUST flip from `false` to `true`, or from `true` to `false`.
- Toggling MUST NOT change the active filter.
- Toggling MUST NOT reorder the task in the list.

#### Scenario: Mark an active task as completed

- GIVEN a task with `completed: false` is visible in the list
- WHEN the user clicks its checkbox
- THEN the task's `completed` becomes `true`
- AND the task receives a visual "completed" style (e.g., line-through text)
- AND the active filter remains unchanged

#### Scenario: Unmark a completed task

- GIVEN a task with `completed: true` is visible in the list
- WHEN the user clicks its checkbox
- THEN the task's `completed` becomes `false`
- AND the completed visual style is removed
- AND the active filter remains unchanged

---

### Requirement: Task Deletion

The system MUST permanently remove a task from the list when the user activates its delete control.

- Deletion MUST NOT affect any other task.
- Deletion MUST NOT change the active filter.
- After deletion, the task MUST NOT appear in any filter view.

#### Scenario: Delete a task

- GIVEN one or more tasks are in the list
- WHEN the user clicks the delete button on a specific task
- THEN that task is removed from `tasks`
- AND it no longer renders in any filter view
- AND the active filter remains unchanged

---

### Requirement: Filter Visibility

The system MUST render only the tasks that match the active filter, without mutating the underlying task list.

| Filter | Tasks shown |
|--------|-------------|
| `all` | All tasks regardless of `completed` |
| `active` | Only tasks where `completed === false` |
| `completed` | Only tasks where `completed === true` |

- Filter state MUST reset to `'all'` on page reload.
- The filter MUST NOT be persisted to `localStorage`.
- Changing the filter MUST NOT mutate `tasks`.

#### Scenario: All filter shows every task

- GIVEN tasks include both completed and active items
- WHEN the active filter is `'all'`
- THEN all tasks are rendered

#### Scenario: Active filter shows only incomplete tasks

- GIVEN tasks include both completed and active items
- WHEN the user selects "Active"
- THEN only tasks with `completed === false` are rendered

#### Scenario: Completed filter shows only done tasks

- GIVEN tasks include both completed and active items
- WHEN the user selects "Completed"
- THEN only tasks with `completed === true` are rendered

#### Scenario: Filter resets on page reload

- GIVEN the user had "Active" selected
- WHEN the page is hard-refreshed
- THEN the active filter is `'all'`

---

### Requirement: Empty State

The system MUST display a contextual empty-state message when the filtered task list is empty.

- The message MUST be visible within the task list area.
- The message content SHOULD reflect the active filter:
  - `'all'`: "No tasks yet. Add one above!"
  - `'active'`: "No active tasks."
  - `'completed'`: "No completed tasks yet."
- The empty state MUST NOT block access to the input or filter controls.

#### Scenario: Empty list on first load

- GIVEN `localStorage` has no saved tasks
- WHEN the page loads
- THEN the empty state message for `'all'` is displayed

#### Scenario: Empty filtered list

- GIVEN there are tasks but none match the active filter
- WHEN the user switches to a non-matching filter (e.g., "Completed" with no completed tasks)
- THEN the empty state message for that filter is displayed
- AND the input and FilterBar remain interactive

---

### Requirement: Active Task Count

The system MUST display the count of tasks where `completed === false`.

- The count MUST update immediately whenever a task is added, deleted, or toggled.
- The count MUST reflect all tasks, regardless of the active filter.
- The label MUST use singular/plural correctly: "1 item left" vs "N items left".

#### Scenario: Count reflects active tasks only

- GIVEN 3 tasks total, 1 completed
- WHEN the footer renders
- THEN it displays "2 items left"

#### Scenario: Count updates on toggle

- GIVEN "2 items left" is displayed
- WHEN the user marks one active task as completed
- THEN the count updates to "1 item left"

#### Scenario: Singular label at one item

- GIVEN exactly 1 active task remains
- THEN the footer displays "1 item left" (not "1 items left")

---

### Requirement: localStorage Persistence

The system MUST persist the task list to `localStorage` on every state change and rehydrate it on mount.

- The storage key MUST be `"task-manager:tasks"`.
- The stored value MUST be a JSON-serialized `Task[]` array.
- On mount, the system MUST read and parse the value; if absent or malformed, it MUST fall back to `[]` without throwing.
- `localStorage` write failures (e.g., quota exceeded) MUST be caught and silently ignored — the app MUST remain functional with in-memory state.
- Only `tasks` is persisted; `filter` is NOT persisted.

#### Scenario: Tasks survive hard refresh

- GIVEN the user has added tasks
- WHEN the page is hard-refreshed
- THEN the same tasks are present on reload

#### Scenario: Malformed localStorage value is ignored

- GIVEN `localStorage["task-manager:tasks"]` contains `"not valid json"`
- WHEN the app mounts
- THEN the task list initializes as `[]`
- AND no error is thrown or shown

#### Scenario: Missing localStorage key falls back to empty

- GIVEN `localStorage` has no `"task-manager:tasks"` key
- WHEN the app mounts
- THEN the task list initializes as `[]`

#### Scenario: Write failure is silent

- GIVEN `localStorage.setItem` throws (quota exceeded)
- WHEN a task is added
- THEN the task is visible in the UI (in-memory state is intact)
- AND no error message or crash occurs

---

## Component Specifications

---

### Component: `TaskInput`

#### Purpose

Controlled text input + submit mechanism for adding new tasks.

#### Props

```ts
interface TaskInputProps {
  onAdd: (text: string) => void;
}
```

- `onAdd` is called with the trimmed input text when the user submits.
- `TaskInput` is responsible for trimming and rejecting empty/whitespace values before calling `onAdd`. `onAdd` receives a guaranteed non-empty, trimmed string.
- `TaskInput` owns its own controlled input state (`value`, `onChange`).

#### Behavior

- Renders a text `<input>` and a submit `<button>`.
- Submits on Enter keydown or button click.
- Clears the input on successful submit.
- Does NOT call `onAdd` for empty or whitespace-only values.

#### Acceptance Criteria

1. Enter key on non-empty input calls `onAdd` with trimmed text and clears the field.
2. Submit button on non-empty input calls `onAdd` with trimmed text and clears the field.
3. Enter key on empty or whitespace-only input does not call `onAdd`.
4. Submit button on empty or whitespace-only input does not call `onAdd`.

---

### Component: `TaskList`

#### Purpose

Renders the filtered list of tasks, or the empty state when the list is empty.

#### Props

```ts
interface TaskListProps {
  tasks: Task[];           // already-filtered list from parent
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
```

#### Behavior

- Renders one `TaskItem` per task in `tasks`.
- When `tasks` is empty, renders the empty state message.
- Passes `onToggle` and `onDelete` down to each `TaskItem`.

#### Acceptance Criteria

1. Renders exactly `tasks.length` `TaskItem` elements when `tasks` is non-empty.
2. Renders the empty state message when `tasks.length === 0`.
3. Does not render both `TaskItem` elements and the empty state simultaneously.

---

### Component: `TaskItem`

#### Purpose

Renders a single task row: completion checkbox, task text, and delete button.

#### Props

```ts
interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
```

#### Behavior

- Renders a checkbox reflecting `task.completed`.
- Renders the task `text`; applies a visual completed style (e.g., `line-through`, muted color) when `task.completed === true`.
- Clicking the checkbox calls `onToggle(task.id)`.
- Clicking the delete button calls `onDelete(task.id)`.

#### Acceptance Criteria

1. Checkbox is checked when `task.completed === true`; unchecked when `false`.
2. Task text has a line-through style when `task.completed === true`.
3. Clicking the checkbox calls `onToggle` with the task's `id`.
4. Clicking the delete button calls `onDelete` with the task's `id`.

---

### Component: `FilterBar`

#### Purpose

Renders the All / Active / Completed filter controls and communicates selection to the parent.

#### Props

```ts
interface FilterBarProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}
```

#### Behavior

- Renders three controls, one per filter value: `'all'`, `'active'`, `'completed'`.
- The control matching `filter` MUST be visually marked as active/selected.
- Clicking a control calls `onFilterChange` with the corresponding filter value.

#### Acceptance Criteria

1. Exactly three controls are rendered.
2. The control matching the current `filter` prop has an active visual state.
3. Clicking a non-active control calls `onFilterChange` with the correct filter value.
4. Clicking the already-active control MAY call `onFilterChange` with the same value (idempotent) — this is not an error.

---

### Component: `TaskFooter`

#### Purpose

Displays the count of active (incomplete) tasks.

#### Props

```ts
interface TaskFooterProps {
  activeCount: number;
}
```

#### Behavior

- Renders "N items left" for `activeCount !== 1`.
- Renders "1 item left" for `activeCount === 1`.
- Renders "0 items left" for `activeCount === 0`.

#### Acceptance Criteria

1. Displays "1 item left" when `activeCount === 1`.
2. Displays "N items left" for any `N !== 1`.
3. Displays "0 items left" when `activeCount === 0`.

---

### Hook: `useTasks`

#### Purpose

Encapsulates all task state, filter state, derived values, and `localStorage` synchronization.

#### Returned Shape

```ts
interface UseTasksReturn {
  tasks: Task[];          // full, unfiltered task list
  filter: Filter;         // current active filter
  filteredTasks: Task[];  // derived: tasks filtered by `filter`
  activeCount: number;    // derived: tasks.filter(t => !t.completed).length
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setFilter: (filter: Filter) => void;
}
```

#### Behavior

- `addTask(text)`: appends `{ id: crypto.randomUUID(), text, completed: false }`. Called with guaranteed non-empty, trimmed text (guard is in `TaskInput`).
- `toggleTask(id)`: flips `completed` on the matching task; no-op if `id` not found.
- `deleteTask(id)`: removes the task with matching `id`; no-op if not found.
- `setFilter(filter)`: updates `filter` state.
- `filteredTasks` is always derived from `tasks` and `filter` — never stored separately.
- `activeCount` is always derived from `tasks` — never stored separately.
- On mount, reads `"task-manager:tasks"` from `localStorage`; initializes `tasks` from parsed value or `[]`.
- On every `tasks` change, writes the current `tasks` to `localStorage` under `"task-manager:tasks"`, wrapped in try/catch.

#### Acceptance Criteria

1. `filteredTasks` returns all tasks when `filter === 'all'`.
2. `filteredTasks` returns only `completed === false` tasks when `filter === 'active'`.
3. `filteredTasks` returns only `completed === true` tasks when `filter === 'completed'`.
4. `activeCount` equals `tasks.filter(t => !t.completed).length` at all times.
5. `addTask` appends a new task with `completed: false` and a unique `id`.
6. `toggleTask` flips `completed`; all other fields are unchanged.
7. `deleteTask` removes exactly the targeted task; all others are unchanged.
8. On mount, if `localStorage` is empty or malformed, `tasks` initializes to `[]`.
9. On every `tasks` update, the new value is written to `localStorage`; exceptions are caught and suppressed.
10. `filter` initializes to `'all'` and is not read from or written to `localStorage`.

---

## localStorage Contract

| Property | Value |
|----------|-------|
| Key | `"task-manager:tasks"` |
| Type | JSON string |
| Schema | `Task[]` — array of `{ id: string, text: string, completed: boolean }` |
| Written | After every `tasks` state change (inside a `useEffect` or equivalent) |
| Read | Once, on component mount, before first render |
| On parse error | Silently fall back to `[]`; do not log, do not throw |
| On write error | Silently swallow the exception; do not log, do not throw |
| Filter persisted | No — filter is always `'all'` on fresh load |

---

## Edge Cases

| Case | Expected Behavior |
|------|------------------|
| Input is empty string | `TaskInput` does not call `onAdd`; no task added |
| Input is whitespace only (`"   "`) | `TaskInput` does not call `onAdd`; no task added |
| `localStorage` key absent on mount | `tasks` initializes to `[]` |
| `localStorage` value is not valid JSON | `tasks` initializes to `[]` |
| `localStorage` value is valid JSON but wrong shape (e.g., `{}`) | `tasks` initializes to `[]` |
| `localStorage.setItem` throws | Exception caught silently; in-memory state is preserved |
| All tasks are completed, filter is `'active'` | Empty state message is shown; input and FilterBar are interactive |
| All tasks are active, filter is `'completed'` | Empty state message is shown |
| Task list is empty, filter is `'all'` | Empty state message is shown |
| User toggles a task while on `'active'` filter | Task disappears from the visible list (no longer matches filter); filter does not change |
| User deletes the last visible task on a filter | Empty state for that filter is shown; filter does not change |
| `activeCount` is 0 | Footer displays "0 items left" |
| `activeCount` is 1 | Footer displays "1 item left" (singular) |

---

## Rendering Rules per Filter State

| Filter | `filteredTasks` contents | Empty state shown? |
|--------|--------------------------|--------------------|
| `'all'` | Every task in `tasks` | When `tasks.length === 0` |
| `'active'` | Tasks where `completed === false` | When no active tasks exist |
| `'completed'` | Tasks where `completed === true` | When no completed tasks exist |

The empty state message content SHOULD be contextual (see Requirement: Empty State).

---

## Component Composition

```
App
├── TaskInput          (onAdd → useTasks.addTask)
├── FilterBar          (filter, onFilterChange → useTasks.setFilter)
├── TaskList           (tasks=filteredTasks, onToggle, onDelete)
│   └── TaskItem[]     (task, onToggle, onDelete)
└── TaskFooter         (activeCount)
```

`App` consumes `useTasks` and distributes props downward. No component accesses `localStorage` directly — that is exclusively `useTasks`'s responsibility.

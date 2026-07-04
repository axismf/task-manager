# Proposal: Task Manager Application

## Metadata

| Field | Value |
|---|---|
| Change | `task-manager` |
| Status | `proposed` |
| Artifact store | `openspec` |
| Date | 2026-07-04 |

---

## Intent

Build a minimal, local-only Task Manager application to validate the full design-to-code-to-deploy workflow using OpenPencil and Gentle AI. The app is a self-contained frontend SPA — no backend, no auth, no cloud dependency.

The primary purpose of this change is **workflow validation**: proving that the SDD pipeline (explore → propose → spec → design → tasks → apply → verify → archive) produces a working, deployable React application with no manual corrections.

---

## Problem Statement

The OpenPencil + Gentle AI SDD pipeline needs a real, end-to-end test case. A Task Manager is the canonical minimal CRUD app: it exercises component composition, local state management, filtering logic, and browser persistence — enough complexity to stress the pipeline without introducing backend noise.

---

## Target Users

| User | Context |
|---|---|
| Developer / QA (pipeline validation) | Runs `npm run dev`, exercises all features manually, confirms the workflow produced correct output |
| End user (demo) | Manages a personal task list in the browser; no account, no sync |

---

## Scope

### In scope (first slice — all features ship together)

- **Task creation**: text input + Enter key (or submit button) adds a task to the list.
- **Task completion**: checkbox or click toggles a task between active and completed.
- **Task deletion**: a delete control removes a task permanently from the list.
- **Filtering**: tab/button group — All | Active | Completed — filters the visible list without mutating state.
- **Persistence**: tasks are saved to `localStorage` and rehydrated on page load; the app survives hard refresh.
- **Empty states**: friendly message when the filtered list is empty (e.g., "No active tasks yet").
- **Task count indicator**: shows how many active (incomplete) tasks remain.

### Non-goals (explicitly excluded)

- No backend, API, or cloud storage.
- No authentication or user accounts.
- No multi-user or shared lists.
- No drag-and-drop reordering.
- No due dates, priorities, labels, or subtasks.
- No animations or transitions beyond what Tailwind provides out of the box.
- No external state management library (Zustand, Redux, Jotai, etc.).
- No routing — single view only.
- No SSR or static export; local dev server only.

---

## Tech Constraints

| Concern | Decision |
|---|---|
| Framework | React 18 (functional components, hooks only) |
| Build tool | Vite 5 |
| Styling | Tailwind CSS v3 |
| State | `useState` / `useReducer` only — no external library |
| Persistence | `localStorage` via a custom `useTasks` hook |
| Node target | Current LTS (≥ 20) |
| Browser target | Modern evergreen — no IE, no polyfills |

---

## Architecture Overview

```
src/
├── App.jsx                  # Root component — composes layout
├── hooks/
│   └── useTasks.js          # Task state + localStorage sync
├── components/
│   ├── TaskInput.jsx         # Controlled input + submit handler
│   ├── TaskList.jsx          # Renders filtered task items
│   ├── TaskItem.jsx          # Single task row: checkbox, label, delete
│   ├── FilterBar.jsx         # All / Active / Completed tabs
│   └── TaskFooter.jsx        # Active count + (optional) clear-completed
└── main.jsx                 # Vite entry point
```

**State shape:**

```js
// Single task
{ id: string, text: string, completed: boolean }

// App state
{ tasks: Task[], filter: 'all' | 'active' | 'completed' }
```

**Persistence contract:**
- On every state change, serialize `tasks` to `localStorage` under key `"task-manager:tasks"`.
- On mount, read and parse the key; fall back to `[]` on missing or malformed data — never throw.

---

## Affected Areas

| Area | Impact |
|---|---|
| Repository root | New Vite project scaffolded under `Testeo-OpenPencil/` |
| `src/` | All new files — no existing code is modified |
| `package.json` | New dependencies: `react`, `react-dom`, `vite`, `tailwindcss`, `autoprefixer`, `postcss` |
| `openspec/changes/task-manager/` | SDD artifact trail (this proposal + downstream specs/design/tasks) |

No existing files in the repository are modified by this change.

---

## Business Rules

1. A task with an empty or whitespace-only text value must be rejected silently (no error shown, input cleared or left as-is).
2. Completing or deleting a task never changes the active filter — the user stays on the current view.
3. Persistence is best-effort: a `localStorage` write failure (e.g., quota exceeded) must not crash the app.
4. The filter is not persisted — it resets to "All" on page refresh (simplest correct behavior; scope for later if needed).
5. Task IDs are generated client-side (e.g., `crypto.randomUUID()` or `Date.now().toString()`); uniqueness within a session is sufficient.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Tailwind v3 PostCSS config drift between Vite 5 scaffolding and manual setup | Low | Pin config to known-good Vite + Tailwind v3 template during design phase |
| `localStorage` unavailable (private browsing, quota) | Low | Wrap reads/writes in try/catch; degrade to in-memory only |
| Over-engineering state (reaching for useReducer prematurely) | Low | Start with `useState`; switch to `useReducer` only if state transitions become complex |
| Pipeline validation reveals SDD gaps, not app bugs | Medium | Treat any mismatch as pipeline feedback, not app rework — document in verify report |

---

## Rollback

This change creates only new files in a test repository. Rollback = delete the scaffolded project files. No existing code, data, or infrastructure is affected.

---

## Success Criteria

| Criterion | How to verify |
|---|---|
| `npm run dev` starts without errors | Manual run + browser opens |
| User can add a task via input + Enter | Manual interaction |
| User can mark a task as completed | Checkbox toggles; visual style changes |
| User can delete a task | Delete button removes item from list |
| All / Active / Completed filters work correctly | Manual filter switching; counts match |
| State persists across hard refresh | Add tasks → refresh → tasks still present |
| Empty state shown when filtered list is empty | Switch to "Completed" with no completed tasks |
| No console errors during normal use | Browser devtools |
| SDD pipeline artifacts are complete and consistent | `sdd-verify` phase passes all acceptance criteria |

---

## Assumptions

1. The repository (`Testeo-OpenPencil`) is an empty or near-empty workspace dedicated to this pipeline test — scaffolding a new Vite project at its root is safe.
2. Node.js ≥ 20 and npm are available in the local environment.
3. The filter-reset-on-refresh behavior (Rule 4) is acceptable for this scope; if the parent needs persistence, that is a follow-up task.
4. No existing `package.json` conflicts with the new Vite scaffold.

---

## Next Recommended Phase

`sdd-spec` — translate this proposal into a concrete functional specification with acceptance criteria per component and per business rule.

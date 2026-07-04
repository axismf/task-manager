# Task Manager

A minimal React Task Manager built through a **structured AI orchestration pipeline** — proving that disciplined engineering practices amplify AI capabilities, not replace them.

> **The interesting part isn't the app. It's how it was built.**

---

## What This Demonstrates

| Concept | How It's Applied |
|---------|-----------------|
| Requirements Engineering | 28 acceptance criteria, Given/When/Then scenarios, edge case matrix |
| Derived State | `filteredTasks` and `activeCount` always computed, never stored |
| Defensive Programming | Every `localStorage` failure degrades gracefully to `[]` |
| Traceability | Every implementation artifact traces to a spec requirement |
| AI Orchestration | Agent harness + MCP protocol + specification-driven pipeline |

---

## The Orchestration Stack

This project was built using a **custom AI agent harness** — not a chat interface, but a runtime environment where AI agents operate with constrained toolsets through MCP (Model Context Protocol).

```
Human (Director)
    │  defines intent, approves phases, validates output
    ▼
Agent Harness (orchestration layer)
    │  manages sessions, tools, persona, skill loading
    ├── OpenPencil    — visual design as structured data (.op files)
    ├── Engram        — persistent memory across sessions
    ├── CodeGraph     — codebase knowledge graph (symbols, call paths)
    └── Context7      — live library documentation
    │
    ▼
SDD Pipeline (9 phases, each with artifacts)
    explore → propose → spec → design → tasks → apply → verify → archive
```

### Why This Matters

Most AI-assisted development: *"build me X"* → AI generates → human hopes it works.

This project: human creates **specification** → AI creates **implementation** → verification validates against specification. The AI is a **compiler for human intent**, not an architect.

---

## SDD Pipeline

Each phase produces artifacts consumed by the next:

| Phase | Skill | Artifact |
|-------|-------|----------|
| Init | `sdd-init` | Context bootstrap |
| Explore | `sdd-explore` | Codebase analysis |
| Propose | `sdd-propose` | [`proposal.md`](openspec/changes/task-manager/proposal.md) — intent, scope, success criteria |
| Spec | `sdd-spec` | [`spec.md`](openspec/changes/task-manager/specs/task-manager/spec.md) — requirements + scenarios |
| Design | `sdd-design` | [`design.md`](openspec/changes/task-manager/design.md) — contracts, data flow |
| Tasks | `sdd-tasks` | [`tasks.md`](openspec/changes/task-manager/tasks.md) — 19 ordered steps |
| Apply | `sdd-apply` | Source code per task definitions |
| Verify | `sdd-verify` | [`verify-report.md`](openspec/changes/task-manager/verify-report.md) — **28/28 ACs PASS** |
| Archive | `sdd-archive` | Sync specs, close change |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 (hooks only) |
| Build | Vite 8 |
| Styling | Tailwind CSS 3 |
| State | `useState` / `useMemo` / `useCallback` |
| Persistence | `localStorage` |
| Design | OpenPencil (`.op` files via MCP) |
| Palette | Kanagawa Dragon |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
├── src/
│   ├── App.jsx                 # Composition root
│   ├── hooks/useTasks.js       # State + localStorage
│   ├── components/
│   │   ├── TaskInput.jsx       # Input + submit guard
│   │   ├── TaskList.jsx        # Filtered list + empty state
│   │   ├── TaskItem.jsx        # Task row
│   │   ├── FilterBar.jsx       # All/Active/Completed
│   │   └── TaskFooter.jsx      # Active count
│   └── constants.js            # Storage key, filters, messages
├── openspec/                   # SDD artifact trail
│   └── changes/task-manager/
│       ├── proposal.md         # Intent + scope
│       ├── specs/task-manager/
│       │   └── spec.md         # Requirements
│       ├── design.md           # Contracts + data flow
│       ├── tasks.md            # Implementation steps
│       ├── task-manager.op     # OpenPencil design
│       ├── verify-report.md    # 28/28 PASS
│       └── apply-progress.md   # Execution tracking
└── opencode.json               # MCP config
```

---

## License

MIT

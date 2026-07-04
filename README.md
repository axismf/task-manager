# Task Manager — AI Orchestration & Engineering Rigor

A minimal Task Manager SPA built through a structured AI orchestration pipeline. This project demonstrates how **agent harnesses, MCP protocol, and specification-driven development** combine to produce deterministic, verifiable software — with the human directing every decision.

---

## The Stack Behind the Stack

The app is a React task manager. The interesting part is the **orchestration layer** that built it.

### Agent Harness: OpenCode

[OpenCode](https://opencode.ai) is the agent harness — a CLI-based AI coding environment that connects to LLMs and provides structured tool access through MCP (Model Context Protocol). It's not just a chat interface; it's a **runtime environment** where AI agents operate with constrained toolsets.

Key capabilities:
- **Persistent sessions** — context survives across interactions
- **Tool orchestration** — AI calls tools (read, write, search, bash) through a structured protocol
- **Persona system** — AGENTS.md defines agent behavior, tone, and decision-making philosophy
- **Skill loading** — modular SKILL.md files inject domain-specific workflows on demand

### MCP Protocol: The Integration Layer

[MCP (Model Context Protocol)](https://modelcontextprotocol.io) is the standard that connects AI agents to external tools and data sources. Each MCP server exposes a capability; the agent harness orchestrates them.

This project uses 4 MCP servers:

| Server | Purpose | What It Provides |
|--------|---------|-----------------|
| **OpenPencil** | Visual design as structured data | `.op` file manipulation — nodes, layouts, themes, design-to-code |
| **Engram** | Persistent memory across sessions | Decisions, bugs, discoveries survive context resets and compactions |
| **CodeGraph** | Codebase knowledge graph | Symbol indexing, call paths, dependency analysis — faster than grep |
| **Context7** | Live documentation fetching | Up-to-date library docs, not stale training data |

### OpenPencil: Design as Data

[OpenPencil](https://openpencil.ai) treats visual design as a structured node tree — not pixels, not Figma files, but **typed data** that AI agents can read, query, and modify programmatically.

An `.op` file contains:
- **Nodes** — frames, text, rectangles, ellipses, paths, images, groups
- **Layout** — flexbox-like vertical/horizontal arrangement with gap, padding, alignment
- **Properties** — fill colors, strokes, corner radius, effects, opacity
- **Pages** — multiple artboards in a single file
- **Variables & Themes** — design tokens with named variants

This means the AI can:
- Query all unique fill colors in a design
- Replace `#7E9CD8` with `#c4746e` across every node automatically
- Read component hierarchy and spatial relationships
- Generate code from design specifications

The `.op` file for this project lives at [`openspec/changes/task-manager/task-manager.op`](openspec/changes/task-manager/task-manager.op).

### SDD Skills: The Workflow Engine

The SDD (Specification by Design) pipeline is implemented as a set of modular skills — each one a SKILL.md file that injects domain-specific instructions into the agent:

```
sdd-init → sdd-explore → sdd-propose → sdd-spec → sdd-design → sdd-tasks → sdd-apply → sdd-verify → sdd-archive
```

Each skill:
- Receives context from the previous phase
- Produces artifacts (markdown documents) consumed by the next phase
- Has defined acceptance criteria for completion
- Can be invoked independently or as part of the full pipeline

This is **orchestration through specification** — not a monolithic prompt, but a chain of constrained agents each with a defined role.

---

## Orchestration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    HUMAN (Director)                      │
│  Defines intent, approves phases, validates output       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              OpenCode (Agent Harness)                    │
│  Manages sessions, tools, persona, skill loading         │
│  AGENTS.md → behavior constraints                       │
│  Skills → domain-specific workflows                     │
└────┬──────────┬──────────┬──────────┬──────────────────┘
     │          │          │          │
     ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│OpenPen │ │ Engram │ │CodeGrph│ │Context7│
│  cil   │ │        │ │        │ │        │
│ Design │ │Memory  │ │Graph   │ │  Docs  │
│ as Data│ │Persist │ │Index   │ │  Live  │
└────────┘ └────────┘ └────────┘ └────────┘
     │          │          │          │
     └──────────┴──────────┴──────────┘
                         │
                         ▼
              ┌─────────────────┐
              │   SDD Pipeline  │
              │  9 phases, each │
              │  with artifacts │
              └─────────────────┘
```

### How Orchestration Works

1. **Human defines intent** — "build a task manager to validate the SDD pipeline"
2. **SDD skills load sequentially** — each skill reads previous phase artifacts
3. **MCP servers provide capability** — OpenPencil for design, Engram for memory, CodeGraph for codebase analysis
4. **Agent harness constrains execution** — persona rules, tool permissions, response contracts
5. **Artifacts accumulate** — every phase produces traceable documentation
6. **Human validates at gate points** — proposal approval, design review, verify report

The AI never operates unsupervised. Every phase has a human checkpoint.

---

## The SDD Pipeline in Detail

### Phase 0: Init
**Skill:** `sdd-init`
**Purpose:** Bootstrap SDD context, testing capabilities, registry, and persistence for the project.

### Phase 1: Explore
**Skill:** `sdd-explore`
**Purpose:** Understand the codebase, constraints, and existing state before proposing changes.

### Phase 2: Propose
**Skill:** `sdd-propose`
**Artifact:** [`proposal.md`](openspec/changes/task-manager/proposal.md)
**Purpose:** Define intent, scope, non-goals, success criteria, risks, and business rules.

### Phase 3: Spec
**Skill:** `sdd-spec`
**Artifact:** [`spec.md`](openspec/changes/task-manager/specs/task-manager/spec.md)
**Purpose:** Functional specification with Given/When/Then scenarios and acceptance criteria per component.

### Phase 4: Design
**Skill:** `sdd-design`
**Artifact:** [`design.md`](openspec/changes/task-manager/design.md)
**Purpose:** Component contracts, state shape, data flow diagrams, file structure, Tailwind strategy.

### Phase 5: Tasks
**Skill:** `sdd-tasks`
**Artifact:** [`tasks.md`](openspec/changes/task-manager/tasks.md)
**Purpose:** Ordered, dependency-aware implementation steps with "done when" criteria.

### Phase 6: Apply
**Skill:** `sdd-apply`
**Output:** Source files
**Purpose:** Execute tasks — AI generates code per task definitions. Progress tracked in [`apply-progress.md`](openspec/changes/task-manager/apply-progress.md).

### Phase 7: Verify
**Skill:** `sdd-verify`
**Artifact:** [`verify-report.md`](openspec/changes/task-manager/verify-report.md)
**Purpose:** Static analysis, build verification, acceptance criteria validation. **28/28 ACs PASS.**

### Phase 8: Archive
**Skill:** `sdd-archive`
**Purpose:** Sync delta specs, close the change, update artifact trail.

---

## Engineering Principles

### Derived State Over Duplicated State

```js
const filteredTasks = useMemo(() => {
  switch (filter) {
    case 'active':    return tasks.filter(t => !t.completed);
    case 'completed': return tasks.filter(t =>  t.completed);
    default:          return tasks;
  }
}, [tasks, filter]);

const activeCount = useMemo(
  () => tasks.filter(t => !t.completed).length,
  [tasks]
);
```

`filteredTasks` and `activeCount` are **always derived, never stored**. A single mutation to `tasks` produces correct views automatically. No state drift possible.

### Defensive Programming

Every failure mode degrades gracefully:

| Failure | Handling |
|---------|----------|
| Empty input | `trim()` + early return |
| `localStorage` absent | Falls back to `[]` |
| `localStorage` malformed | Falls back to `[]` |
| `localStorage` write failure | `try/catch` — in-memory preserved |

### Traceability

Every implementation artifact traces to a specification requirement:

| Spec Requirement | Design | Implementation | Verify |
|-----------------|--------|----------------|--------|
| Task Creation | §2.1 TaskInput | `TaskInput.jsx:8-14` | AC 1-4 PASS |
| Completion Toggle | §3.4 toggleTask | `useTasks.js:46` | AC 5-7 PASS |
| Task Deletion | §3.4 deleteTask | `useTasks.js:51` | AC 7 PASS |
| Filter Visibility | §3.5 useMemo | `useTasks.js:52-58` | AC 1-3 PASS |
| Empty State | §2.3 TaskList | `TaskList.jsx:10-14` | AC 1-3 PASS |
| Active Count | §2.5 TaskFooter | `TaskFooter.jsx:5` | AC 1-3 PASS |
| Persistence | §3.1-3.3 | `useTasks.js:25-39` | AC 8-10 PASS |

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 19 | Hooks-only, no class complexity |
| Build | Vite 8 | Fast HMR, minimal config |
| Styling | Tailwind CSS 3 | Utility-first, no CSS-in-JS |
| State | `useState` / `useMemo` | No external library for this scope |
| Persistence | `localStorage` | Single-user, local-only |
| Design | OpenPencil | Structured design data via MCP |
| Harness | OpenCode | Agent environment with MCP orchestration |
| Memory | Engram | Persistent context across sessions |
| Indexing | CodeGraph | Symbol-level codebase analysis |
| Docs | Context7 | Live library documentation |
| Palette | Kanagawa Dragon | Warm dark theme |

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
│   ├── hooks/useTasks.js       # State + localStorage sync
│   ├── components/
│   │   ├── TaskInput.jsx       # Controlled input + submit
│   │   ├── TaskList.jsx        # Filtered list + empty state
│   │   ├── TaskItem.jsx        # Single task row
│   │   ├── FilterBar.jsx       # All/Active/Completed tabs
│   │   └── TaskFooter.jsx      # Active count
│   └── constants.js            # Storage key, filters, messages
├── openspec/                   # SDD artifact trail
│   └── changes/task-manager/
│       ├── proposal.md         # Intent + scope
│       ├── specs/task-manager/
│       │   └── spec.md         # Requirements + scenarios
│       ├── design.md           # Component contracts
│       ├── tasks.md            # 19 implementation tasks
│       ├── task-manager.op     # OpenPencil design file
│       ├── verify-report.md    # 28/28 ACs PASS
│       └── apply-progress.md   # Execution tracking
├── opencode.json               # MCP server config (OpenPencil)
└── package.json
```

---

## Design Palette (Kanagawa Dragon)

| Token | Hex | Role |
|-------|-----|------|
| dragonBlack3 | `#181616` | Page background |
| dragonBlack4 | `#282727` | Card/input background |
| dragonBlack6 | `#625e5a` | Borders |
| dragonWhite | `#c5c9c5` | Primary text |
| dragonAsh | `#737c73` | Muted text |
| dragonRed | `#c4746e` | Accent |

---

## License

MIT

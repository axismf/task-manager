# Task Manager

Un Task Manager mínimo en React construido a través de un **pipeline de orquestación AI estructurado** — demostrando que prácticas de ingeniería disciplinadas amplifican las capacidades de la AI, no las reemplazan.

> **Lo interesante no es la app. Es cómo se construyó.**

---

## Qué Demuestra Este Proyecto

| Concepto | Cómo Se Aplica |
|----------|----------------|
| Ingeniería de Requisitos | 28 criterios de aceptación, escenarios Given/When/Then, matriz de edge cases |
| Estado Derivado | `filteredTasks` y `activeCount` siempre computados, nunca almacenados |
| Programación Defensiva | Cada fallo de `localStorage` degrada gracefulmente a `[]` |
| Trazabilidad | Cada artefacto de implementación traza a un requisito del spec |
| Orquestación AI | Agent harness + protocolo MCP + pipeline specification-driven |

---

## El Stack de Orquestación

Este proyecto se construyó usando un **agent harness AI personalizado** — no una interfaz de chat, sino un entorno de ejecución donde agentes AI operan con toolsets restringidos a través de MCP (Model Context Protocol).

```
Humano (Director)
    │  define la intención, aprueba fases, valida output
    ▼
Agent Harness (capa de orquestación)
    │  maneja sesiones, herramientas, persona, carga de skills
    ├── OpenPencil    — diseño visual como datos estructurados (.op)
    ├── Engram        — memoria persistente entre sesiones
    ├── CodeGraph     — knowledge graph del codebase (símbolos, call paths)
    └── Context7      — documentación de librerías en vivo
    │
    ▼
Pipeline SDD (9 fases, cada una con artefactos)
    explore → propose → spec → design → tasks → apply → verify → archive
```

### Por Qué Importa

El desarrollo AI típico: *"haceme X"* → AI genera → humano espera que funcione.

Este proyecto: humano crea **especificación** → AI crea **implementación** → verificación valida contra la especificación. La AI es un **compilador de intención humana**, no una arquitecta.

---

## Pipeline SDD

Cada fase produce artefactos consumidos por la siguiente:

| Fase | Skill | Artefacto |
|------|-------|-----------|
| Init | `sdd-init` | Bootstrap del contexto |
| Explore | `sdd-explore` | Análisis del codebase |
| Propose | `sdd-propose` | [`proposal.md`](openspec/changes/task-manager/proposal.md) — intención, alcance, criterios de éxito |
| Spec | `sdd-spec` | [`spec.md`](openspec/changes/task-manager/specs/task-manager/spec.md) — requisitos + escenarios |
| Design | `sdd-design` | [`design.md`](openspec/changes/task-manager/design.md) — contratos, flujo de datos |
| Tasks | `sdd-tasks` | [`tasks.md`](openspec/changes/task-manager/tasks.md) — 19 pasos ordenados |
| Apply | `sdd-apply` | Código fuente según definiciones de tareas |
| Verify | `sdd-verify` | [`verify-report.md`](openspec/changes/task-manager/verify-report.md) — **28/28 ACs PASS** |
| Archive | `sdd-archive` | Sync de specs, cierre del cambio |

---

## Tech Stack

| Capa | Elección |
|------|----------|
| Framework | React 19 (solo hooks) |
| Build | Vite 8 |
| Estilos | Tailwind CSS 3 |
| Estado | `useState` / `useMemo` / `useCallback` |
| Persistencia | `localStorage` |
| Diseño | OpenPencil (archivos `.op` vía MCP) |
| Paleta | Kanagawa Dragon |

---

## Cómo Ejecutar

```bash
npm install
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173)

---

## Estructura del Proyecto

```
├── src/
│   ├── App.jsx                 # Raíz de composición
│   ├── hooks/useTasks.js       # Estado + localStorage
│   ├── components/
│   │   ├── TaskInput.jsx       # Input + guard de submit
│   │   ├── TaskList.jsx        # Lista filtrada + empty state
│   │   ├── TaskItem.jsx        # Fila de tarea
│   │   ├── FilterBar.jsx       # All/Active/Completed
│   │   └── TaskFooter.jsx      # Contador de activas
│   └── constants.js            # Storage key, filtros, mensajes
├── openspec/                   # Trail de artefactos SDD
│   └── changes/task-manager/
│       ├── proposal.md         # Intención + alcance
│       ├── specs/task-manager/
│       │   └── spec.md         # Requisitos
│       ├── design.md           # Contratos + flujo de datos
│       ├── tasks.md            # Pasos de implementación
│       ├── task-manager.op     # Diseño OpenPencil
│       ├── verify-report.md    # 28/28 PASS
│       └── apply-progress.md   # Tracking de ejecución
└── opencode.json               # Config MCP
```

---

## Licencia

MIT

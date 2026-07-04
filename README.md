# Task Manager

Un Task Manager mínimo en React construido a través de un **pipeline de orquestación AI multi-agente** — demostrando que prácticas de ingeniería disciplinadas amplifican las capacidades de la AI, no las reemplazan.

> **Lo interesante no es la app. Es cómo se construyó.**

**Demo:** [axismf.github.io/task-manager](https://axismf.github.io/task-manager/)

---

## Qué Demuestra Este Proyecto

| Concepto | Cómo Se Aplica |
|----------|----------------|
| Ingeniería de Requisitos | 28 criterios de aceptación, escenarios Given/When/Then, matriz de edge cases |
| Estado Derivado | `filteredTasks` y `activeCount` siempre computados, nunca almacenados |
| Programación Defensiva | Cada fallo de `localStorage` degrada gracefulmente a `[]` |
| Trazabilidad | Cada artefacto de implementación traza a un requisito del spec |
| Orquestación Multi-Agente | Orquestador coordina, sub-agentes ejecutan, humano valida |

---

## Orquestación Multi-Agente

Este proyecto usa un **agent harness AI personalizado** con un patrón de **orquestación multi-agente**: un orquestador central delega cada fase del pipeline a sub-agentes especializados, cada uno con su propio contexto, herramientas y permisos.

```
Humano (Director)
    │  define intención, aprueba fases, valida output
    ▼
Orquestador (coordinador delgado)
    │  NO ejecuta — solo coordina y delega
    │  mantiene el hilo conductor entre fases
    │
    ├── sdd-explore    → sub-agente: analiza el codebase
    ├── sdd-propose    → sub-agente: define intención y alcance
    ├── sdd-spec       → sub-agente: escribe requisitos formales
    ├── sdd-design     → sub-agente: diseña arquitectura
    ├── sdd-tasks      → sub-agente: descompone en pasos
    ├── sdd-apply      → sub-agente: genera código
    ├── sdd-verify     → sub-agente: valida contra spec
    └── sdd-archive    → sub-agente: sincroniza y cierra
    │
    ▼
MCP Servers (capa de herramientas)
    ├── OpenPencil    — diseño visual como datos estructurados
    ├── Engram        — memoria persistente entre sesiones
    ├── CodeGraph     — knowledge graph del codebase
    └── Context7      — documentación de librerías en vivo
```

### Cómo Funciona la Delegación

Cada sub-agente:
1. **Recibe contexto** del orquestador (nombre del cambio, artefactos previos)
2. **Carga skills especializados** (SKILL.md con instrucciones específicas de la fase)
3. **Ejecuta** con toolsets restringidos (read, write, search, bash)
4. **Persiste artefactos** en memoria antes de retornar
5. **Retorna** `{status, executive_summary, artifacts, next_recommended}`

El orquestador **nunca ejecuta trabajo pesado**. Lee hasta 3 archivos inline; si necesita más, delega. Esto mantiene el contexto limpio y permite asignar modelos diferentes a diferentes fases.

### Por Qué Importa

El desarrollo AI típico: *"haceme X"* → AI genera → humano espera que funcione.

Este proyecto: humano crea **especificación** → orquestador **delega** a sub-agentes → cada sub-agente ejecuta su fase → verificación **valida** contra la especificación. La AI es un **compilador de intención humana**, no una arquitecta.

---

## Pipeline SDD (Specification by Design)

Cada fase produce artefactos consumidos por la siguiente:

| Fase | Sub-Agente | Artefacto |
|------|-----------|-----------|
| Init | `sdd-init` | Bootstrap del contexto y testing capabilities |
| Explore | `sdd-explore` | Análisis del codebase y restricciones |
| Propose | `sdd-propose` | [`proposal.md`](openspec/changes/task-manager/proposal.md) — intención, alcance, criterios de éxito |
| Spec | `sdd-spec` | [`spec.md`](openspec/changes/task-manager/specs/task-manager/spec.md) — requisitos + escenarios Given/When/Then |
| Design | `sdd-design` | [`design.md`](openspec/changes/task-manager/design.md) — contratos de componentes, flujo de datos |
| Tasks | `sdd-tasks` | [`tasks.md`](openspec/changes/task-manager/tasks.md) — 19 pasos ordenados con dependencias |
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

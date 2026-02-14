# Angular Learning Guide

A progressive, hands-on Angular learning path for experienced React/Next.js/TypeScript developers.

## What You'll Build

**TaskFlow** — a task and project management app built across 13 sections, each introducing new Angular concepts while comparing them to React patterns you already know.

## Prerequisites

- Solid experience with React, Next.js, and TypeScript
- Node.js 20+ installed
- A code editor (VS Code recommended with the [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template) extension)

## How to Use This Guide

1. **Read each section** in `guide/` in order (00 → 12)
2. **Complete the task** at the end of each section
3. **Build in `taskflow/`** — this is where your app lives
4. **Check `solutions/`** only if you're stuck — each folder has the key files for that section
5. **Use Claude** as your pair programmer — the `CLAUDE.md` file instructs it to guide you without spoiling solutions

## Guide Sections

| # | Section | Key Concepts |
|---|---------|-------------|
| 00 | [Setup](guide/00-setup.md) | Angular CLI, project scaffold, Tailwind CSS v4 |
| 01 | [Components & Templates](guide/01-components-and-templates.md) | `@Component`, selectors, template syntax |
| 02 | [Signals & State](guide/02-signals-and-state.md) | `signal()`, `computed()`, `effect()` |
| 03 | [Control Flow & Lists](guide/03-control-flow-and-lists.md) | `@if`, `@for`, `@switch`, `@empty` |
| 04 | [Component Communication](guide/04-component-communication.md) | `input()`, `output()`, `model()`, `ng-content` |
| 05 | [Services & DI](guide/05-services-and-di.md) | `@Injectable`, `inject()`, singleton services |
| 06 | [Routing](guide/06-routing.md) | Routes, lazy loading, route params |
| 07 | [Forms](guide/07-forms.md) | Reactive forms, validation, signal forms |
| 08 | [Pipes & Directives](guide/08-pipes-and-directives.md) | Custom pipes, attribute directives |
| 09 | [HTTP & Data](guide/09-http-and-data.md) | localStorage, json-server, `httpResource()` |
| 10 | [Authentication](guide/10-authentication.md) | Auth service, guards, interceptors |
| 11 | [State Management](guide/11-state-management.md) | `linkedSignal()`, computed aggregations |
| 12 | [Testing & Next Steps](guide/12-testing-and-next-steps.md) | Vitest, TestBed, what's next |

## Project Structure

```
angular_learning/
├── CLAUDE.md          # AI assistant instructions
├── README.md          # This file
├── guide/             # Learning sections (read these)
├── solutions/         # Reference solutions (check when stuck)
└── taskflow/          # Your app (you build here)
```

## Modern Angular Patterns Used

This guide uses **Angular 21** with the latest patterns:

- **Signals** for reactive state (`signal()`, `computed()`, `effect()`)
- **Standalone components** (no NgModules)
- **Zoneless change detection** (no zone.js)
- **Function-based APIs** (`inject()`, `input()`, `output()`)
- **Built-in control flow** (`@if`, `@for`, `@switch`)
- **`httpResource()`** for declarative data fetching
- **Vitest** for testing

## Quick Start

```bash
# Start from section 00
cat guide/00-setup.md

# Or if you want Claude's help
claude
```

# 01 — Components & Templates

[← Previous: 00 — Setup](00-setup.md) · [Next: 02 — Signals & State →](02-signals-and-state.md)

## Goal

Create your first Angular component, understand the `@Component` decorator, and learn how Angular's template syntax compares to JSX.

## React Comparison: Components

| React | Angular |
|-------|---------|
| Function that returns JSX | Class with `@Component` decorator |
| `export default function TaskCard()` | `export class TaskCard {}` |
| JSX lives inside the function | Template is a separate `.html` file (or inline) |
| `className="..."` | `class="..."` |
| `onClick={handler}` | `(click)="handler()"` |
| `{variable}` | `{{ variable }}` |
| `<Component prop={value} />` | `<app-component [prop]="value" />` |

### The Mental Shift

In React, a component is a **JavaScript function** that returns markup (JSX). Everything is JS-first.

In Angular, a component is a **TypeScript class** decorated with metadata. The template is HTML-first with Angular-specific syntax sprinkled in. Your logic lives in the class, your markup lives in the template.

```tsx
// React: JS with HTML inside
function TaskCard() {
  const title = "Build UI";
  return <div className="card">{title}</div>;
}
```

```typescript
// Angular: HTML with expressions inside
@Component({
  selector: 'app-task-card',
  template: `<div class="card">{{ title }}</div>`,
})
export class TaskCard {
  title = "Build UI";
}
```

## Anatomy of an Angular Component

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-task-card',      // HTML tag name: <app-task-card />
  templateUrl: './task-card.html', // Separate template file
  styleUrl: './task-card.css',     // Scoped styles (like CSS Modules)
})
export class TaskCard {
  // Properties are automatically available in the template
  title = 'Build the UI';
  priority = 'high';
  completed = false;
}
```

### Key Parts

- **`selector`** — The HTML tag you'll use to place this component. Convention is `app-` prefix. Like defining a custom element.
- **`templateUrl`** — Path to the HTML template. You can also use `template` for inline templates (backtick strings).
- **`styleUrl`** — Scoped CSS. Styles here only affect this component (Angular uses attribute-based scoping, similar to CSS Modules or Styled Components).

> **File naming (Angular 21):** Modern Angular uses `task-card.ts` instead of `task-card.component.ts`. The CLI still generates the longer name, but the community is moving toward shorter names. This guide uses the shorter convention.

## Template Syntax

### Interpolation: `{{ }}`

```html
<h3>{{ title }}</h3>
<p>Status: {{ completed ? 'Done' : 'Pending' }}</p>
```

Like React's `{expression}` but with double curly braces. Any TypeScript expression works.

### Property Binding: `[prop]`

```html
<!-- Binds the DOM property -->
<input [value]="title" />
<button [disabled]="isSubmitting">Save</button>
```

React equivalent: `<input value={title} />`. The square brackets tell Angular "evaluate this as an expression, not a string."

Without brackets, it's a plain string attribute:

```html
<!-- These are equivalent -->
<img src="logo.png" />
<img [src]="'logo.png'" />
```

### Event Binding: `(event)`

```html
<button (click)="handleClick()">Click me</button>
<input (input)="handleInput($event)" />
```

React equivalent: `<button onClick={handleClick}>`. Parentheses = event binding. `$event` gives you the raw DOM event (like React's synthetic event, but it's the real DOM event).

### Summary: The Bracket System

| Syntax | Direction | React Equivalent |
|--------|-----------|-----------------|
| `{{ expr }}` | Component → DOM (text) | `{expr}` |
| `[prop]="expr"` | Component → DOM (property) | `prop={expr}` |
| `(event)="handler()"` | DOM → Component | `onEvent={handler}` |

## Generating a Component

Use the CLI to generate your component:

```bash
ng generate component task-card
```

This creates:

```
src/app/task-card/
├── task-card.ts       # Component class
├── task-card.html     # Template
├── task-card.css      # Scoped styles
└── task-card.spec.ts  # Test file
```

> The CLI generates standalone components by default in Angular 21. No module registration needed.

## Using Your Component

Once created, use it in any template by its selector:

```html
<!-- In app.html -->
<app-task-card />
```

That's it. No import statement in the template (Angular resolves components from TypeScript imports in the component's `imports` array).

But wait — you do need to tell the parent component about it:

```typescript
// app.ts
import { TaskCard } from './task-card/task-card';

@Component({
  selector: 'app-root',
  imports: [TaskCard],  // ← Register it here
  templateUrl: './app.html',
})
export class App {}
```

> **React comparison:** In React you just `import` and use it in JSX. Angular has an extra step — adding to the `imports` array. This is because Angular compiles templates ahead of time and needs to know which components are available.

## Task

1. Generate a `TaskCard` component using the CLI
2. Give it these properties:
   - `title` — string (e.g., "Build the UI")
   - `description` — string (e.g., "Create the main dashboard layout")
   - `priority` — string: "low", "medium", or "high"
   - `completed` — boolean
3. Build out the template (`task-card.html`) with Tailwind styling:
   - Card container with border and padding
   - Title displayed as a heading
   - Description as paragraph text
   - Priority shown as a colored badge
   - Completed status displayed
4. Import and display `TaskCard` in `app.html`

**Hints:**
- Use `{{ }}` for displaying values
- Use Tailwind classes directly with `class="..."`
- For the priority badge, you can use a ternary in the template: `{{ priority === 'high' ? '🔴' : '🟡' }}`

## What's Next

Your TaskCard works, but the data is hardcoded. In the next section, you'll learn about **signals** — Angular's reactive primitive for managing state, and how they compare to React's `useState`.

[← Previous: 00 — Setup](00-setup.md) · [Next: 02 — Signals & State →](02-signals-and-state.md)

# 02 — Signals & State

[← Previous: 01 — Components & Templates](01-components-and-templates.md) · [Next: 03 — Control Flow & Lists →](03-control-flow-and-lists.md)

## Goal

Learn Angular's signal-based reactivity system and convert your TaskCard to use signals.

## React Comparison: State Management

| React | Angular | Notes |
|-------|---------|-------|
| `useState(value)` | `signal(value)` | Both create reactive state |
| `const [x, setX] = useState(0)` | `x = signal(0)` | Signal is read with `x()`, set with `x.set()` |
| `useMemo(() => expr, [deps])` | `computed(() => expr)` | Computed auto-tracks — no dependency array |
| `useEffect(() => {}, [deps])` | `effect(() => {})` | Effect auto-tracks — no dependency array |

### The Big Win: No Dependency Arrays

In React, you manually declare dependencies:

```tsx
// React: You must list dependencies manually
const fullName = useMemo(() => `${first} ${last}`, [first, last]);

useEffect(() => {
  console.log(`Name changed to ${first} ${last}`);
}, [first, last]); // Forget one? Bug. Add extra? Unnecessary re-runs.
```

In Angular, signals **automatically track** what they depend on:

```typescript
// Angular: Dependencies tracked automatically
fullName = computed(() => `${this.first()} ${this.last()}`);

constructor() {
  effect(() => {
    console.log(`Name changed to ${this.first()} ${this.last()}`);
  }); // No dependency array needed. Ever.
}
```

No stale closures. No exhaustive-deps lint rule. No forgetting a dependency.

### Fine-Grained Updates

React re-renders the **entire component** when state changes (then diffs the virtual DOM).

Angular signals update **only the specific DOM nodes** that read the signal. No virtual DOM diffing needed. This is closer to how Solid.js works, if you're familiar.

## `signal()` — Reactive State

```typescript
import { signal } from '@angular/core';

export class TaskCard {
  title = signal('Build the UI');
  completed = signal(false);
}
```

### Reading a Signal

In TypeScript, call it like a function:

```typescript
console.log(this.title()); // 'Build the UI'
```

In templates, also call it:

```html
<h3>{{ title() }}</h3>
```

> **Why the parentheses?** Signals are getter functions. This is how Angular knows which template parts depend on which signals — it tracks the call.

### Updating a Signal

```typescript
// Set to a new value
this.title.set('New title');

// Update based on current value
this.completed.update(current => !current);
```

Compare to React:

```tsx
// React
setTitle('New title');
setCompleted(prev => !prev);
```

## `computed()` — Derived State

```typescript
import { signal, computed } from '@angular/core';

export class TaskCard {
  completed = signal(false);
  priority = signal<'low' | 'medium' | 'high'>('medium');

  // Automatically recalculates when completed() or priority() change
  statusLabel = computed(() => {
    if (this.completed()) return 'Done';
    return `Pending (${this.priority()})`;
  });
}
```

```html
<p>{{ statusLabel() }}</p>
```

- **Read-only** — you can't `.set()` a computed signal
- **Lazy** — only recalculates when read AND a dependency has changed
- **Memoized** — returns cached value if dependencies haven't changed

## `effect()` — Side Effects

```typescript
import { signal, effect } from '@angular/core';

export class TaskCard {
  completed = signal(false);

  constructor() {
    effect(() => {
      // Runs whenever completed() changes
      console.log('Task completion:', this.completed());
    });
  }
}
```

Effects run:
1. Once immediately (like `useEffect` with `[]` — but also tracking deps)
2. Again whenever any signal read inside them changes

> **Important:** Effects must be created in an **injection context** (constructor or field initializer) or you must pass an `Injector`. This is a common gotcha.

### When to Use Effect

Use `effect()` sparingly — it's for **side effects** like:
- Logging
- Syncing to localStorage
- Calling external APIs

For derived values, prefer `computed()`. This is the same advice as React: prefer `useMemo` over `useEffect` for derived state.

## Signals vs React Hooks: Summary

```tsx
// React
function TaskCard() {
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState('medium');

  const statusLabel = useMemo(() => {
    if (completed) return 'Done';
    return `Pending (${priority})`;
  }, [completed, priority]);

  useEffect(() => {
    console.log('Status:', completed);
  }, [completed]);

  return (
    <button onClick={() => setCompleted(c => !c)}>
      {statusLabel}
    </button>
  );
}
```

```typescript
// Angular
@Component({
  selector: 'app-task-card',
  template: `
    <button (click)="toggle()">{{ statusLabel() }}</button>
  `,
})
export class TaskCard {
  completed = signal(false);
  priority = signal<'low' | 'medium' | 'high'>('medium');

  statusLabel = computed(() => {
    if (this.completed()) return 'Done';
    return `Pending (${this.priority()})`;
  });

  constructor() {
    effect(() => console.log('Status:', this.completed()));
  }

  toggle() {
    this.completed.update(c => !c);
  }
}
```

Key differences:
- No destructuring — signals are single values (not `[value, setter]` tuples)
- `this.` everywhere — Angular uses class properties, not function closures
- No dependency arrays — signals track automatically
- Methods for event handlers — not inline arrow functions (though those work too)

## Task

1. Convert your `TaskCard` component to use signals:
   - `title`, `description`, `priority`, `completed` should all be `signal()` values
2. Add a **toggle button** that flips `completed` using `update()`
3. Create a `computed()` signal called `statusLabel` that returns:
   - `"✅ Complete"` when completed is true
   - `"📋 Pending — {priority}"` when completed is false
4. Add an `effect()` in the constructor that logs when the completed status changes
5. Display `statusLabel()` in the template

**Hints:**
- Don't forget the `()` when reading signals in templates
- The toggle handler should be a class method: `toggle() { this.completed.update(c => !c); }`
- Bind it with `(click)="toggle()"`

## What's Next

You've got a reactive TaskCard, but it's still one card. In the next section, you'll learn Angular's built-in control flow to render lists and conditionally show content.

[← Previous: 01 — Components & Templates](01-components-and-templates.md) · [Next: 03 — Control Flow & Lists →](03-control-flow-and-lists.md)

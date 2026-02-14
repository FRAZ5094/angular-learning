# 04 — Component Communication

[← Previous: 03 — Control Flow & Lists](03-control-flow-and-lists.md) · [Next: 05 — Services & DI →](05-services-and-di.md)

## Goal

Learn how Angular components communicate using `input()`, `output()`, `model()`, and `<ng-content>`.

## React Comparison: Props & Callbacks

| React | Angular | Notes |
|-------|---------|-------|
| `props.title` | `title = input<string>()` | Data flows down |
| `props.title` (required) | `title = input.required<string>()` | Type-enforced |
| `props.onDelete(id)` | `delete = output<string>()` | Events flow up |
| `[value, setValue]` passed as props | `value = model<string>()` | Two-way binding |
| `props.children` | `<ng-content>` | Content projection |

### The Mental Shift

React uses **one concept** for everything: props. Data, callbacks, children — all props.

Angular has **distinct mechanisms** for each direction:
- **`input()`** — data flows **down** (parent → child)
- **`output()`** — events flow **up** (child → parent)
- **`model()`** — data flows **both ways** (two-way binding)

This is more explicit about data flow direction, which can make large apps easier to reason about.

## `input()` — Receiving Data from Parent

```typescript
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-task-card',
  template: `
    <div class="p-4 border rounded">
      <h3>{{ title() }}</h3>
      <p>{{ description() }}</p>
    </div>
  `,
})
export class TaskCard {
  // Optional input with default
  title = input('Untitled');

  // Required input — parent must provide
  description = input.required<string>();

  // Typed input with default
  priority = input<'low' | 'medium' | 'high'>('medium');
}
```

Parent usage:

```html
<app-task-card
  [title]="task.title"
  [description]="task.description"
  [priority]="task.priority"
/>
```

Key differences from React props:
- **Inputs are signal-like** — read them with `()` in templates and TypeScript
- **Required inputs** are enforced at compile time — Angular won't let you use the component without them
- **Default values** are built into the API, not a separate `defaultProps`

## `output()` — Sending Events to Parent

```typescript
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-task-card',
  template: `
    <button (click)="onDelete()">Delete</button>
    <button (click)="onToggle()">Toggle</button>
  `,
})
export class TaskCard {
  taskId = input.required<string>();

  // Declare outputs
  delete = output<string>();
  toggle = output<string>();

  onDelete() {
    this.delete.emit(this.taskId());
  }

  onToggle() {
    this.toggle.emit(this.taskId());
  }
}
```

Parent handles the event:

```html
<app-task-card
  [taskId]="task.id"
  (delete)="handleDelete($event)"
  (toggle)="handleToggle($event)"
/>
```

```typescript
handleDelete(taskId: string) {
  this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
}
```

> **React comparison:** Instead of `onDelete={handleDelete}` (passing a callback), Angular uses `(delete)="handleDelete($event)"` (listening to an event). The child `emit()`s values; the parent listens with `()` syntax. `$event` contains the emitted value.

## `model()` — Two-Way Binding

This has **no direct React equivalent**. It's like having a prop and its setter bundled together:

```typescript
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-task-card',
  template: `
    <button (click)="completed.set(!completed())">
      {{ completed() ? '✅' : '⬜' }}
    </button>
  `,
})
export class TaskCard {
  // Two-way bindable signal
  completed = model(false);
}
```

Parent uses banana-in-a-box syntax `[()]`:

```html
<!-- Two-way binding: parent's signal stays in sync -->
<app-task-card [(completed)]="task.completed" />
```

When the child calls `completed.set(true)`, the parent's bound value updates automatically. No callback needed.

> **The "banana in a box":** `[()]` is Angular's two-way binding syntax. `[]` for property binding + `()` for event binding = `[()]`. Angular devs affectionately call it "banana in a box" 🍌📦.

## `<ng-content>` — Content Projection (React's `children`)

```typescript
@Component({
  selector: 'app-card',
  template: `
    <div class="border rounded-lg shadow-sm">
      <div class="p-4">
        <ng-content />
      </div>
    </div>
  `,
})
export class Card {}
```

```html
<app-card>
  <h3>Task Title</h3>
  <p>This content gets projected into the card</p>
</app-card>
```

### Named Slots (Multi-Slot Projection)

Angular supports named content slots — like Vue's named slots:

```typescript
@Component({
  selector: 'app-card',
  template: `
    <div class="border rounded-lg">
      <div class="p-4 border-b">
        <ng-content select="[card-header]" />
      </div>
      <div class="p-4">
        <ng-content />
      </div>
      <div class="p-4 border-t">
        <ng-content select="[card-footer]" />
      </div>
    </div>
  `,
})
export class Card {}
```

```html
<app-card>
  <div card-header>
    <h3>Task Title</h3>
  </div>
  <p>Main content here</p>
  <div card-footer>
    <button>Save</button>
  </div>
</app-card>
```

> **React comparison:** React doesn't have named slots. You'd use multiple props (`header={...}`, `footer={...}`) or compound components. Angular's approach is more declarative.

## Putting It Together: TaskList → TaskCard

```typescript
// task-card.ts
export class TaskCard {
  task = input.required<Task>();
  delete = output<string>();
  toggle = output<string>();
}
```

```html
<!-- task-card.html -->
<div class="p-4 border rounded-lg" [class.opacity-50]="task().completed">
  <h3 class="font-semibold">{{ task().title }}</h3>
  <p class="text-gray-600 text-sm">{{ task().description }}</p>
  <div class="mt-2 flex gap-2">
    <button (click)="toggle.emit(task().id)"
            class="text-sm px-2 py-1 bg-blue-100 rounded">
      {{ task().completed ? 'Undo' : 'Complete' }}
    </button>
    <button (click)="delete.emit(task().id)"
            class="text-sm px-2 py-1 bg-red-100 rounded">
      Delete
    </button>
  </div>
</div>
```

```html
<!-- task-list.html -->
@for (task of tasks(); track task.id) {
  <app-task-card
    [task]="task"
    (delete)="removeTask($event)"
    (toggle)="toggleTask($event)"
  />
} @empty {
  <p>No tasks</p>
}
```

## Task

1. Refactor `TaskCard` to accept a `task` via `input.required<Task>()`
2. Add `delete` and `toggle` outputs
3. Update `TaskList` to pass tasks down and handle events:
   - `(delete)` removes the task from the array
   - `(toggle)` flips the task's `completed` status
4. Wire up buttons in `TaskCard` that emit the outputs
5. **Bonus:** Create a reusable `Card` component using `<ng-content>` and wrap your task cards in it

**Hints:**
- Access input values with `task().title`, not `task.title`
- Use `tasks.update(...)` with immutable array operations (filter, map)
- `$event` in the parent template contains the value passed to `emit()`

## What's Next

Your components can communicate, but TaskList holds all the state. As your app grows, this becomes unwieldy. In the next section, you'll learn about **services and dependency injection** — Angular's powerful alternative to React Context.

[← Previous: 03 — Control Flow & Lists](03-control-flow-and-lists.md) · [Next: 05 — Services & DI →](05-services-and-di.md)

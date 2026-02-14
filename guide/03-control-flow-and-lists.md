# 03 — Control Flow & Lists

[← Previous: 02 — Signals & State](02-signals-and-state.md) · [Next: 04 — Component Communication →](04-component-communication.md)

## Goal

Learn Angular's built-in control flow syntax (`@if`, `@for`, `@switch`) and create a TaskList component that renders multiple tasks.

## React Comparison: Conditional & List Rendering

| React | Angular |
|-------|---------|
| `{cond && <div>...</div>}` | `@if (cond) { <div>...</div> }` |
| `{cond ? <A /> : <B />}` | `@if (cond) { <A /> } @else { <B /> }` |
| `{items.map(item => <X key={item.id} />)}` | `@for (item of items; track item.id) { <X /> }` |
| `switch` inside render | `@switch (expr) { @case (val) { ... } }` |
| Empty state check | `@empty { <p>No items</p> }` (built-in!) |

### The Mental Shift

In React, conditional rendering is **JavaScript expressions** inside JSX:

```tsx
{tasks.length > 0 ? (
  tasks.map(task => <TaskCard key={task.id} {...task} />)
) : (
  <p>No tasks yet</p>
)}
```

In Angular, control flow is **template syntax** — special blocks that look like a mini language:

```html
@for (task of tasks(); track task.id) {
  <app-task-card />
} @empty {
  <p>No tasks yet</p>
}
```

It's more verbose but arguably more readable, especially for complex conditions.

## `@if` — Conditional Rendering

```html
@if (isLoggedIn()) {
  <p>Welcome back!</p>
} @else {
  <p>Please log in</p>
}
```

You can chain with `@else if`:

```html
@if (tasks().length === 0) {
  <p>No tasks</p>
} @else if (tasks().length === 1) {
  <p>One task</p>
} @else {
  <p>{{ tasks().length }} tasks</p>
}
```

> **React equivalent:** This replaces the ternary/`&&` patterns. The big advantage: no need to wrap in fragments or deal with falsy value gotchas (`0` rendering as "0" in React).

## `@for` — List Rendering

```html
@for (task of tasks(); track task.id) {
  <div class="task">{{ task.title }}</div>
} @empty {
  <p>No tasks yet. Create one!</p>
}
```

### `track` is Mandatory

Like React's `key`, Angular's `track` tells the framework how to efficiently update the list. **It's required** — you'll get a compile error without it.

```html
<!-- Track by object property -->
@for (task of tasks(); track task.id) { ... }

<!-- Track by index (use when items don't have IDs) -->
@for (task of tasks(); track $index) { ... }
```

### Loop Context Variables

`@for` provides implicit variables (no need to declare them):

| Variable | Description | React Equivalent |
|----------|-------------|-----------------|
| `$index` | Current index | Second arg of `.map()` |
| `$first` | Is first item | `index === 0` |
| `$last` | Is last item | `index === arr.length - 1` |
| `$even` / `$odd` | Even/odd index | `index % 2 === 0` |
| `$count` | Total items | `arr.length` |

```html
@for (task of tasks(); track task.id) {
  <div [class.border-b]="!$last">
    {{ $index + 1 }}. {{ task.title }}
  </div>
}
```

### `@empty` — The Built-in Empty State

This is genuinely nice — no separate `if` check needed:

```html
@for (task of tasks(); track task.id) {
  <app-task-card />
} @empty {
  <div class="text-center text-gray-500 py-8">
    <p>No tasks yet</p>
    <p>Create your first task to get started</p>
  </div>
}
```

React doesn't have this — you'd need a separate conditional check before `.map()`.

## `@switch` — Pattern Matching

```html
@switch (task.priority) {
  @case ('high') {
    <span class="text-red-600 font-bold">High</span>
  }
  @case ('medium') {
    <span class="text-yellow-600">Medium</span>
  }
  @case ('low') {
    <span class="text-green-600">Low</span>
  }
  @default {
    <span class="text-gray-500">Unknown</span>
  }
}
```

> **React equivalent:** A `switch` statement or object lookup in your JSX. Angular's `@switch` is cleaner for template-level branching.

## Defining a Task Model

Before building the list, let's define a proper Task interface. Create `src/app/models/task.model.ts`:

```typescript
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
}
```

> **React comparison:** Same as creating a TypeScript interface in React. No difference here.

## Task

1. Create a `Task` interface in `src/app/models/task.model.ts`
2. Create a `TaskList` component using the CLI
3. In `TaskList`, create a `signal<Task[]>()` with 3-4 sample tasks
4. Render each task using `@for` with `track task.id`
5. Add an `@empty` block for when the list is empty
6. Use `@switch` on `task.priority` to show colored priority badges:
   - High → red badge
   - Medium → yellow badge
   - Low → green badge
7. Use `@if` to show different styling for completed vs. incomplete tasks
8. Display the task count using the `$count` variable or `tasks().length`

**Hints:**
- Generate with `ng generate component task-list`
- Your tasks signal: `tasks = signal<Task[]>([...])`
- Remember `track task.id` — Angular won't compile without it
- You can combine `@for` and `@if` — nest them as needed

## What's Next

Your TaskList renders tasks, but everything is self-contained. In the next section, you'll learn how to pass data between components using `input()`, `output()`, and `model()`.

[← Previous: 02 — Signals & State](02-signals-and-state.md) · [Next: 04 — Component Communication →](04-component-communication.md)

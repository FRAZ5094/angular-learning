# 11 — State Management at Scale

[← Previous: 10 — Authentication](10-authentication.md) · [Next: 12 — Testing & Next Steps →](12-testing-and-next-steps.md)

## Goal

Level up your state management with `linkedSignal()`, computed aggregations, task filtering/sorting, and optimistic updates.

## React Comparison: State Management

| React | Angular | Notes |
|-------|---------|-------|
| Zustand / Redux | Signals + Services | No external library needed for most apps |
| `useReducer` | Signal `update()` | Immutable updates in both |
| Derived selectors (reselect) | `computed()` | Auto-tracked, memoized |
| No equivalent | `linkedSignal()` | Signal that resets when a source changes |
| Optimistic updates (manual) | Optimistic updates (manual) | Same concept, different tools |

### The Angular Advantage

In React, you typically reach for Zustand, Redux, or Jotai once state gets complex. In Angular, **signals + services** handle most state management needs without external libraries. The DI system means services are naturally shared singletons — no store setup required.

## `linkedSignal()` — Reset State When Source Changes

`linkedSignal()` creates a writable signal that **resets** when a source signal changes. This is perfect for filter state tied to routes or selections.

```typescript
import { signal, linkedSignal } from '@angular/core';

export class TaskDashboard {
  // Source: which status filter is active
  statusFilter = signal<'all' | 'pending' | 'completed'>('all');

  // Linked: page number resets to 1 when filter changes
  currentPage = linkedSignal(() => {
    this.statusFilter(); // Track the source
    return 1;            // Reset value
  });
}
```

When `statusFilter` changes, `currentPage` automatically resets to 1. But the user can still manually change `currentPage` (it's writable).

> **React comparison:** There's no equivalent in React. You'd use a `useEffect` to reset page when filter changes, which is error-prone and creates an extra render cycle.

### linkedSignal for Filter Sync with Route Params

```typescript
export class TaskDashboard {
  // Route param becomes the source of truth
  statusParam = input<string>('all');

  // Filter resets when route changes, but is locally writable
  statusFilter = linkedSignal(() => this.statusParam() as 'all' | 'pending' | 'completed');

  // Sort resets when filter changes
  sortOrder = linkedSignal(() => {
    this.statusFilter();
    return 'newest' as const;
  });
}
```

## Computed Aggregations

Build a rich dashboard with computed signals:

```typescript
@Injectable({ providedIn: 'root' })
export class TaskService {
  private _tasks = signal<Task[]>([]);
  tasks = this._tasks.asReadonly();

  // Counts
  totalCount = computed(() => this._tasks().length);
  completedCount = computed(() => this._tasks().filter(t => t.completed).length);
  pendingCount = computed(() => this._tasks().filter(t => !t.completed).length);

  // Counts by priority
  highPriorityCount = computed(() =>
    this._tasks().filter(t => t.priority === 'high' && !t.completed).length
  );

  // Completion rate
  completionRate = computed(() => {
    const total = this.totalCount();
    return total === 0 ? 0 : Math.round((this.completedCount() / total) * 100);
  });

  // Grouped by status
  tasksByStatus = computed(() => ({
    pending: this._tasks().filter(t => !t.completed),
    completed: this._tasks().filter(t => t.completed),
  }));

  // Overdue tasks
  overdueTasks = computed(() =>
    this._tasks().filter(t =>
      !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
    )
  );
}
```

Dashboard template:

```html
<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
  <div class="bg-white p-4 rounded-lg border">
    <p class="text-sm text-gray-500">Total Tasks</p>
    <p class="text-2xl font-bold">{{ taskService.totalCount() }}</p>
  </div>
  <div class="bg-white p-4 rounded-lg border">
    <p class="text-sm text-gray-500">Completed</p>
    <p class="text-2xl font-bold text-green-600">{{ taskService.completedCount() }}</p>
  </div>
  <div class="bg-white p-4 rounded-lg border">
    <p class="text-sm text-gray-500">Pending</p>
    <p class="text-2xl font-bold text-yellow-600">{{ taskService.pendingCount() }}</p>
  </div>
  <div class="bg-white p-4 rounded-lg border">
    <p class="text-sm text-gray-500">Completion Rate</p>
    <p class="text-2xl font-bold text-blue-600">{{ taskService.completionRate() }}%</p>
  </div>
</div>
```

## Filtering and Sorting

```typescript
export class TaskDashboard {
  private taskService = inject(TaskService);

  statusFilter = signal<'all' | 'pending' | 'completed'>('all');
  priorityFilter = signal<'all' | 'low' | 'medium' | 'high'>('all');
  sortBy = signal<'newest' | 'oldest' | 'priority'>('newest');
  searchQuery = signal('');

  filteredTasks = computed(() => {
    let tasks = this.taskService.tasks();

    // Filter by status
    const status = this.statusFilter();
    if (status === 'pending') tasks = tasks.filter(t => !t.completed);
    if (status === 'completed') tasks = tasks.filter(t => t.completed);

    // Filter by priority
    const priority = this.priorityFilter();
    if (priority !== 'all') tasks = tasks.filter(t => t.priority === priority);

    // Search
    const query = this.searchQuery().toLowerCase();
    if (query) {
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    // Sort
    const sort = this.sortBy();
    if (sort === 'newest') {
      tasks = [...tasks].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sort === 'oldest') {
      tasks = [...tasks].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sort === 'priority') {
      const order = { high: 0, medium: 1, low: 2 };
      tasks = [...tasks].sort((a, b) => order[a.priority] - order[b.priority]);
    }

    return tasks;
  });

  filteredCount = computed(() => this.filteredTasks().length);
}
```

Template filter controls:

```html
<div class="flex gap-4 mb-4">
  <input
    [value]="searchQuery()"
    (input)="searchQuery.set($any($event.target).value)"
    placeholder="Search tasks..."
    class="border rounded px-3 py-2"
  />

  <select
    [value]="statusFilter()"
    (change)="statusFilter.set($any($event.target).value)"
    class="border rounded px-3 py-2"
  >
    <option value="all">All Status</option>
    <option value="pending">Pending</option>
    <option value="completed">Completed</option>
  </select>

  <select
    [value]="priorityFilter()"
    (change)="priorityFilter.set($any($event.target).value)"
    class="border rounded px-3 py-2"
  >
    <option value="all">All Priorities</option>
    <option value="high">High</option>
    <option value="medium">Medium</option>
    <option value="low">Low</option>
  </select>

  <select
    [value]="sortBy()"
    (change)="sortBy.set($any($event.target).value)"
    class="border rounded px-3 py-2"
  >
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
    <option value="priority">Priority</option>
  </select>
</div>

<p class="text-sm text-gray-500 mb-4">
  Showing {{ filteredCount() }} of {{ taskService.totalCount() }} tasks
</p>
```

## Optimistic Updates

Update the UI immediately, then sync with the server. If the server fails, roll back.

```typescript
toggleTask(id: string) {
  const tasks = this._tasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const updatedTask = { ...task, completed: !task.completed };

  // Optimistic: update UI immediately
  this._tasks.update(ts => ts.map(t => t.id === id ? updatedTask : t));

  // Sync with server
  this.http.put(`${this.apiUrl}/${id}`, updatedTask).subscribe({
    error: () => {
      // Rollback on failure
      this._tasks.update(ts => ts.map(t => t.id === id ? task : t));
    },
  });
}

deleteTask(id: string) {
  const tasks = this._tasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // Optimistic: remove from UI
  this._tasks.update(ts => ts.filter(t => t.id !== id));

  // Sync with server
  this.http.delete(`${this.apiUrl}/${id}`).subscribe({
    error: () => {
      // Rollback: add back
      this._tasks.update(ts => [...ts, task]);
    },
  });
}
```

> **React comparison:** Same pattern as TanStack Query's `onMutate` + `onError` rollback. The signal-based approach is simpler — you directly mutate the signal and roll back if needed.

## Task

1. Add dashboard summary cards with computed aggregations:
   - Total, completed, pending counts
   - Completion rate percentage
   - High priority pending count
2. Implement task filtering:
   - By status (all / pending / completed)
   - By priority (all / low / medium / high)
   - Search by title/description
3. Implement task sorting:
   - Newest first, oldest first, by priority
4. Use `linkedSignal()` somewhere meaningful (e.g., page resets when filter changes, or sort resets when status filter changes)
5. Implement optimistic updates for toggle and delete operations
6. Show "Showing X of Y tasks" count

**Hints:**
- All filtered/sorted data should be `computed()` signals — they auto-update
- Use `[value]` + `(change)` for binding select/input controls to signals
- `$any($event.target).value` is the quick way to get typed values from native events
- For optimistic updates, save the old state before modifying, then roll back in the error handler

## What's Next

Your TaskFlow app is feature-complete! In the final section, you'll learn how to test it with Vitest and TestBed, and explore where to go next.

[← Previous: 10 — Authentication](10-authentication.md) · [Next: 12 — Testing & Next Steps →](12-testing-and-next-steps.md)

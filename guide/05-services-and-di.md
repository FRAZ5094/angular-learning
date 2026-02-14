# 05 — Services & Dependency Injection

[← Previous: 04 — Component Communication](04-component-communication.md) · [Next: 06 — Routing →](06-routing.md)

## Goal

Understand Angular's dependency injection system, create a `TaskService` to manage state, and refactor your components to be thin presentation layers.

## This is the Key Mental Model Shift

If you take one thing from this guide, let it be this:

> **In React**, state lives in components and you pass it down (or use Context to avoid prop drilling).
>
> **In Angular**, state lives in **services** and components **inject** them. Services are the backbone of an Angular app.

This isn't just a different syntax — it's a fundamentally different architecture. Angular services are:
- **Automatically singletons** (one instance shared across the entire app)
- **Available everywhere** via dependency injection (no `<Provider>` wrapping)
- **Where your business logic lives** (components become thin UI layers)

## React Comparison: State Management

| React | Angular |
|-------|---------|
| `createContext()` + `<Provider>` | `@Injectable({ providedIn: 'root' })` |
| `useContext(MyContext)` | `inject(TaskService)` |
| Custom hook (`useTaskManager()`) | Service method (`taskService.addTask()`) |
| Context value object | Service instance |
| Provider nesting | Flat — just `inject()` anywhere |

### React Context Pattern

```tsx
// React: Context + Provider + Hook
const TaskContext = createContext(null);

function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const addTask = (task) => setTasks(prev => [...prev, task]);
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  return (
    <TaskContext.Provider value={{ tasks, addTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
}

function useTaskManager() {
  return useContext(TaskContext);
}

// Must wrap app in provider
function App() {
  return (
    <TaskProvider>
      <TaskList />
    </TaskProvider>
  );
}
```

### Angular Service Pattern

```typescript
// Angular: Service + inject()
@Injectable({ providedIn: 'root' })
export class TaskService {
  tasks = signal<Task[]>([]);

  addTask(task: Task) {
    this.tasks.update(prev => [...prev, task]);
  }

  deleteTask(id: string) {
    this.tasks.update(prev => prev.filter(t => t.id !== id));
  }
}

// No provider wrapping needed — just inject
export class TaskList {
  private taskService = inject(TaskService);
  tasks = this.taskService.tasks;
}
```

**What's better:**
- No `<Provider>` component needed
- No context nesting hell
- Service is automatically a singleton — one instance for the whole app
- Any component, any depth, just calls `inject()`. No prop drilling, no `useContext()`.

## Creating a Service

```bash
ng generate service task
```

This creates `src/app/task.service.ts`:

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Task } from './models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  // Private writable signal
  private _tasks = signal<Task[]>([]);

  // Public read-only access
  tasks = this._tasks.asReadonly();

  // Computed values
  completedCount = computed(() =>
    this._tasks().filter(t => t.completed).length
  );

  pendingCount = computed(() =>
    this._tasks().filter(t => !t.completed).length
  );

  addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this._tasks.update(tasks => [...tasks, newTask]);
  }

  deleteTask(id: string) {
    this._tasks.update(tasks => tasks.filter(t => t.id !== id));
  }

  toggleTask(id: string) {
    this._tasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }

  getTask(id: string) {
    return this._tasks().find(t => t.id === id);
  }
}
```

### Key Patterns

**`@Injectable({ providedIn: 'root' })`** — Registers this service at the application root. Angular creates one instance and shares it everywhere. No setup needed.

**`signal()` + `.asReadonly()`** — The service owns the writable signal. Components get a read-only view. This prevents components from directly mutating state (like Redux's principle of dispatching actions).

**`computed()`** — Derived state lives in the service too. Components just read computed values.

## Injecting a Service

Use the `inject()` function:

```typescript
import { inject } from '@angular/core';
import { TaskService } from './task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.html',
})
export class TaskList {
  private taskService = inject(TaskService);

  // Expose what the template needs
  tasks = this.taskService.tasks;
  pendingCount = this.taskService.pendingCount;

  addTask() {
    this.taskService.addTask({
      title: 'New Task',
      description: 'Description here',
      priority: 'medium',
      completed: false,
    });
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id);
  }

  toggleTask(id: string) {
    this.taskService.toggleTask(id);
  }
}
```

> **`inject()` vs constructor injection:** Older Angular code uses `constructor(private taskService: TaskService)`. The `inject()` function is the modern way — it's more explicit and works in non-class contexts like functional guards.

## Components Become Thin

After extracting state to a service, your components are simple:

```typescript
// TaskCard — just displays data and emits events
export class TaskCard {
  task = input.required<Task>();
  delete = output<string>();
  toggle = output<string>();
}

// TaskList — connects service to template
export class TaskList {
  private taskService = inject(TaskService);
  tasks = this.taskService.tasks;
  // ... delegates to service methods
}
```

Components handle **presentation**. Services handle **state and logic**. This separation makes testing easier too — you can test services without DOM, and test components with mock services.

## Multiple Components, Same Service

Any component that injects `TaskService` gets the **same instance**:

```typescript
// Dashboard component — different component, same data
export class Dashboard {
  private taskService = inject(TaskService);
  completedCount = this.taskService.completedCount;
  pendingCount = this.taskService.pendingCount;
}

// Header component — also same data
export class AppHeader {
  private taskService = inject(TaskService);
  totalTasks = computed(() => this.taskService.tasks().length);
}
```

No prop drilling. No context providers. Just inject.

## Task

1. Generate a `TaskService` using the CLI: `ng generate service task`
2. Move all task state and CRUD methods into the service:
   - `tasks` signal (with some sample data)
   - `addTask()`, `deleteTask()`, `toggleTask()`, `getTask()`
   - `completedCount` and `pendingCount` computed signals
3. Refactor `TaskList` to inject `TaskService` and delegate to it
4. Refactor `TaskCard` to be a pure presentation component (input/output only)
5. Add a "New Task" button that calls `taskService.addTask()` with sample data
6. Verify that adding/deleting/toggling tasks works and the counts update

**Hints:**
- Use `crypto.randomUUID()` for generating IDs
- Start with a few hardcoded sample tasks in the service
- The service should use `signal()` for the task list and `computed()` for counts
- Components should have minimal logic — just wire service methods to template events

## What's Next

Your app has one page. In the next section, you'll add routing to create a multi-page app with a dashboard, task detail view, and navigation.

[← Previous: 04 — Component Communication](04-component-communication.md) · [Next: 06 — Routing →](06-routing.md)

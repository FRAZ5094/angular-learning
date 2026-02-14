# 09 — HTTP & Data

[← Previous: 08 — Pipes & Directives](08-pipes-and-directives.md) · [Next: 10 — Authentication →](10-authentication.md)

## Goal

Add data persistence to TaskFlow, progressing from localStorage to a mock API with `httpResource()`.

## The Progression

We'll evolve data handling in three steps:
1. **localStorage** — Persist data across page refreshes (quick win)
2. **json-server** — Mock REST API for realistic development
3. **`httpResource()`** — Angular's declarative data fetching for reads, `HttpClient` for writes

## React Comparison: Data Fetching

| React | Angular | Notes |
|-------|---------|-------|
| `useEffect` + `fetch` | `HttpClient.get()` | Imperative HTTP |
| SWR / TanStack Query | `httpResource()` | Declarative, cached, reactive |
| `useSWR('/api/tasks')` | `httpResource('/api/tasks')` | Similar mental model |
| Axios interceptors | HTTP interceptors | Request/response middleware |
| No built-in | `HttpClient` | Full-featured HTTP client in framework |

## Step 1: localStorage Persistence

The quickest way to persist data. Use `effect()` to sync state to localStorage:

```typescript
@Injectable({ providedIn: 'root' })
export class TaskService {
  private _tasks = signal<Task[]>(this.loadFromStorage());

  constructor() {
    // Auto-save whenever tasks change
    effect(() => {
      localStorage.setItem('taskflow-tasks', JSON.stringify(this._tasks()));
    });
  }

  private loadFromStorage(): Task[] {
    const stored = localStorage.getItem('taskflow-tasks');
    if (!stored) return [];
    return JSON.parse(stored);
  }

  // ... rest of CRUD methods unchanged
}
```

> **React equivalent:** You'd use a `useEffect` to sync state to localStorage, or a library like `use-local-storage-state`. The Angular version is cleaner because the service persists across the entire app lifecycle.

## Step 2: Set Up json-server

[json-server](https://github.com/typicode/json-server) gives you a full REST API from a JSON file — perfect for prototyping.

```bash
npm install -D json-server
```

Create `db.json` in the project root:

```json
{
  "tasks": [
    {
      "id": "1",
      "title": "Set up project",
      "description": "Initialize Angular app with Tailwind",
      "priority": "high",
      "completed": true,
      "createdAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "id": "2",
      "title": "Build task list",
      "description": "Create components to display tasks",
      "priority": "medium",
      "completed": false,
      "createdAt": "2025-01-15T11:00:00.000Z"
    },
    {
      "id": "3",
      "title": "Add authentication",
      "description": "Implement login and registration",
      "priority": "high",
      "completed": false,
      "createdAt": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

Add a script to `package.json`:

```json
{
  "scripts": {
    "api": "json-server --watch db.json --port 3001"
  }
}
```

Run it:

```bash
npm run api
```

Now you have a REST API at `http://localhost:3001`:
- `GET /tasks` — list all tasks
- `GET /tasks/1` — get task by ID
- `POST /tasks` — create task
- `PUT /tasks/1` — update task
- `DELETE /tasks/1` — delete task

## Step 3: `httpResource()` — Declarative Data Fetching

`httpResource()` is Angular's built-in equivalent to React's TanStack Query / SWR. It creates a reactive resource that:
- Fetches data automatically
- Re-fetches when parameters change (signal-based)
- Provides loading, error, and value states
- Works with signals natively

### Setup: Provide HttpClient

In `app.config.ts`:

```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
  ],
};
```

### Using httpResource for Reads

```typescript
import { httpResource } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:3001/tasks';

  // Declarative data fetching — like useSWR or useQuery
  tasksResource = httpResource<Task[]>(() => this.apiUrl);

  // Access the data
  tasks = computed(() => this.tasksResource.value() ?? []);

  // Check loading state
  isLoading = computed(() => this.tasksResource.isLoading());
}
```

In your template:

```html
@if (isLoading()) {
  <div class="text-center py-8">Loading tasks...</div>
} @else {
  @for (task of tasks(); track task.id) {
    <app-task-card [task]="task" />
  } @empty {
    <p>No tasks yet</p>
  }
}
```

### httpResource with Dynamic Parameters

```typescript
export class TaskDetail {
  id = input.required<string>();

  // Re-fetches automatically when id() changes
  taskResource = httpResource<Task>(() => `http://localhost:3001/tasks/${this.id()}`);

  task = computed(() => this.taskResource.value());
  isLoading = computed(() => this.taskResource.isLoading());
  error = computed(() => this.taskResource.error());
}
```

> **React comparison:** This is like `useSWR(() => '/api/tasks/' + id)` — the URL is reactive and refetches on change.

### HttpClient for Writes (Mutations)

`httpResource()` is for reads (GET). For writes (POST, PUT, DELETE), use `HttpClient`:

```typescript
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/tasks';

  tasksResource = httpResource<Task[]>(() => this.apiUrl);
  tasks = computed(() => this.tasksResource.value() ?? []);

  addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const newTask = { ...task, id: crypto.randomUUID(), createdAt: new Date() };

    this.http.post<Task>(this.apiUrl, newTask).subscribe(() => {
      // Refresh the resource after mutation
      this.tasksResource.reload();
    });
  }

  deleteTask(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.tasksResource.reload();
    });
  }

  toggleTask(id: string) {
    const task = this.tasks().find(t => t.id === id);
    if (!task) return;

    this.http.put(`${this.apiUrl}/${id}`, { ...task, completed: !task.completed })
      .subscribe(() => this.tasksResource.reload());
  }
}
```

> **Note:** Angular's `HttpClient` returns Observables. For simple mutations, `.subscribe()` is fine. We're not diving deep into RxJS in this guide — signals cover most reactive needs.

## HTTP Interceptors

Interceptors are middleware for HTTP requests. They can modify requests, handle errors, add headers, etc.

```typescript
// error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      console.error('HTTP Error:', error.status, error.message);
      // You could show a toast notification here
      throw error;
    })
  );
};
```

Register it in `app.config.ts`:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([errorInterceptor])),
    // ...
  ],
};
```

> **React comparison:** This is like Axios interceptors but framework-level. Every HTTP request goes through registered interceptors automatically.

## Task

1. **Step 1:** Add localStorage persistence to `TaskService`:
   - Load initial data from localStorage
   - Use `effect()` to auto-save on changes
   - Verify data survives page refresh
2. **Step 2:** Set up json-server:
   - Install `json-server`
   - Create `db.json` with sample tasks
   - Add `"api"` script to `package.json`
3. **Step 3:** Migrate to `httpResource()`:
   - Add `provideHttpClient()` to app config
   - Replace the signal with `httpResource<Task[]>()` for reads
   - Use `HttpClient` for addTask, deleteTask, toggleTask
   - Call `resource.reload()` after mutations
4. Add loading states to your templates
5. Create an error interceptor for basic error logging

**Hints:**
- Run `ng serve` and `npm run api` in separate terminals
- `httpResource()` returns a resource with `.value()`, `.isLoading()`, `.error()`
- After POST/PUT/DELETE, call `.reload()` on the resource to refresh
- Import `catchError` from `rxjs/operators` for the interceptor

## What's Next

Your data is persisted and fetched from an API. In the next section, you'll add authentication — login, registration, JWT tokens, and route protection.

[← Previous: 08 — Pipes & Directives](08-pipes-and-directives.md) · [Next: 10 — Authentication →](10-authentication.md)

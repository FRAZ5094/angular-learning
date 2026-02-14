# 06 — Routing

[← Previous: 05 — Services & DI](05-services-and-di.md) · [Next: 07 — Forms →](07-forms.md)

## Goal

Add client-side routing to create a multi-page TaskFlow app with a dashboard, task detail page, and navigation bar.

## React Comparison: Routing

| React / Next.js | Angular |
|-----------------|---------|
| File-based routing (`app/tasks/page.tsx`) | Explicit route config (`app.routes.ts`) |
| `<Link href="/tasks/123">` | `<a routerLink="/tasks/123">` |
| `useParams()` hook | `input()` bound from route params |
| `useRouter()` for programmatic nav | `inject(Router)` |
| Dynamic routes (`[id]/page.tsx`) | Route params (`:id`) |
| `loading.tsx` | Resolvers or loading states |
| Middleware | Guards and interceptors |
| `React.lazy()` | `loadComponent` in routes |

### The Mental Shift

Next.js uses **file-system routing** — your folder structure IS your routes.

Angular uses **explicit route configuration** — you define routes in a TypeScript file. More verbose but gives you full control over route guards, resolvers, lazy loading, and nested routes.

## Route Configuration

Routes live in `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
  },
  {
    path: 'tasks/new',
    loadComponent: () => import('./task-form/task-form').then(m => m.TaskForm),
  },
  {
    path: 'tasks/:id',
    loadComponent: () => import('./task-detail/task-detail').then(m => m.TaskDetail),
  },
];
```

### Key Concepts

**`path`** — The URL segment. No leading slash. `''` is the root.

**`loadComponent`** — Lazy loads the component. Angular only downloads the code when the user navigates to this route. This is like Next.js's automatic code splitting, but explicit.

> You can also use `component: Dashboard` for eager loading, but lazy loading is preferred for performance.

**`:id`** — Route parameter. Matches any value (e.g., `/tasks/abc-123`).

## `<router-outlet>` — Where Pages Render

The `<router-outlet>` is like React's `{children}` in a layout — it's the placeholder where routed components appear:

```html
<!-- app.html -->
<app-navbar />

<main class="max-w-4xl mx-auto p-4">
  <router-outlet />
</main>
```

```typescript
// app.ts
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
})
export class App {}
```

## Navigation

### Template Navigation with `routerLink`

```html
<a routerLink="/">Dashboard</a>
<a routerLink="/tasks/new">New Task</a>
<a [routerLink]="['/tasks', task.id]">View Task</a>
```

To highlight the active link:

```html
<a routerLink="/"
   routerLinkActive="text-blue-600 font-bold"
   [routerLinkActiveOptions]="{ exact: true }">
  Dashboard
</a>
```

> **React comparison:** `routerLink` ≈ Next.js `<Link href="...">`. `routerLinkActive` ≈ checking `usePathname()` manually.

Don't forget to import the directives:

```typescript
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive],
  // ...
})
```

### Programmatic Navigation

```typescript
import { Router } from '@angular/router';

export class TaskForm {
  private router = inject(Router);

  onSubmit() {
    // Save task...
    this.router.navigate(['/']);
  }
}
```

## Reading Route Parameters

Angular 21 can bind route params directly to component inputs:

```typescript
// In app.config.ts — enable input binding
import { withComponentInputBinding } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    // ...
  ],
};
```

Then in your component:

```typescript
@Component({
  selector: 'app-task-detail',
  template: `
    @if (task(); as task) {
      <h1>{{ task.title }}</h1>
      <p>{{ task.description }}</p>
    } @else {
      <p>Task not found</p>
    }
  `,
})
export class TaskDetail {
  // Route param ':id' binds to this input automatically
  id = input.required<string>();

  private taskService = inject(TaskService);

  task = computed(() => this.taskService.getTask(this.id()));
}
```

> **React comparison:** `useParams().id` → `id = input.required<string>()`. The route param name must match the input name.

## Lazy Loading

Every route in our config uses `loadComponent`, which means the component's code is only downloaded when the user navigates there:

```typescript
{
  path: 'tasks/:id',
  loadComponent: () => import('./task-detail/task-detail').then(m => m.TaskDetail),
}
```

> **React comparison:** This is like `React.lazy(() => import('./TaskDetail'))` but built into the router. Next.js does this automatically per page; Angular does it per route when you use `loadComponent`.

## A Navigation Bar

Create a simple navbar component:

```typescript
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white border-b px-4 py-3">
      <div class="max-w-4xl mx-auto flex items-center gap-6">
        <a routerLink="/" class="text-xl font-bold text-gray-900">TaskFlow</a>
        <a routerLink="/"
           routerLinkActive="text-blue-600"
           [routerLinkActiveOptions]="{ exact: true }"
           class="text-gray-600 hover:text-gray-900">
          Dashboard
        </a>
        <a routerLink="/tasks/new"
           routerLinkActive="text-blue-600"
           class="text-gray-600 hover:text-gray-900">
          New Task
        </a>
      </div>
    </nav>
  `,
})
export class Navbar {}
```

## Task

1. Create three page components:
   - `Dashboard` — shows the task list (move existing task list here)
   - `TaskDetail` — shows a single task by route param `:id`
   - `TaskForm` — placeholder for now (will build in section 07)
2. Create a `Navbar` component with links to Dashboard and New Task
3. Configure routes in `app.routes.ts` with lazy loading
4. Update `app.html` to use `<app-navbar />` and `<router-outlet />`
5. Enable `withComponentInputBinding()` in `app.config.ts`
6. On the task detail page, use the `id` input + `TaskService.getTask()` to display task info
7. Add "View" links on each task card that navigate to `/tasks/:id`

**Hints:**
- Generate components: `ng generate component dashboard`, etc.
- Import `RouterLink` and `RouterLinkActive` in components that use links
- Import `RouterOutlet` in `App`
- Route params are strings — your `getTask()` method should accept a string ID
- Use `@if (task(); as task)` to safely unwrap the computed task signal

## What's Next

You have a "New Task" page but no form yet. In the next section, you'll learn Angular's reactive forms — one of Angular's strongest features compared to React.

[← Previous: 05 — Services & DI](05-services-and-di.md) · [Next: 07 — Forms →](07-forms.md)

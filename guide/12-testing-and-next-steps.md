# 12 — Testing & Next Steps

[← Previous: 11 — State Management](11-state-management.md)

## Goal

Learn how to test Angular components, services, and guards with Vitest and TestBed. Then, explore what's next for your Angular journey.

## React Comparison: Testing

| React | Angular | Notes |
|-------|---------|-------|
| Jest | Vitest | Angular 21 defaults to Vitest |
| React Testing Library | TestBed + fixture | TestBed creates a mini Angular environment |
| `render(<Component />)` | `TestBed.createComponent(Component)` | TestBed manages DI automatically |
| `screen.getByText(...)` | `fixture.nativeElement.querySelector(...)` | Direct DOM queries |
| Mock with `jest.mock()` | Provide mock services in TestBed | DI makes mocking natural |
| `@testing-library/user-event` | `fixture.nativeElement.click()` + `detectChanges()` | Manual trigger + change detection |

### The Mental Shift

In React, testing is mostly about rendering a component and asserting on its output. Mocking dependencies means mocking modules.

In Angular, **TestBed** creates a mini dependency injection container for your test. You can swap real services for mocks by providing them in the test config. This makes service mocking much more natural — it's just DI.

## Testing Setup

Angular 21 uses Vitest by default. Your project is already configured — just run:

```bash
ng test
```

Or for watch mode:

```bash
ng test --watch
```

## Testing a Service

Services are the easiest to test — they're just TypeScript classes:

```typescript
// task.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  it('should start with an empty task list', () => {
    expect(service.tasks()).toEqual([]);
  });

  it('should add a task', () => {
    service.addTask({
      title: 'Test Task',
      description: 'A test',
      priority: 'medium',
      completed: false,
    });

    expect(service.tasks().length).toBe(1);
    expect(service.tasks()[0].title).toBe('Test Task');
  });

  it('should delete a task', () => {
    service.addTask({
      title: 'To Delete',
      description: '',
      priority: 'low',
      completed: false,
    });
    const taskId = service.tasks()[0].id;

    service.deleteTask(taskId);

    expect(service.tasks().length).toBe(0);
  });

  it('should toggle task completion', () => {
    service.addTask({
      title: 'Toggle Me',
      description: '',
      priority: 'high',
      completed: false,
    });
    const taskId = service.tasks()[0].id;

    service.toggleTask(taskId);

    expect(service.tasks()[0].completed).toBe(true);
  });

  it('should compute correct counts', () => {
    service.addTask({ title: 'A', description: '', priority: 'high', completed: false });
    service.addTask({ title: 'B', description: '', priority: 'low', completed: true });

    expect(service.completedCount()).toBe(1);
    expect(service.pendingCount()).toBe(1);
  });
});
```

### Why TestBed for a Service?

You could test services with plain `new TaskService()`, but TestBed:
- Manages dependency injection (if the service depends on other services)
- Provides `HttpClient` mocking via `provideHttpClientTesting()`
- Matches how Angular actually creates and provides the service

## Testing a Component

```typescript
// task-card.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCard } from './task-card';
import { Task } from '../models/task.model';

describe('TaskCard', () => {
  let component: TaskCard;
  let fixture: ComponentFixture<TaskCard>;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'A test task',
    priority: 'high',
    completed: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCard);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();
  });

  it('should display the task title', () => {
    const titleEl = fixture.nativeElement.querySelector('h3');
    expect(titleEl.textContent).toContain('Test Task');
  });

  it('should display the priority', () => {
    const el = fixture.nativeElement;
    expect(el.textContent).toContain('high');
  });

  it('should emit delete event', () => {
    const spy = vi.fn();
    component.delete.subscribe(spy);

    const deleteBtn = fixture.nativeElement.querySelector('[data-testid="delete-btn"]');
    deleteBtn.click();

    expect(spy).toHaveBeenCalledWith('1');
  });

  it('should emit toggle event', () => {
    const spy = vi.fn();
    component.toggle.subscribe(spy);

    const toggleBtn = fixture.nativeElement.querySelector('[data-testid="toggle-btn"]');
    toggleBtn.click();

    expect(spy).toHaveBeenCalledWith('1');
  });
});
```

### Key Testing Concepts

**`fixture.componentRef.setInput('task', mockTask)`** — Sets component inputs in tests. This is the modern way (not `component.task = ...`).

**`fixture.detectChanges()`** — Triggers change detection. In zoneless mode, you need to call this after setting inputs or triggering events.

**`fixture.nativeElement`** — The actual DOM element. Query it like regular DOM.

**`data-testid` attributes** — Add these to your templates for reliable test selectors:

```html
<button data-testid="delete-btn" (click)="delete.emit(task().id)">Delete</button>
```

## Testing a Guard

Guards are just functions — they're straightforward to test:

```typescript
// auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: { createUrlTree: vi.fn((commands) => commands) } },
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow access when logged in', () => {
    // Simulate logged-in state
    vi.spyOn(authService, 'isLoggedIn').mockReturnValue(true as any);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
  });

  it('should redirect to login when not logged in', () => {
    vi.spyOn(authService, 'isLoggedIn').mockReturnValue(false as any);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
```

**`TestBed.runInInjectionContext()`** — Runs code in an injection context, which is needed because guards use `inject()`.

## Testing with HttpClient

For services that use `HttpClient`:

```typescript
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('TaskService (HTTP)', () => {
  let service: TaskService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(TaskService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify(); // Ensure no unexpected requests
  });

  it('should delete a task via HTTP', () => {
    service.deleteTask('1');

    const req = httpTesting.expectOne('http://localhost:3001/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null); // Simulate server response
  });
});
```

## Testing Tips

1. **Test behavior, not implementation** — test what the component does, not how it does it
2. **Use `data-testid`** — more reliable than CSS class selectors
3. **Prefer service tests** — services are where the logic lives; they're easy to test
4. **Mock external dependencies** — use TestBed's DI to provide mock services
5. **Keep tests focused** — one assertion per test (or closely related assertions)

## What's Next

Congratulations! You've built a complete Angular application with:

- Components and templates
- Signal-based reactive state
- Built-in control flow
- Component communication
- Services and dependency injection
- Client-side routing
- Reactive forms with validation
- Custom pipes and directives
- HTTP data fetching with `httpResource()`
- Authentication with guards and interceptors
- Advanced state management
- Testing with Vitest

### Continue Learning

Here are areas to explore as you go deeper:

**Server-Side Rendering (SSR)**
Angular supports SSR out of the box. Run `ng add @angular/ssr` to add it. It's similar to Next.js's SSR but integrated into the Angular CLI.

**Animations**
Angular has a powerful `@angular/animations` module for declarative animations — transitions, keyframes, route animations. More structured than CSS transitions.

**NgRx / Signal Store**
For very complex state management, explore [NgRx SignalStore](https://ngrx.io/guide/signals). It builds on Angular signals with patterns like entities, features, and effects. Think of it as Redux for Angular, but signal-based.

**Internationalization (i18n)**
Angular has built-in i18n support. Mark strings in templates with `i18n` attributes and Angular handles extraction and translation.

**Angular Material / CDK**
[Angular Material](https://material.angular.io/) is the official component library. The CDK (Component Dev Kit) provides unstyled building blocks (drag-and-drop, virtual scrolling, overlays) that work with any styling.

**Deployment**
- `ng build` creates a production bundle
- Deploy to Vercel, Netlify, Firebase, or any static host
- For SSR, deploy to Node.js-compatible hosts

### Resources

- [Angular Docs](https://angular.dev) — The official docs, completely rewritten and very good
- [Angular Blog](https://blog.angular.dev) — Release notes and deep dives
- [Angular YouTube](https://youtube.com/@Angular) — Official tutorials and conference talks

### Key Takeaways for React Developers

1. **Services > Context** — Angular's DI is more powerful and easier to use than React Context
2. **Signals > useState** — No dependency arrays, fine-grained updates, auto-tracking
3. **Forms are first-class** — Reactive forms beat any React form library
4. **The CLI is your friend** — `ng generate`, `ng serve`, `ng test`, `ng build`
5. **Templates are HTML-first** — Different from JSX, but equally powerful
6. **Route guards are framework-level** — More structured than middleware or HOCs
7. **Less library shopping** — Angular includes routing, forms, HTTP, testing, i18n, animations

You came from React. Now you know Angular. Go build something great.

[← Previous: 11 — State Management](11-state-management.md)

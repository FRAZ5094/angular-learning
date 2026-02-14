# 07 — Forms

[← Previous: 06 — Routing](06-routing.md) · [Next: 08 — Pipes & Directives →](08-pipes-and-directives.md)

## Goal

Build a task creation form using Angular's reactive forms with validation, error display, and form status tracking.

## Angular's Killer Feature

Forms in React are painful. You either manage state manually with controlled inputs, or bring in a library like React Hook Form or Formik. Even then, validation, error states, and form status are your problem.

Angular has **reactive forms built into the framework**. No external libraries needed. Built-in validation, status tracking, error handling, dynamic form controls — all first-class.

## React Comparison: Forms

| React | Angular | Notes |
|-------|---------|-------|
| Controlled input + `useState` | `FormControl` + `formControlName` | Angular tracks state, validity, dirty/pristine |
| React Hook Form `useForm()` | `FormGroup` | Groups of controls with combined validation |
| Yup/Zod schema | `Validators` | Built-in validators + custom validator functions |
| `formState.errors` | `form.get('field')?.errors` | Auto-populated error object |
| `formState.isValid` | `form.valid` | Also: `invalid`, `pending`, `dirty`, `touched` |
| Manual `onSubmit` | `(ngSubmit)="onSubmit()"` | Prevents default, fires on Enter |
| No built-in | `form.statusChanges` | Observable of form status changes |

### React Form Pain vs Angular Forms

```tsx
// React: Manual everything
function TaskForm() {
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.length < 3) {
      setTitleError('Title must be at least 3 characters');
      return;
    }
    // submit...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      {titleError && <span>{titleError}</span>}
    </form>
  );
}
```

```typescript
// Angular: Declarative
export class TaskForm {
  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    priority: new FormControl<'low' | 'medium' | 'high'>('medium'),
  });

  onSubmit() {
    if (this.form.valid) {
      // submit with this.form.value
    }
  }
}
```

Angular knows about validity, dirty/pristine, touched/untouched — automatically.

## Reactive Forms Basics

### Setting Up

Import `ReactiveFormsModule` in your component:

```typescript
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.html',
})
export class TaskForm {
  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl(''),
    priority: new FormControl<'low' | 'medium' | 'high'>('medium'),
    dueDate: new FormControl<string>(''),
  });
}
```

### Template

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
  <!-- Title field -->
  <div>
    <label for="title" class="block text-sm font-medium text-gray-700">
      Title
    </label>
    <input
      id="title"
      formControlName="title"
      class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border"
      placeholder="Enter task title"
    />
    @if (form.get('title')?.invalid && form.get('title')?.touched) {
      <div class="text-red-600 text-sm mt-1">
        @if (form.get('title')?.hasError('required')) {
          Title is required
        } @else if (form.get('title')?.hasError('minlength')) {
          Title must be at least 3 characters
        }
      </div>
    }
  </div>

  <!-- Priority select -->
  <div>
    <label for="priority" class="block text-sm font-medium text-gray-700">
      Priority
    </label>
    <select
      id="priority"
      formControlName="priority"
      class="mt-1 block w-full rounded border-gray-300 px-3 py-2 border"
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  </div>

  <!-- Submit -->
  <button
    type="submit"
    [disabled]="form.invalid"
    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
  >
    Create Task
  </button>
</form>
```

### Key Concepts

**`[formGroup]="form"`** — Binds the form element to your `FormGroup` instance.

**`formControlName="title"`** — Connects the input to a specific `FormControl` in the group. Angular automatically syncs the input's value, validates it, and tracks its state.

**`(ngSubmit)`** — Like React's `onSubmit` but automatically prevents default.

**`form.get('title')?.invalid`** — Check if a specific control is invalid.

**`form.get('title')?.touched`** — Has the user focused and blurred this field? Useful for showing errors only after interaction.

**`[disabled]="form.invalid"`** — Disable submit until the whole form is valid.

## Built-in Validators

```typescript
import { Validators } from '@angular/forms';

new FormControl('', [
  Validators.required,           // Must not be empty
  Validators.minLength(3),       // At least 3 chars
  Validators.maxLength(100),     // At most 100 chars
  Validators.email,              // Valid email format
  Validators.pattern(/^[a-z]+$/), // Regex match
  Validators.min(1),             // Minimum number
  Validators.max(100),           // Maximum number
]);
```

## Custom Validators

```typescript
function futureDateValidator(control: FormControl): { [key: string]: boolean } | null {
  if (!control.value) return null;
  const date = new Date(control.value);
  return date > new Date() ? null : { pastDate: true };
}

// Usage
dueDate: new FormControl('', [futureDateValidator]),
```

```html
@if (form.get('dueDate')?.hasError('pastDate')) {
  Due date must be in the future
}
```

## Form Status Properties

Every `FormControl` and `FormGroup` has these properties:

| Property | Description |
|----------|-------------|
| `valid` / `invalid` | Passes all validators? |
| `dirty` / `pristine` | Has the value been changed? |
| `touched` / `untouched` | Has the field been focused and blurred? |
| `errors` | Object of current validation errors |
| `value` | Current value |
| `status` | `'VALID'`, `'INVALID'`, `'PENDING'`, `'DISABLED'` |

> **React comparison:** React Hook Form provides similar properties (`isDirty`, `isValid`, `errors`). Angular has them built in without any library.

## Submitting the Form

```typescript
export class TaskForm {
  private taskService = inject(TaskService);
  private router = inject(Router);

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl(''),
    priority: new FormControl<'low' | 'medium' | 'high'>('medium'),
  });

  onSubmit() {
    if (this.form.valid) {
      const { title, description, priority } = this.form.value;
      this.taskService.addTask({
        title: title!,
        description: description || '',
        priority: priority || 'medium',
        completed: false,
      });
      this.router.navigate(['/']);
    }
  }
}
```

## Bonus: Signal Forms (Experimental in Angular 21)

Angular is introducing signal-based forms. These are still experimental but worth a look:

```typescript
import { FormSignalGroup, FormSignalControl } from '@angular/forms';

export class TaskForm {
  title = new FormSignalControl('', [Validators.required]);

  // Read value as signal
  // title.value() — current value
  // title.valid() — validity as signal
  // title.errors() — errors as signal
}
```

This is still evolving. Stick with `FormGroup`/`FormControl` for now, but know that signal-based forms are coming.

## Task

1. Generate a `TaskForm` component
2. Build a reactive form with these fields:
   - **Title** — required, minimum 3 characters
   - **Description** — optional, textarea
   - **Priority** — select dropdown (low/medium/high), default medium
   - **Due Date** — optional date input
3. Show validation errors when fields are touched and invalid
4. Disable the submit button when the form is invalid
5. On submit, call `TaskService.addTask()` and navigate back to the dashboard
6. Style the form with Tailwind

**Hints:**
- Import `ReactiveFormsModule` in the component's `imports` array
- Use `formControlName` to bind inputs (not `[(ngModel)]`)
- Check `form.get('field')?.touched` before showing errors
- Use `this.form.value` to get all form values at once
- The `!` after `title!` is the non-null assertion (form.value properties are nullable)

## What's Next

Your form is functional, but dates show raw ISO strings and priorities are plain text. In the next section, you'll learn about **pipes** for formatting display values and **directives** for reusable DOM behavior.

[← Previous: 06 — Routing](06-routing.md) · [Next: 08 — Pipes & Directives →](08-pipes-and-directives.md)

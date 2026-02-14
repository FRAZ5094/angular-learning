# 08 — Pipes & Directives

[← Previous: 07 — Forms](07-forms.md) · [Next: 09 — HTTP & Data →](09-http-and-data.md)

## Goal

Create a custom pipe for relative time formatting and a custom directive for priority-based highlighting.

## React Comparison: Pipes & Directives

| Angular | React Equivalent | Notes |
|---------|-----------------|-------|
| `{{ date \| date:'short' }}` | `formatDate(date)` | Angular pipes are template-level transforms |
| `{{ title \| uppercase }}` | `title.toUpperCase()` | Built-in pipes for common transforms |
| Custom `@Pipe` | Custom function | Pipes are cacheable and composable |
| Attribute `@Directive` | Custom hook + ref | Directives attach behavior to DOM elements |

### Why Pipes?

In React, you'd just call a function:

```tsx
<span>{formatRelativeTime(task.createdAt)}</span>
```

In Angular, pipes provide the same thing but as template syntax:

```html
<span>{{ task.createdAt | relativeTime }}</span>
```

The advantages:
- **Declarative** — reads left-to-right in the template
- **Chainable** — `{{ value | uppercase | truncate:50 }}`
- **Pure by default** — Angular caches the result and only recalculates when the input changes (like `useMemo` for free)

## Built-in Pipes

Angular ships with useful pipes out of the box:

```html
<!-- Date formatting -->
{{ task.createdAt | date:'short' }}        <!-- 1/15/25, 3:30 PM -->
{{ task.createdAt | date:'mediumDate' }}   <!-- Jan 15, 2025 -->

<!-- Text transforms -->
{{ task.title | uppercase }}               <!-- BUILD THE UI -->
{{ task.title | lowercase }}               <!-- build the ui -->
{{ task.title | titlecase }}               <!-- Build The Ui -->

<!-- Numbers -->
{{ task.progress | percent }}              <!-- 75% -->
{{ task.price | currency }}                <!-- $19.99 -->
{{ task.count | number:'1.0-2' }}          <!-- 3.14 -->

<!-- JSON (great for debugging) -->
{{ task | json }}                          <!-- {"id": "...", ...} -->
```

> To use built-in pipes, import them from `@angular/common`:
>
> ```typescript
> import { DatePipe, UpperCasePipe } from '@angular/common';
> @Component({ imports: [DatePipe, UpperCasePipe] })
> ```

## Creating a Custom Pipe

Let's create a `RelativeTime` pipe that shows "2 hours ago", "yesterday", etc.

```bash
ng generate pipe relative-time
```

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
  pure: true, // Default — only recalculates when input reference changes
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: Date | string): string {
    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}
```

Usage:

```html
<span class="text-gray-500 text-sm">{{ task.createdAt | relativeTime }}</span>
```

### Pipe Parameters

Pipes can accept arguments:

```typescript
@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxLength: number = 50): string {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
  }
}
```

```html
{{ task.description | truncate:30 }}
```

### Chaining Pipes

```html
{{ task.title | uppercase | truncate:20 }}
```

## Directives: Reusable DOM Behavior

Directives attach behavior to DOM elements. Think of them as custom HTML attributes.

### React Comparison

In React, you'd use a custom hook with a ref:

```tsx
function usePriorityHighlight(priority: string) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.borderLeftColor = priority === 'high' ? 'red' : 'gray';
    }
  }, [priority]);
  return ref;
}

function TaskCard({ priority }) {
  const ref = usePriorityHighlight(priority);
  return <div ref={ref}>...</div>;
}
```

In Angular, a directive does this more cleanly:

```html
<div [appPriorityHighlight]="task.priority">...</div>
```

## Creating a Custom Directive

```bash
ng generate directive priority-highlight
```

```typescript
import { Directive, ElementRef, input, effect } from '@angular/core';

@Directive({
  selector: '[appPriorityHighlight]',
})
export class PriorityHighlightDirective {
  appPriorityHighlight = input.required<'low' | 'medium' | 'high'>();

  private el = inject(ElementRef);

  constructor() {
    effect(() => {
      const priority = this.appPriorityHighlight();
      const colors = {
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#22c55e',
      };

      this.el.nativeElement.style.borderLeftWidth = '4px';
      this.el.nativeElement.style.borderLeftStyle = 'solid';
      this.el.nativeElement.style.borderLeftColor = colors[priority];
    });
  }
}
```

Usage:

```html
<!-- In task-card.html -->
<div class="p-4 rounded-lg bg-white" [appPriorityHighlight]="task().priority">
  <h3>{{ task().title }}</h3>
</div>
```

### Key Parts

- **`selector: '[appPriorityHighlight]'`** — Square brackets mean it's an attribute selector (like CSS `[attr]`)
- **`input.required()`** — The directive receives data via the same input mechanism as components
- **`ElementRef`** — Gives direct access to the host DOM element
- **`effect()`** — Reacts to input changes and updates the DOM

> **Convention:** Prefix directive selectors with `app` (or your project prefix) to avoid conflicts with HTML attributes.

## Host Bindings (Alternative to ElementRef)

For simpler cases, you can use `host` bindings instead of `ElementRef`:

```typescript
@Directive({
  selector: '[appPriorityHighlight]',
  host: {
    '[style.borderLeftWidth]': '"4px"',
    '[style.borderLeftStyle]': '"solid"',
    '[style.borderLeftColor]': 'color()',
  },
})
export class PriorityHighlightDirective {
  appPriorityHighlight = input.required<'low' | 'medium' | 'high'>();

  color = computed(() => {
    const colors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
    return colors[this.appPriorityHighlight()];
  });
}
```

This is cleaner — no `ElementRef` or `effect()` needed.

## Task

1. Create a `RelativeTime` pipe that formats `Date` values as relative strings:
   - "just now", "5m ago", "2h ago", "3d ago", or the actual date for older
2. Create a `PriorityHighlight` directive that adds a colored left border:
   - High → red, Medium → yellow/amber, Low → green
3. Apply the pipe to task `createdAt` dates in your task cards
4. Apply the directive to task card containers
5. Import both in the components that use them

**Hints:**
- Remember to add the pipe and directive to the component's `imports` array
- Pipe name in `@Pipe({ name: 'relativeTime' })` is what you use in templates: `{{ value | relativeTime }}`
- Directive selector uses brackets: `selector: '[appPriorityHighlight]'`
- The directive input name should match the selector: `appPriorityHighlight = input.required()`

## What's Next

Your app looks polished, but data disappears on refresh. In the next section, you'll add persistence — first with localStorage, then with a mock API using `httpResource()`.

[← Previous: 07 — Forms](07-forms.md) · [Next: 09 — HTTP & Data →](09-http-and-data.md)

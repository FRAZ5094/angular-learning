# 00 — Setup

[Next: 01 — Components & Templates →](01-components-and-templates.md)

## Goal

Install the Angular CLI, scaffold the TaskFlow project, add Tailwind CSS v4, and understand the generated project structure.

## React Comparison: Project Scaffolding

| React / Next.js | Angular |
|-----------------|---------|
| `npx create-next-app@latest` | `ng new taskflow` |
| `next.config.js` | `angular.json` |
| `package.json` scripts | `ng serve`, `ng build`, `ng test`, `ng generate` |
| `app/` directory (file-based routing) | `src/app/` (component-based, explicit routing) |
| Various bundler configs | Angular CLI handles everything |

In Next.js you'd run `create-next-app` and configure your own tooling. Angular's CLI does more out of the box — it scaffolds, serves, builds, tests, generates components, and manages configuration. Think of `ng` as your Swiss Army knife.

## Step 1: Install the Angular CLI

```bash
npm install -g @angular/cli
```

Verify it worked:

```bash
ng version
```

You should see Angular CLI 21.x.

## Step 2: Create the TaskFlow Project

From the `taskflow/` directory's **parent** (i.e., inside `angular_learning/`):

```bash
ng new taskflow --style=css
```

The CLI will ask a few questions. Accept the defaults. Here's what it creates:

```
taskflow/
├── src/
│   ├── app/
│   │   ├── app.ts              # Root component
│   │   ├── app.html            # Root template
│   │   ├── app.css             # Root styles
│   │   └── app.routes.ts       # Route config
│   ├── index.html              # Entry HTML
│   ├── main.ts                 # Bootstrap
│   └── styles.css              # Global styles
├── angular.json                # CLI config (build, serve, test)
├── tsconfig.json               # TypeScript config
├── package.json
└── ...
```

### Key Differences from Next.js

- **No `pages/` or `app/` router** — Angular uses explicit route configuration in `app.routes.ts`
- **`angular.json`** — This is the big config file. It controls the build system, test runner, style preprocessor, and more. You rarely need to edit it.
- **`main.ts`** — Bootstraps the app (like Next.js's `_app.tsx` but more explicit)
- **Standalone by default** — Angular 21 generates standalone components. No `NgModule` boilerplate.
- **Zoneless by default** — Angular 21 uses `provideZonelessChangeDetection()`. No `zone.js`.

## Step 3: Run the Dev Server

```bash
cd taskflow
ng serve
```

Open `http://localhost:4200`. You should see the default Angular welcome page.

> **React equivalent:** This is like `npm run dev` with Next.js — hot module replacement is built in.

## Step 4: Add Tailwind CSS v4

Tailwind v4 uses a new CSS-first configuration. Install it:

```bash
npm install tailwindcss @tailwindcss/postcss
```

Create a PostCSS config file at the project root (`taskflow/.postcssrc.json`):

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Replace the contents of `src/styles.css` with:

```css
@import "tailwindcss";
```

That's it. Tailwind v4 auto-detects your template files — no `tailwind.config.js` needed.

### Verify Tailwind Works

Open `src/app/app.html`, replace its contents with:

```html
<main class="min-h-screen bg-gray-50 flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-gray-900">TaskFlow</h1>
    <p class="mt-2 text-gray-600">Your task management app</p>
  </div>
</main>
```

Restart the dev server (`ng serve`). You should see a centered "TaskFlow" heading with Tailwind styling.

## Step 5: Understand `main.ts`

Open `src/main.ts`:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig);
```

This bootstraps the root `App` component with the application config. The config (in `app.config.ts`) provides app-wide services like routing and change detection.

Open `src/app/app.config.ts`:

```typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
  ],
};
```

> **React comparison:** This is like combining your `_app.tsx` providers (React Query, Auth, Theme) into one config object. Instead of nesting `<Provider>` components, Angular uses a flat `providers` array.

## The Angular CLI: Your Code Generator

Angular's CLI can generate components, services, pipes, and more:

```bash
ng generate component task-card    # Creates a component
ng generate service task           # Creates a service
ng generate pipe relative-time     # Creates a pipe
```

We'll use these throughout the guide. The CLI handles imports, file creation, and boilerplate — think of it as a smarter version of code snippets.

## Task

1. Scaffold the TaskFlow project with `ng new taskflow --style=css`
2. Add Tailwind CSS v4 (PostCSS config + `@import "tailwindcss"`)
3. Replace the default template with a styled "TaskFlow" heading
4. Verify everything renders correctly at `http://localhost:4200`

When you're done, you should see a clean page with "TaskFlow" styled by Tailwind.

## What's Next

In the next section, you'll create your first Angular component — a `TaskCard` that displays task information. You'll learn how Angular's `@Component` decorator, templates, and selectors compare to React's function components and JSX.

[Next: 01 — Components & Templates →](01-components-and-templates.md)

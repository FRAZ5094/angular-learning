# 10 — Authentication

[← Previous: 09 — HTTP & Data](09-http-and-data.md) · [Next: 11 — State Management →](11-state-management.md)

## Goal

Implement authentication with an AuthService, login/register pages, JWT token management, an auth interceptor, and route guards.

## React Comparison: Authentication

| React | Angular | Notes |
|-------|---------|-------|
| NextAuth / Auth.js | `AuthService` + guards | Angular's is manual but more transparent |
| `AuthContext` + `useAuth()` | `inject(AuthService)` | Service is a singleton, no Provider needed |
| HOC / middleware for protected routes | Route guards (`canActivate`) | Framework-level route protection |
| Axios interceptor for tokens | HTTP interceptor | Same concept, different API |
| `useRouter()` redirect | `Router.navigate()` in guard | Guard returns true/false or redirect |

### The Mental Shift

In React/Next.js, route protection is typically middleware or a wrapper component that checks auth state and redirects. It's application-level code.

In Angular, route guards are a **framework concept**. You declare which routes need protection in the route config, and Angular handles the rest. Guards can redirect, load data, or block navigation — all declaratively.

## AuthService

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);

  user = this._user.asReadonly();
  isLoggedIn = computed(() => this._user() !== null);

  constructor() {
    // Restore session from localStorage
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('auth-user');
    if (token && user) {
      this._token.set(token);
      this._user.set(JSON.parse(user));
    }
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>('/api/login', { email, password })
      .subscribe({
        next: (res) => {
          this._token.set(res.token);
          this._user.set(res.user);
          localStorage.setItem('auth-token', res.token);
          localStorage.setItem('auth-user', JSON.stringify(res.user));
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Login failed:', err);
        },
      });
  }

  register(name: string, email: string, password: string) {
    return this.http.post<AuthResponse>('/api/register', { name, email, password })
      .subscribe({
        next: (res) => {
          this._token.set(res.token);
          this._user.set(res.user);
          localStorage.setItem('auth-token', res.token);
          localStorage.setItem('auth-user', JSON.stringify(res.user));
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Registration failed:', err);
        },
      });
  }

  logout() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }
}
```

> **React comparison:** This is like a custom `useAuth()` hook + Context provider, but as a singleton service. No `<AuthProvider>` wrapping needed. Any component can `inject(AuthService)` to get auth state.

## Auth Interceptor

Automatically attach the JWT token to every API request:

```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
```

Register it in `app.config.ts`:

```typescript
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
```

> **React comparison:** Same as an Axios interceptor that reads a token from state/storage and adds it to headers. The Angular version is framework-integrated.

## Route Guards

Guards control who can access routes. They're functions that return `true` (allow), `false` (block), or a `UrlTree` (redirect).

```typescript
// auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
```

Apply it in routes:

```typescript
export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register').then(m => m.Register),
  },

  // Protected routes
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
  },
  {
    path: 'tasks/new',
    canActivate: [authGuard],
    loadComponent: () => import('./task-form/task-form').then(m => m.TaskForm),
  },
  {
    path: 'tasks/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./task-detail/task-detail').then(m => m.TaskDetail),
  },
];
```

> **React comparison:** In Next.js, you'd check auth in middleware or in the page component itself. Angular's `canActivate` is declarative — you see which routes are protected just by looking at the route config.

### Guard for Already-Authenticated Users

Prevent logged-in users from seeing login/register:

```typescript
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
```

## Login Page

```typescript
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto mt-16">
      <h1 class="text-2xl font-bold mb-6">Log In</h1>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input formControlName="email" type="email"
                 class="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input formControlName="password" type="password"
                 class="mt-1 block w-full rounded border px-3 py-2" />
        </div>
        <button type="submit" [disabled]="form.invalid"
                class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          Log In
        </button>
        <p class="text-sm text-gray-600 text-center">
          Don't have an account? <a routerLink="/register" class="text-blue-600">Register</a>
        </p>
      </form>
    </div>
  `,
})
export class Login {
  private authService = inject(AuthService);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.authService.login(email!, password!);
    }
  }
}
```

## Updating the Navbar

Show login/logout based on auth state:

```typescript
export class Navbar {
  private authService = inject(AuthService);
  isLoggedIn = this.authService.isLoggedIn;
  user = this.authService.user;

  logout() {
    this.authService.logout();
  }
}
```

```html
@if (isLoggedIn()) {
  <span class="text-gray-600">{{ user()?.name }}</span>
  <button (click)="logout()" class="text-red-600 hover:text-red-800">Logout</button>
} @else {
  <a routerLink="/login" class="text-blue-600">Login</a>
}
```

## Simulating Auth with json-server

For development, you can simulate auth. Create a simple middleware or just use localStorage with fake tokens. The important thing is the Angular patterns — the backend can be swapped later.

A simple approach: skip the actual HTTP call and just simulate it in the service:

```typescript
login(email: string, password: string) {
  // Simulate API call
  const fakeUser: User = { id: '1', email, name: email.split('@')[0] };
  const fakeToken = 'fake-jwt-token-' + Date.now();

  this._token.set(fakeToken);
  this._user.set(fakeUser);
  localStorage.setItem('auth-token', fakeToken);
  localStorage.setItem('auth-user', JSON.stringify(fakeUser));
  this.router.navigate(['/']);
}
```

## Task

1. Create `AuthService` with:
   - `user` signal, `isLoggedIn` computed
   - `login()`, `register()`, `logout()` methods
   - Token storage in localStorage
   - Session restoration on app load
2. Create an auth interceptor that attaches the JWT token
3. Create an `authGuard` function for route protection
4. Create `Login` and `Register` page components with forms
5. Update route config with guards (protected and guest routes)
6. Update the navbar to show user info / login link based on auth state

**Hints:**
- Start with simulated auth (fake tokens) — the patterns are what matter
- Guards are just functions: `export const authGuard: CanActivateFn = () => { ... }`
- Register interceptors: `provideHttpClient(withInterceptors([authInterceptor]))`
- `router.createUrlTree(['/login'])` returns a redirect in a guard

## What's Next

Your app has auth and data. In the next section, you'll level up state management with filtering, sorting, and computed aggregations for a rich dashboard.

[← Previous: 09 — HTTP & Data](09-http-and-data.md) · [Next: 11 — State Management →](11-state-management.md)

import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
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
    // Simulated auth — replace with real HTTP call when backend is ready
    const fakeUser: User = {
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0],
    };
    const fakeToken = 'jwt-' + Date.now();

    this._token.set(fakeToken);
    this._user.set(fakeUser);
    localStorage.setItem('auth-token', fakeToken);
    localStorage.setItem('auth-user', JSON.stringify(fakeUser));
    this.router.navigate(['/']);
  }

  register(name: string, email: string, password: string) {
    // Simulated registration
    const fakeUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
    };
    const fakeToken = 'jwt-' + Date.now();

    this._token.set(fakeToken);
    this._user.set(fakeUser);
    localStorage.setItem('auth-token', fakeToken);
    localStorage.setItem('auth-user', JSON.stringify(fakeUser));
    this.router.navigate(['/']);
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

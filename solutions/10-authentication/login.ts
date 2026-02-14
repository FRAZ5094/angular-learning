import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto mt-16">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Log In</h1>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            formControlName="email"
            type="email"
            class="mt-1 block w-full rounded border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="you@example.com"
          />
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <p class="text-red-600 text-sm mt-1">Valid email is required</p>
          }
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            formControlName="password"
            type="password"
            class="mt-1 block w-full rounded border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Enter password"
          />
          @if (form.get('password')?.invalid && form.get('password')?.touched) {
            <p class="text-red-600 text-sm mt-1">Password is required</p>
          }
        </div>

        <button
          type="submit"
          [disabled]="form.invalid"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Log In
        </button>

        <p class="text-sm text-gray-600 text-center">
          Don't have an account?
          <a routerLink="/register" class="text-blue-600 hover:underline">Register</a>
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

import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto mt-16">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Create Account</h1>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            formControlName="name"
            type="text"
            class="mt-1 block w-full rounded border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Your name"
          />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <p class="text-red-600 text-sm mt-1">Name is required</p>
          }
        </div>

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
            placeholder="Min 6 characters"
          />
          @if (form.get('password')?.invalid && form.get('password')?.touched) {
            <p class="text-red-600 text-sm mt-1">Password must be at least 6 characters</p>
          }
        </div>

        <button
          type="submit"
          [disabled]="form.invalid"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Create Account
        </button>

        <p class="text-sm text-gray-600 text-center">
          Already have an account?
          <a routerLink="/login" class="text-blue-600 hover:underline">Log In</a>
        </p>
      </form>
    </div>
  `,
})
export class Register {
  private authService = inject(AuthService);

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  onSubmit() {
    if (this.form.valid) {
      const { name, email, password } = this.form.value;
      this.authService.register(name!, email!, password!);
    }
  }
}

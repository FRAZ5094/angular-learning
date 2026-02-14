import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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

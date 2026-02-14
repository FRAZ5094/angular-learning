import { Component, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-task-card',
  template: `
    <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-semibold text-gray-900">{{ title() }}</h3>
        <span class="text-sm px-2 py-1 rounded-full"
              [class]="priority() === 'high' ? 'bg-red-100 text-red-700' :
                       priority() === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                       'bg-green-100 text-green-700'">
          {{ priority() }}
        </span>
      </div>
      <p class="text-gray-600 text-sm mb-3">{{ description() }}</p>
      <p class="text-sm mb-3" [class]="completed() ? 'text-green-600' : 'text-gray-500'">
        {{ statusLabel() }}
      </p>
      <button (click)="toggle()"
              class="text-sm px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
        {{ completed() ? 'Mark Incomplete' : 'Mark Complete' }}
      </button>
    </div>
  `,
})
export class TaskCard {
  title = signal('Build the UI');
  description = signal('Create the main dashboard layout with task cards');
  priority = signal<'low' | 'medium' | 'high'>('high');
  completed = signal(false);

  statusLabel = computed(() => {
    if (this.completed()) return '✅ Complete';
    return `📋 Pending — ${this.priority()}`;
  });

  constructor() {
    effect(() => {
      console.log('Task completion changed:', this.completed());
    });
  }

  toggle() {
    this.completed.update(c => !c);
  }
}

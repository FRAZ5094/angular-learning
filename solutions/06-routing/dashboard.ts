import { Component, inject } from '@angular/core';
import { TaskService } from '../task.service';
import { TaskCard } from '../task-card/task-card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [TaskCard, RouterLink],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div class="text-sm text-gray-500">
          {{ taskService.pendingCount() }} pending · {{ taskService.completedCount() }} completed
        </div>
      </div>

      @for (task of taskService.tasks(); track task.id) {
        <a [routerLink]="['/tasks', task.id]">
          <app-task-card
            [task]="task"
            (delete)="deleteTask($event)"
            (toggle)="toggleTask($event)"
          />
        </a>
      } @empty {
        <div class="text-center text-gray-500 py-8">
          <p class="text-lg">No tasks yet</p>
          <a routerLink="/tasks/new" class="text-blue-600 hover:underline">
            Create your first task
          </a>
        </div>
      }
    </div>
  `,
})
export class Dashboard {
  taskService = inject(TaskService);

  deleteTask(id: string) {
    this.taskService.deleteTask(id);
  }

  toggleTask(id: string) {
    this.taskService.toggleTask(id);
  }
}

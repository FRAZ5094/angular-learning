import { Component, input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-task-detail',
  imports: [RouterLink],
  template: `
    @if (task(); as task) {
      <div class="space-y-4">
        <a routerLink="/" class="text-blue-600 hover:underline text-sm">
          &larr; Back to Dashboard
        </a>

        <div class="bg-white border rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold text-gray-900">{{ task.title }}</h1>
            @switch (task.priority) {
              @case ('high') {
                <span class="px-3 py-1 rounded-full bg-red-100 text-red-700">High</span>
              }
              @case ('medium') {
                <span class="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">Medium</span>
              }
              @case ('low') {
                <span class="px-3 py-1 rounded-full bg-green-100 text-green-700">Low</span>
              }
            }
          </div>

          <p class="text-gray-600 mb-4">{{ task.description }}</p>

          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span>Status: {{ task.completed ? 'Complete' : 'Pending' }}</span>
            <span>Created: {{ task.createdAt }}</span>
          </div>

          <div class="mt-6 flex gap-2">
            <button (click)="toggleTask()"
                    class="px-4 py-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
              {{ task.completed ? 'Mark Incomplete' : 'Mark Complete' }}
            </button>
            <button (click)="deleteTask()"
                    class="px-4 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200">
              Delete
            </button>
          </div>
        </div>
      </div>
    } @else {
      <div class="text-center py-8">
        <p class="text-gray-500 text-lg">Task not found</p>
        <a routerLink="/" class="text-blue-600 hover:underline">Back to Dashboard</a>
      </div>
    }
  `,
})
export class TaskDetail {
  id = input.required<string>();

  private taskService = inject(TaskService);

  task = computed(() => this.taskService.getTask(this.id()));

  toggleTask() {
    this.taskService.toggleTask(this.id());
  }

  deleteTask() {
    this.taskService.deleteTask(this.id());
  }
}

import { Component, inject, signal, computed, linkedSignal } from '@angular/core';
import { TaskService } from '../task.service';
import { TaskCard } from '../task-card/task-card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [TaskCard, RouterLink],
  template: `
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg border">
        <p class="text-sm text-gray-500">Total Tasks</p>
        <p class="text-2xl font-bold">{{ taskService.totalCount() }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg border">
        <p class="text-sm text-gray-500">Completed</p>
        <p class="text-2xl font-bold text-green-600">{{ taskService.completedCount() }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg border">
        <p class="text-sm text-gray-500">Pending</p>
        <p class="text-2xl font-bold text-yellow-600">{{ taskService.pendingCount() }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg border">
        <p class="text-sm text-gray-500">Completion Rate</p>
        <p class="text-2xl font-bold text-blue-600">{{ taskService.completionRate() }}%</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 mb-4">
      <input
        [value]="searchQuery()"
        (input)="searchQuery.set($any($event.target).value)"
        placeholder="Search tasks..."
        class="border rounded px-3 py-2 flex-1 min-w-48"
      />
      <select
        [value]="statusFilter()"
        (change)="statusFilter.set($any($event.target).value)"
        class="border rounded px-3 py-2"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
      <select
        [value]="priorityFilter()"
        (change)="priorityFilter.set($any($event.target).value)"
        class="border rounded px-3 py-2"
      >
        <option value="all">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select
        [value]="sortBy()"
        (change)="sortBy.set($any($event.target).value)"
        class="border rounded px-3 py-2"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="priority">Priority</option>
      </select>
    </div>

    <p class="text-sm text-gray-500 mb-4">
      Showing {{ filteredCount() }} of {{ taskService.totalCount() }} tasks
    </p>

    <!-- Task List -->
    @for (task of filteredTasks(); track task.id) {
      <div class="mb-3">
        <a [routerLink]="['/tasks', task.id]">
          <app-task-card
            [task]="task"
            (delete)="deleteTask($event)"
            (toggle)="toggleTask($event)"
          />
        </a>
      </div>
    } @empty {
      <div class="text-center text-gray-500 py-8">
        <p class="text-lg">No tasks match your filters</p>
        <a routerLink="/tasks/new" class="text-blue-600 hover:underline">
          Create a new task
        </a>
      </div>
    }
  `,
})
export class Dashboard {
  taskService = inject(TaskService);

  // Filter state
  statusFilter = signal<'all' | 'pending' | 'completed'>('all');
  priorityFilter = signal<'all' | 'low' | 'medium' | 'high'>('all');
  searchQuery = signal('');

  // Sort resets when status filter changes
  sortBy = linkedSignal(() => {
    this.statusFilter();
    return 'newest' as const;
  });

  // Computed filtered + sorted tasks
  filteredTasks = computed(() => {
    let tasks = this.taskService.tasks();

    const status = this.statusFilter();
    if (status === 'pending') tasks = tasks.filter(t => !t.completed);
    if (status === 'completed') tasks = tasks.filter(t => t.completed);

    const priority = this.priorityFilter();
    if (priority !== 'all') tasks = tasks.filter(t => t.priority === priority);

    const query = this.searchQuery().toLowerCase();
    if (query) {
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    const sort = this.sortBy();
    if (sort === 'newest') {
      tasks = [...tasks].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sort === 'oldest') {
      tasks = [...tasks].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sort === 'priority') {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
      tasks = [...tasks].sort((a, b) => order[a.priority] - order[b.priority]);
    }

    return tasks;
  });

  filteredCount = computed(() => this.filteredTasks().length);

  deleteTask(id: string) {
    this.taskService.deleteTask(id);
  }

  toggleTask(id: string) {
    this.taskService.toggleTask(id);
  }
}

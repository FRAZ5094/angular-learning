import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Task } from './models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/tasks';

  // Declarative data fetching
  tasksResource = httpResource<Task[]>(() => this.apiUrl);

  // Local signal for optimistic updates (overrides resource when set)
  private _optimisticTasks = signal<Task[] | null>(null);

  tasks = computed(() => this._optimisticTasks() ?? this.tasksResource.value() ?? []);
  isLoading = computed(() => this.tasksResource.isLoading());

  // Aggregations
  totalCount = computed(() => this.tasks().length);
  completedCount = computed(() => this.tasks().filter(t => t.completed).length);
  pendingCount = computed(() => this.tasks().filter(t => !t.completed).length);

  highPriorityCount = computed(() =>
    this.tasks().filter(t => t.priority === 'high' && !t.completed).length
  );

  completionRate = computed(() => {
    const total = this.totalCount();
    return total === 0 ? 0 : Math.round((this.completedCount() / total) * 100);
  });

  tasksByStatus = computed(() => ({
    pending: this.tasks().filter(t => !t.completed),
    completed: this.tasks().filter(t => t.completed),
  }));

  addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic: add to UI immediately
    this._optimisticTasks.set([...this.tasks(), newTask as Task]);

    this.http.post<Task>(this.apiUrl, newTask).subscribe({
      next: () => {
        this._optimisticTasks.set(null);
        this.tasksResource.reload();
      },
      error: () => {
        // Rollback
        this._optimisticTasks.set(null);
      },
    });
  }

  deleteTask(id: string) {
    const previousTasks = this.tasks();

    // Optimistic: remove from UI
    this._optimisticTasks.set(previousTasks.filter(t => t.id !== id));

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this._optimisticTasks.set(null);
        this.tasksResource.reload();
      },
      error: () => {
        // Rollback
        this._optimisticTasks.set(null);
      },
    });
  }

  toggleTask(id: string) {
    const previousTasks = this.tasks();
    const task = previousTasks.find(t => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };

    // Optimistic: update UI
    this._optimisticTasks.set(
      previousTasks.map(t => t.id === id ? updatedTask : t)
    );

    this.http.put(`${this.apiUrl}/${id}`, updatedTask).subscribe({
      next: () => {
        this._optimisticTasks.set(null);
        this.tasksResource.reload();
      },
      error: () => {
        // Rollback
        this._optimisticTasks.set(null);
      },
    });
  }

  getTask(id: string) {
    return this.tasks().find(t => t.id === id);
  }
}

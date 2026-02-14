import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Task } from './models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/tasks';

  // Declarative data fetching for reads
  tasksResource = httpResource<Task[]>(() => this.apiUrl);

  // Reactive access to data
  tasks = computed(() => this.tasksResource.value() ?? []);
  isLoading = computed(() => this.tasksResource.isLoading());

  // Computed aggregations
  completedCount = computed(() =>
    this.tasks().filter(t => t.completed).length
  );

  pendingCount = computed(() =>
    this.tasks().filter(t => !t.completed).length
  );

  addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    this.http.post<Task>(this.apiUrl, newTask).subscribe(() => {
      this.tasksResource.reload();
    });
  }

  deleteTask(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.tasksResource.reload();
    });
  }

  toggleTask(id: string) {
    const task = this.tasks().find(t => t.id === id);
    if (!task) return;

    this.http.put(`${this.apiUrl}/${id}`, {
      ...task,
      completed: !task.completed,
    }).subscribe(() => {
      this.tasksResource.reload();
    });
  }

  getTask(id: string) {
    return this.tasks().find(t => t.id === id);
  }
}

import { Injectable, signal, computed, effect } from '@angular/core';
import { Task } from './models/task.model';

/**
 * Step 1: TaskService with localStorage persistence.
 * Use this before migrating to httpResource.
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private _tasks = signal<Task[]>(this.loadFromStorage());

  tasks = this._tasks.asReadonly();

  completedCount = computed(() =>
    this._tasks().filter(t => t.completed).length
  );

  pendingCount = computed(() =>
    this._tasks().filter(t => !t.completed).length
  );

  constructor() {
    // Auto-save whenever tasks change
    effect(() => {
      localStorage.setItem('taskflow-tasks', JSON.stringify(this._tasks()));
    });
  }

  private loadFromStorage(): Task[] {
    const stored = localStorage.getItem('taskflow-tasks');
    if (!stored) return [];
    return JSON.parse(stored);
  }

  addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this._tasks.update(tasks => [...tasks, newTask]);
  }

  deleteTask(id: string) {
    this._tasks.update(tasks => tasks.filter(t => t.id !== id));
  }

  toggleTask(id: string) {
    this._tasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }

  getTask(id: string) {
    return this._tasks().find(t => t.id === id);
  }
}

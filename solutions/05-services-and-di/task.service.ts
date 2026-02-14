import { Injectable, signal, computed } from '@angular/core';
import { Task } from './models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private _tasks = signal<Task[]>([
    {
      id: '1',
      title: 'Set up project',
      description: 'Initialize Angular app with Tailwind',
      priority: 'high',
      completed: true,
      createdAt: new Date('2025-01-15'),
    },
    {
      id: '2',
      title: 'Build task list',
      description: 'Create components to display tasks',
      priority: 'medium',
      completed: false,
      createdAt: new Date('2025-01-16'),
    },
    {
      id: '3',
      title: 'Add styling',
      description: 'Apply Tailwind CSS to all components',
      priority: 'low',
      completed: false,
      createdAt: new Date('2025-01-17'),
    },
  ]);

  tasks = this._tasks.asReadonly();

  completedCount = computed(() =>
    this._tasks().filter(t => t.completed).length
  );

  pendingCount = computed(() =>
    this._tasks().filter(t => !t.completed).length
  );

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

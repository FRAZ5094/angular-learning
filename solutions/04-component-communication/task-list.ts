import { Component, signal } from '@angular/core';
import { Task } from '../models/task.model';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'app-task-list',
  imports: [TaskCard],
  templateUrl: './task-list.html',
})
export class TaskList {
  tasks = signal<Task[]>([
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

  removeTask(id: string) {
    this.tasks.update(tasks => tasks.filter(t => t.id !== id));
  }

  toggleTask(id: string) {
    this.tasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }
}

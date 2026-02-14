import { Component, signal } from '@angular/core';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-task-list',
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
    {
      id: '4',
      title: 'Implement authentication',
      description: 'Add login and registration pages',
      priority: 'high',
      completed: false,
      createdAt: new Date('2025-01-18'),
    },
  ]);
}

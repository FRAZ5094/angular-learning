import { Component, signal } from '@angular/core';
import { Task } from '../models/task.model';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'app-task-list',
  imports: [],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  tasks = signal<Task[]>([
    {
      id: '1',
      title: 'Set up project structure',
      description: 'Initialize the Angular project with Tailwind CSS and configure the build system.',
      priority: 'high',
      completed: true,
      createdAt: new Date('2026-03-25'),
    },
    {
      id: '2',
      title: 'Create task model',
      description: 'Define the Task interface with all required properties.',
      priority: 'medium',
      completed: true,
      createdAt: new Date('2026-03-26'),
    },
    {
      id: '3',
      title: 'Build task list component',
      description: 'Render tasks in a list with proper styling and layout.',
      priority: 'high',
      completed: false,
      createdAt: new Date('2026-03-27'),
    },
    {
      id: '4',
      title: 'Add filtering and sorting',
      description: 'Allow users to filter tasks by status and sort by priority or date.',
      priority: 'low',
      completed: false,
      createdAt: new Date('2026-03-29'),
    },
  ])
}

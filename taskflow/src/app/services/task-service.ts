import { computed, Injectable, signal } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private _tasks = signal<Task[]>([
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

  tasks = this._tasks.asReadonly()

  addTask = (newTask: Omit<Task, "id" | "completed" | "createdAt">) => this._tasks.update((tasks) => [...tasks, { ...newTask, id: crypto.randomUUID(), completed: false, createdAt: new Date() }])

  toggleTask = (toCompleteId: string) => this._tasks.update((tasks) => tasks.map(task => {
    if (task.id != toCompleteId) return task;

    return {
      ...task,
      completed: !task.completed,
    }
  }))

  deleteTask = (toDeleteId: string) => this._tasks.update((tasks) => tasks.filter((({ id }) => id != toDeleteId)))

  getTask = (id: string) => this.tasks().find((task) => task.id == id)

  completedCount = computed(() => this.tasks().filter((task) => task.completed).length)
  pendingCount = computed(() => this.tasks().filter((task) => !task.completed).length)
}

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
  },
  {
    path: 'tasks/new',
    loadComponent: () => import('./task-form/task-form').then(m => m.TaskForm),
  },
  {
    path: 'tasks/:id',
    loadComponent: () => import('./task-detail/task-detail').then(m => m.TaskDetail),
  },
];

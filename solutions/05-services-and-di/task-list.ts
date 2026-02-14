import { Component, inject } from '@angular/core';
import { TaskService } from '../task.service';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'app-task-list',
  imports: [TaskCard],
  templateUrl: './task-list.html',
})
export class TaskList {
  private taskService = inject(TaskService);

  tasks = this.taskService.tasks;
  pendingCount = this.taskService.pendingCount;
  completedCount = this.taskService.completedCount;

  addSampleTask() {
    this.taskService.addTask({
      title: 'New Task',
      description: 'A newly created task',
      priority: 'medium',
      completed: false,
    });
  }

  removeTask(id: string) {
    this.taskService.deleteTask(id);
  }

  toggleTask(id: string) {
    this.taskService.toggleTask(id);
  }
}

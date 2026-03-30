import { Component, inject, signal } from '@angular/core';
import { Task } from '../models/task.model';
import { TaskCard } from '../task-card/task-card';
import { TaskService } from '../services/task-service';

@Component({
  selector: 'app-task-list',
  imports: [TaskCard],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  private taskService = inject(TaskService)
  tasks = this.taskService.tasks

  completedCount = this.taskService.completedCount
  pendingCount = this.taskService.pendingCount

  onDelete = this.taskService.deleteTask
  onToggle = this.taskService.toggleTask

  addTask = () => this.taskService.addTask({
    title: "test",
    description: "test desc",
    priority: "low"
  })
}

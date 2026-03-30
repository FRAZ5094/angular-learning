import { Component, computed, effect, input, output, signal, WritableSignal } from '@angular/core';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-task-card',
  imports: [],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  task = input.required<Task>();
  taskId = computed(() => this.task().id)
  delete = output<string>()
  toggle = output<string>()


  statusLabel = computed(() => this.task().completed ? '✅ Complete' : `📋 Pending - ${this.task().priority}`)

  onDelete = () => this.delete.emit(this.taskId())
  onToggleCompleted = () => this.toggle.emit(this.taskId())

  constructor() {
    effect(() => console.log("Status changed:", this.task().completed))
  }
}

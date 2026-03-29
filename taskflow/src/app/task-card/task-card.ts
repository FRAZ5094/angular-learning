import { Component, computed, effect, signal, WritableSignal } from '@angular/core';

type Priority = "low" | "medium" | "high"

@Component({
  selector: 'app-task-card',
  imports: [],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  title = signal("Build the UI");
  description = signal("Build out the GUI for the task flow app")
  priority: WritableSignal<Priority> = signal("low")
  completed = signal(false)

  toggleCompleted() {
    this.completed.update((v) => !v)
  }

  statusLabel = computed(() => this.completed() ? '✅ Complete' : `📋 Pending - ${this.priority()}`)

  constructor() {
    effect(() => console.log("Status changed:", this.completed()))
  }
}

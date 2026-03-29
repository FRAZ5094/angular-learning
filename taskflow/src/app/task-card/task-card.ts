import { Component } from '@angular/core';

type Priority = "low" | "medium" | "high"

@Component({
  selector: 'app-task-card',
  imports: [],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  title: string = "Build the UI";
  description: string = "Build out the GUI for the task flow app"
  priority: Priority = "low"
  completed: boolean = false
}

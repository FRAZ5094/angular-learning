import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskCard } from "./task-card/task-card";
import { TaskList } from "./task-list/task-list";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TaskList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('taskflow');
}

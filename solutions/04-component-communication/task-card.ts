import { Component, input, output } from '@angular/core';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.html',
})
export class TaskCard {
  task = input.required<Task>();

  delete = output<string>();
  toggle = output<string>();
}

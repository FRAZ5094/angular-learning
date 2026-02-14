import { Component } from '@angular/core';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.html',
})
export class TaskCard {
  title = 'Build the UI';
  description = 'Create the main dashboard layout with task cards';
  priority = 'high';
  completed = false;
}

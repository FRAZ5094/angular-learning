import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.html',
})
export class TaskForm {
  private taskService = inject(TaskService);
  private router = inject(Router);

  form = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    description: new FormControl(''),
    priority: new FormControl<'low' | 'medium' | 'high'>('medium'),
    dueDate: new FormControl<string>(''),
  });

  onSubmit() {
    if (this.form.valid) {
      const { title, description, priority } = this.form.value;
      this.taskService.addTask({
        title: title!,
        description: description || '',
        priority: priority || 'medium',
        completed: false,
      });
      this.router.navigate(['/']);
    }
  }
}

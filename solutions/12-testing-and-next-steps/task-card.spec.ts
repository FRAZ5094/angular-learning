import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCard } from './task-card';
import { Task } from '../models/task.model';

describe('TaskCard', () => {
  let component: TaskCard;
  let fixture: ComponentFixture<TaskCard>;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'A test task description',
    priority: 'high',
    completed: false,
    createdAt: new Date('2025-01-15'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the task title', () => {
    const el = fixture.nativeElement;
    expect(el.textContent).toContain('Test Task');
  });

  it('should display the task description', () => {
    const el = fixture.nativeElement;
    expect(el.textContent).toContain('A test task description');
  });

  it('should display the priority', () => {
    const el = fixture.nativeElement;
    expect(el.textContent).toContain('High');
  });

  it('should show "Complete" button for incomplete tasks', () => {
    const el = fixture.nativeElement;
    expect(el.textContent).toContain('Complete');
  });

  it('should emit delete event when delete button is clicked', () => {
    const spy = vi.fn();
    component.delete.subscribe(spy);

    const deleteBtn = fixture.nativeElement.querySelector('[data-testid="delete-btn"]');
    deleteBtn?.click();

    expect(spy).toHaveBeenCalledWith('1');
  });

  it('should emit toggle event when toggle button is clicked', () => {
    const spy = vi.fn();
    component.toggle.subscribe(spy);

    const toggleBtn = fixture.nativeElement.querySelector('[data-testid="toggle-btn"]');
    toggleBtn?.click();

    expect(spy).toHaveBeenCalledWith('1');
  });

  it('should apply opacity class when task is completed', () => {
    const completedTask = { ...mockTask, completed: true };
    fixture.componentRef.setInput('task', completedTask);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.opacity-50');
    expect(card).toBeTruthy();
  });
});

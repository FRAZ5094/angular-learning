import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty task list', () => {
    expect(service.tasks()).toEqual([]);
  });

  it('should add a task', () => {
    service.addTask({
      title: 'Test Task',
      description: 'A test task',
      priority: 'medium',
      completed: false,
    });

    expect(service.tasks().length).toBe(1);
    expect(service.tasks()[0].title).toBe('Test Task');
    expect(service.tasks()[0].id).toBeDefined();
    expect(service.tasks()[0].createdAt).toBeDefined();
  });

  it('should delete a task', () => {
    service.addTask({
      title: 'To Delete',
      description: '',
      priority: 'low',
      completed: false,
    });
    const taskId = service.tasks()[0].id;

    service.deleteTask(taskId);

    expect(service.tasks().length).toBe(0);
  });

  it('should toggle task completion', () => {
    service.addTask({
      title: 'Toggle Me',
      description: '',
      priority: 'high',
      completed: false,
    });
    const taskId = service.tasks()[0].id;

    expect(service.tasks()[0].completed).toBe(false);

    service.toggleTask(taskId);

    expect(service.tasks()[0].completed).toBe(true);

    service.toggleTask(taskId);

    expect(service.tasks()[0].completed).toBe(false);
  });

  it('should get a task by id', () => {
    service.addTask({
      title: 'Find Me',
      description: 'I am here',
      priority: 'medium',
      completed: false,
    });
    const taskId = service.tasks()[0].id;

    const task = service.getTask(taskId);

    expect(task).toBeDefined();
    expect(task?.title).toBe('Find Me');
  });

  it('should return undefined for non-existent task', () => {
    const task = service.getTask('non-existent');
    expect(task).toBeUndefined();
  });

  it('should compute completed count', () => {
    service.addTask({ title: 'A', description: '', priority: 'high', completed: false });
    service.addTask({ title: 'B', description: '', priority: 'low', completed: true });
    service.addTask({ title: 'C', description: '', priority: 'medium', completed: true });

    expect(service.completedCount()).toBe(2);
  });

  it('should compute pending count', () => {
    service.addTask({ title: 'A', description: '', priority: 'high', completed: false });
    service.addTask({ title: 'B', description: '', priority: 'low', completed: true });
    service.addTask({ title: 'C', description: '', priority: 'medium', completed: false });

    expect(service.pendingCount()).toBe(2);
  });
});

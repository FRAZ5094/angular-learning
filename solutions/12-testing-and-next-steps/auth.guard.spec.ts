import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: Router,
          useValue: { createUrlTree: vi.fn((commands: string[]) => commands) },
        },
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  describe('authGuard', () => {
    it('should allow access when user is logged in', () => {
      vi.spyOn(authService, 'isLoggedIn').mockReturnValue(true as any);

      const result = TestBed.runInInjectionContext(() =>
        authGuard({} as any, {} as any)
      );

      expect(result).toBe(true);
    });

    it('should redirect to /login when user is not logged in', () => {
      vi.spyOn(authService, 'isLoggedIn').mockReturnValue(false as any);

      TestBed.runInInjectionContext(() =>
        authGuard({} as any, {} as any)
      );

      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('guestGuard', () => {
    it('should allow access when user is not logged in', () => {
      vi.spyOn(authService, 'isLoggedIn').mockReturnValue(false as any);

      const result = TestBed.runInInjectionContext(() =>
        guestGuard({} as any, {} as any)
      );

      expect(result).toBe(true);
    });

    it('should redirect to / when user is logged in', () => {
      vi.spyOn(authService, 'isLoggedIn').mockReturnValue(true as any);

      TestBed.runInInjectionContext(() =>
        guestGuard({} as any, {} as any)
      );

      expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
    });
  });
});

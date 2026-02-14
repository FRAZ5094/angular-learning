import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      console.error(`HTTP Error ${error.status}: ${error.message}`);
      console.error('Request URL:', req.url);
      throw error;
    })
  );
};

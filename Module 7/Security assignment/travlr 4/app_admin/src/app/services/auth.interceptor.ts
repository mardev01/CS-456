import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthenticationService } from './authentication.service';
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);
  const protectedRequest = request.url.startsWith('http://localhost:3000/api/') &&
    !request.url.endsWith('/login');
  const token = protectedRequest && auth.isLoggedIn() ? auth.getToken() : null;
  const authenticated = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(authenticated).pipe(catchError((error: HttpErrorResponse) => {
    if (protectedRequest && error.status === 401) {
      auth.logout();
      router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
    }
    return throwError(() => error);
  }));
};

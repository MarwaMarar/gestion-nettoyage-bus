import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  const isLoginRequest = request.url.endsWith('/auth/login');

  if (token && !auth.isTokenUsable() && !isLoginRequest) {
    auth.logout();
    void router.navigateByUrl('/login');
    return throwError(() => new HttpErrorResponse({
      status: 401,
      statusText: 'Session expiree',
      url: request.url,
      error: { message: 'Votre session a expire. Veuillez vous reconnecter.' }
    }));
  }

  const authenticatedRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoginRequest) {
        auth.logout();
        void router.navigateByUrl('/login');
        return throwError(() => new HttpErrorResponse({
          status: 401,
          statusText: 'Session invalide',
          url: request.url,
          error: { message: 'Votre session n\'est plus valide. Veuillez vous reconnecter.' }
        }));
      }
      return throwError(() => error);
    })
  );
};

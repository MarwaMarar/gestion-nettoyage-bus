import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './service/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  const auth = inject(AuthService);
  return auth.validateSession().pipe(
    map(valid => valid ? true : router.createUrlTree(['/login']))
  );
};

export const passwordChangeGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);
  return auth.validateSession().pipe(map(valid => valid && auth.currentUser()?.mustChangePassword
    ? true : router.createUrlTree([valid ? destination(auth.currentUser()?.role) : '/login'])));
};

export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);
  if (!auth.getToken()) return true;
  return auth.validateSession().pipe(map(valid => !valid ? true : router.createUrlTree([
    auth.currentUser()?.mustChangePassword ? '/change-password' : destination(auth.currentUser()?.role)
  ])));
};

function destination(role?: string): string {
  return role === 'CONSULTANT' ? '/consultant/tableau-de-bord'
    : role === 'NETTOYEUR' ? '/nettoyeur/tableau-de-bord'
    : role === 'SUPERVISEUR' ? '/superviseur/tableau-de-bord' : '/admin/tableau-de-bord';
}

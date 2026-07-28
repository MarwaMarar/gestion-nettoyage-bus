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

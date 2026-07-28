import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { Role } from '../models/api.models';
import { AuthService } from '../services/auth.service';

export const roleGuard = (roles: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.validateRole(roles).pipe(
    map(valid => valid ? true : router.createUrlTree(['/login']))
  );
};

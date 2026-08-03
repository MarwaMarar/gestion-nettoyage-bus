import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { Role } from './service/api.models';
import { AuthService } from './service/auth.service';

export const roleGuard = (roles: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.validateRoles(roles).pipe(
    map(valid => {
      if (valid) return true;
      const role = auth.currentUser()?.role;
<<<<<<< HEAD
      const destination = auth.currentUser()?.mustChangePassword
        ? '/change-password'
        : role === 'CONSULTANT'
        ? '/consultant/tableau-de-bord'
        : role === 'ADMINISTRATEUR'
=======
      const destination = role === 'ADMINISTRATEUR'
>>>>>>> e35a0c0 (fully works)
        ? '/admin/tableau-de-bord'
        : role === 'NETTOYEUR'
          ? '/nettoyeur/tableau-de-bord'
          : role === 'SUPERVISEUR'
            ? '/superviseur/tableau-de-bord'
            : '/login';
      return router.createUrlTree([destination]);
    })
  );
};

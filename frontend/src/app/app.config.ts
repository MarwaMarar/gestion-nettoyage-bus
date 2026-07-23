import { ApplicationConfig, ApplicationRef, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { finalize } from 'rxjs';

import { routes } from './app.routes';

const refreshViewAfterHttp: HttpInterceptorFn = (request, next) => {
  const applicationRef = inject(ApplicationRef);
  return next(request).pipe(
    finalize(() => queueMicrotask(() => applicationRef.tick()))
  );
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([refreshViewAfterHttp]))
  ]
};

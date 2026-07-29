import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { environment } from '../environments/environment';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly sessionMessageHandler = (event: MessageEvent) => {
    const sameOrigin = event.origin === window.location.origin;
    if (!sameOrigin && !environment.adminAppOrigins.includes(event.origin)) return;
    if (event.data?.type !== 'ALSA_ADMIN_SESSION') return;
    if (typeof event.data.token !== 'string') return;
    if (event.data.vue !== 'superviseur' && event.data.vue !== 'nettoyeur') return;

    this.auth.acceptTransferredSession(event.data.token);
    this.auth.validateRole(['ADMINISTRATEUR']).subscribe(valid => {
      if (!valid) return;
      const route = event.data.vue === 'superviseur'
        ? '/superviseur-dashboard'
        : '/dashboard';
      this.router.navigateByUrl(route);
    });
  };

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    window.addEventListener('message', this.sessionMessageHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.sessionMessageHandler);
  }
}

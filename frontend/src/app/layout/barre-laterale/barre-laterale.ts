import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../service/layout.service';
import { AuthService } from '../../service/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-barre-laterale',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './barre-laterale.html',
  styleUrls: ['./barre-laterale.css']
})
export class BarreLaterale {
  layoutService = inject(LayoutService);
  readonly mobileAppUrl = environment.mobileAppUrl;
  private readonly auth = inject(AuthService);

  ouvrirVueMobile(
    vue: 'superviseur' | 'nettoyeur',
    event: Event
  ): void {
    event.preventDefault();
    this.layoutService.closeSidebar();

    const token = this.auth.getToken();
    if (!token) return;

    const route = vue === 'superviseur' ? 'superviseur-dashboard' : 'dashboard';
    const mobileUrl = new URL(route, `${environment.mobileAppUrl}/`);
    const mobileWindow = window.open(mobileUrl.toString(), '_blank');
    if (!mobileWindow) return;

    const message = {
      type: 'ALSA_ADMIN_SESSION',
      token,
      vue
    };
    const targetOrigin = new URL(environment.mobileAppUrl).origin;
    let attempts = 0;
    const transfer = window.setInterval(() => {
      if (mobileWindow.closed || attempts++ >= 20) {
        window.clearInterval(transfer);
        return;
      }
      mobileWindow.postMessage(message, targetOrigin);
    }, 250);
  }
}

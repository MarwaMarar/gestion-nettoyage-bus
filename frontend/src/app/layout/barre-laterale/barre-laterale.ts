import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../service/layout.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-barre-laterale',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './barre-laterale.html',
  styleUrls: ['./barre-laterale.css']
})
export class BarreLaterale {
  layoutService = inject(LayoutService);
  auth = inject(AuthService);

  get role() { return this.auth.currentUser()?.role; }

  get home(): string {
    return this.role === 'NETTOYEUR'
      ? '/nettoyeur/tableau-de-bord'
      : this.role === 'SUPERVISEUR'
        ? '/superviseur/tableau-de-bord'
        : '/admin/tableau-de-bord';
  }
}

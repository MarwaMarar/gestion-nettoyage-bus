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
<<<<<<< HEAD
    return this.role === 'CONSULTANT'
      ? '/consultant/tableau-de-bord'
      : this.role === 'NETTOYEUR'
=======
    return this.role === 'NETTOYEUR'
>>>>>>> e35a0c0 (fully works)
      ? '/nettoyeur/tableau-de-bord'
      : this.role === 'SUPERVISEUR'
        ? '/superviseur/tableau-de-bord'
        : '/admin/tableau-de-bord';
  }
}

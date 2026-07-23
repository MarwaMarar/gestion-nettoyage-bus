import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutService } from '../../service/layout.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-barre-superieure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barre-superieure.html',
  styleUrls: ['./barre-superieure.css']
})
export class BarreSuperieureComponent {

  notificationsOuvert = false;
  profilOuvert = false;

  layoutService = inject(LayoutService);

  constructor(private router: Router, private auth: AuthService) {}


  deconnexion() {

    this.auth.logout();
    this.router.navigate(['/login']);

  }


  allerProfil() {
    this.router.navigate(['/admin/profil']);
    this.profilOuvert = false;
  }


  allerParametres() {
    this.router.navigate(['/admin/parametres']);
    this.profilOuvert = false;
  }

}

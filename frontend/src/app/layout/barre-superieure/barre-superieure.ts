import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutService } from '../../service/layout.service';

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

  constructor(private router: Router) {}


  deconnexion() {

    localStorage.removeItem('adminConnecte');
    localStorage.removeItem('user');
    localStorage.removeItem('token');

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

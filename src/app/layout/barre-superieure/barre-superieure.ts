import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}


  deconnexion() {


    localStorage.removeItem('user');
    localStorage.removeItem('token');

    this.router.navigate(['/login']);

  }


  allerProfil() {
    this.router.navigate(['/profil']);
    this.profilOuvert = false;
  }


  allerParametres() {
    this.router.navigate(['/parametres']);
    this.profilOuvert = false;
  }

}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-barre-superieure',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './barre-superieure.html',
  styleUrl: './barre-superieure.css',
})
export class BarreSuperieure {


  profilOuvert = false;
  notificationsOuvert = false;


  constructor(
    private router: Router
  ){}



  allerProfil(){

    this.router.navigate(['/admin/profil']);

    this.profilOuvert = false;

  }



  allerParametres(){

    this.router.navigate(['/admin/parametres']);

    this.profilOuvert = false;

  }



  deconnexion(){

    console.log("Déconnexion");

  }


}

import { Component } from '@angular/core';

@Component({
  selector: 'app-tableau-de-bord',
  standalone: true,
  templateUrl: './tableau-de-bord.html',
  styleUrl: './tableau-de-bord.css'
})
export class TableauDeBordComponent {

bus = 12;
nettoyagesJour = 4;
nettoyagesValides = 15;
nettoyagesRefuses = 2;
nettoyagesAttente = 3;
pourcentageValidation = 75;

}



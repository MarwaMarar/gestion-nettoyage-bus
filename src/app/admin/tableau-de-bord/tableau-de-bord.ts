import { Component } from '@angular/core';

@Component({
  selector: 'app-tableau-de-bord',
  standalone: true,
  templateUrl: './tableau-de-bord.html',
  styleUrl: './tableau-de-bord.css'
})
export class TableauDeBordComponent {

  bus = 12;
  utilisateurs = 5;
  nettoyages = 20;
  rapports = 3;

}



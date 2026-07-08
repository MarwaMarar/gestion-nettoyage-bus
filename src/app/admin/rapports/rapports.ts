import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './rapports.html',
  styleUrl: './rapports.css',
})
export class Rapports {

  totalBus = 18;
  totalAgents = 10;
  nettoyagesTermines = 25;
  nettoyagesEnAttente = 7;

  rapports = [

    {
      bus: 'Bus 12',
      type: 'Tous les 2 jours',
      date: '08/07/2026',
      agent: 'Ahmed',
      statut: 'Terminé'
    },

    {
      bus: 'Bus 18',
      type: 'Chaque semaine',
      date: '10/07/2026',
      agent: 'Yassine',
      statut: 'En attente'
    }

  ];
    recherche = '';

    get rapportsFiltres() {

  return this.rapports.filter(rapport =>
    rapport.bus.toLowerCase().includes(this.recherche.toLowerCase()) ||
    rapport.agent.toLowerCase().includes(this.recherche.toLowerCase()) ||
    rapport.type.toLowerCase().includes(this.recherche.toLowerCase())
  );

}
}

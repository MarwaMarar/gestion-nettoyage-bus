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

  dateDebut = '';
  dateFin = '';
  recherche = '';


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



  get rapportsFiltres() {

    return this.rapports.filter(rapport => {


      
      const rechercheTexte =
        rapport.bus.toLowerCase().includes(this.recherche.toLowerCase()) ||
        rapport.agent.toLowerCase().includes(this.recherche.toLowerCase()) ||
        rapport.type.toLowerCase().includes(this.recherche.toLowerCase());



     
      const dateRapport = this.convertirDate(rapport.date);



     
      const dateDebutOK =
        !this.dateDebut ||
        dateRapport >= new Date(this.dateDebut);



      const dateFinOK =
        !this.dateFin ||
        dateRapport <= new Date(this.dateFin);



      return rechercheTexte && dateDebutOK && dateFinOK;

    });

  }



  convertirDate(date: string) {

    const [jour, mois, annee] = date.split('/');


    return new Date(
      Number(annee),
      Number(mois) - 1,
      Number(jour)
    );

  }

}

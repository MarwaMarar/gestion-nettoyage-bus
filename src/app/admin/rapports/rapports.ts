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


  // =========================
  // FILTRES
  // =========================

  dateDebut = '';
  dateFin = '';

  busSelectionne = '';
  nettoyeurSelectionne = '';
  superviseurSelectionne = '';
  statutSelectionne = '';
  typeSelectionne = '';



  // =========================
  // LISTES SELECT
  // =========================

  listeBus = [
    'Bus 12',
    'Bus 18',
    'Bus 25'
  ];


  listeAgents = [
    'Ahmed',
    'Yassine',
    'Sara'
  ];


  listeSuperviseurs = [
    'Mohamed',
    'Khadija'
  ];

  listeTypes = [
  'Nettoyage intérieur',
  'Nettoyage extérieur',
  'Nettoyage complet',
  'Désinfection',
  'Lavage rapide',
  'Nettoyage avant mise en service'
];

  // =========================
  // DONNEES RAPPORTS
  // =========================

  rapports = [

  {
    bus: 'Bus 12',
    type: 'Nettoyage intérieur',
    nettoyeur: 'Ahmed',
    superviseur: 'Mohamed',
    date: '08/07/2026',
    duree: '45 min',
    statut: 'Validé'
  },


  {
    bus: 'Bus 18',
    type: 'Nettoyage extérieur',
    nettoyeur: 'Yassine',
    superviseur: 'Khadija',
    date: '10/07/2026',
    duree: '1h',
    statut: 'En attente'
  },


  {
    bus: 'Bus 25',
    type: 'Désinfection',
    nettoyeur: 'Sara',
    superviseur: 'Mohamed',
    date: '12/07/2026',
    duree: '50 min',
    statut: 'Refusé'
  }

];



  // =========================
  // STATISTIQUES
  // =========================

  get totalNettoyages() {
    return this.rapports.length;
  }


  get nettoyagesValides() {

    return this.rapports.filter(
      r => r.statut === 'Validé'
    ).length;

  }


  get nettoyagesRefuses() {

    return this.rapports.filter(
      r => r.statut === 'Refusé'
    ).length;

  }


  get nettoyagesEnAttente() {

    return this.rapports.filter(
      r => r.statut === 'En attente'
    ).length;

  }




  // =========================
  // FILTRAGE
  // =========================

  get rapportsFiltres() {


    return this.rapports.filter(rapport => {


      const dateRapport =
        this.convertirDate(rapport.date);



      const dateDebutOK =
        !this.dateDebut ||
        dateRapport >= new Date(this.dateDebut);



      const dateFinOK =
        !this.dateFin ||
        dateRapport <= new Date(this.dateFin);



      const busOK =
        !this.busSelectionne ||
        rapport.bus === this.busSelectionne;



      const nettoyeurOK =
        !this.nettoyeurSelectionne ||
        rapport.nettoyeur === this.nettoyeurSelectionne;



      const superviseurOK =
        !this.superviseurSelectionne ||
        rapport.superviseur === this.superviseurSelectionne;



      const statutOK =
        !this.statutSelectionne ||
        rapport.statut === this.statutSelectionne;


      const typeOK =
        !this.typeSelectionne ||
        rapport.type === this.typeSelectionne;


      return (
        dateDebutOK &&
        dateFinOK &&
        busOK &&
        nettoyeurOK &&
        superviseurOK &&
        statutOK &&
        typeOK
      );


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


  exportExcel() {

  console.log("Excel clicked");

  let contenu =
  "Bus,Type,Nettoyeur,Superviseur,Date,Duree,Statut\n";


  this.rapportsFiltres.forEach(r => {

    contenu += `${r.bus},${r.type},${r.nettoyeur},${r.superviseur},${r.date},${r.duree},${r.statut}\n`;

  });


  const blob = new Blob(
    [contenu],
    {type:'text/csv'}
  );


  const url = window.URL.createObjectURL(blob);

  const lien = document.createElement('a');

  lien.href = url;
  lien.download = "rapports-nettoyage.csv";

  document.body.appendChild(lien);

  lien.click();

  document.body.removeChild(lien);

}



exportPDF() {

  console.log("PDF clicked");

  window.print();

}


}

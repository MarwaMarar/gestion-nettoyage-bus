import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nettoyages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nettoyages.html',
  styleUrl: './nettoyages.css',
})
export class Nettoyages {

  afficherFormulaire = false;

  modeModification = false;

  nettoyageSelectionne: any = null;


  bus = [
    'Bus 12',
    'Bus 18'
  ];


  nettoyage = [

    {
      id: 1,
      bus: 'Bus 12',
      type: 'Tous les 2 jours',
      date: '08/07/2026',
      statut: 'Terminé'
    },

    {
      id: 2,
      bus: 'Bus 18',
      type: 'Chaque semaine',
      date: '10/07/2026',
      statut: 'En attente'
    }

  ];


  busChoisi = '';
  type = '';
  date = '';
  statut = '';
  recherche = '';



  // ouvrir formulaire ajout
  ajouterNettoyage() {

    this.afficherFormulaire = true;
    this.modeModification = false;

    this.busChoisi = '';
    this.type = '';
    this.date = '';
    this.statut = '';

  }

get nettoyagesFiltres() {

  return this.nettoyage.filter(n =>
    n.bus.toLowerCase().includes(this.recherche.toLowerCase()) ||
    n.type.toLowerCase().includes(this.recherche.toLowerCase()) ||
    n.statut.toLowerCase().includes(this.recherche.toLowerCase())
  );

}

  // ajouter ou modifier
  enregistrerNettoyage() {


    if (this.modeModification) {


      this.nettoyageSelectionne.bus = this.busChoisi;
      this.nettoyageSelectionne.type = this.type;
      this.nettoyageSelectionne.date = this.date;
      this.nettoyageSelectionne.statut = this.statut;


    } else {


      this.nettoyage.push({

        id: this.nettoyage.length + 1,
        bus: this.busChoisi,
        type: this.type,
        date: this.date,
        statut: this.statut

      });


    }



    this.busChoisi = '';
    this.type = '';
    this.date = '';
    this.statut = '';

    this.afficherFormulaire = false;
    this.modeModification = false;

  }




  // supprimer nettoyage
  supprimerNettoyage(id: any) {

    this.nettoyage = this.nettoyage.filter(
      n => n.id != id
    );

  }




  // modifier nettoyage
  modifierNettoyage(n: any) {


    this.nettoyageSelectionne = n;


    this.busChoisi = n.bus;
    this.type = n.type;
    this.date = n.date;
    this.statut = n.statut;


    this.afficherFormulaire = true;
    this.modeModification = true;


  }


}

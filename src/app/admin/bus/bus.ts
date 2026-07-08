import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bus',
  imports: [CommonModule, FormsModule],
  templateUrl: './bus.html',
  styleUrl: './bus.css',
})
export class Bus {

  afficherFormulaire = false;

  modeModification = false;

  busSelectionne: any = null;


  numero = '';
  immatriculation = '';
  statut = '';
  recherche = '';


  bus = [
    {
      id: 1,
      numero: '12',
      immatriculation: '12345-A-6',
      statut: 'Propre'
    },
    {
      id: 2,
      numero: '18',
      immatriculation: '45678-B-1',
      statut: 'Sale'
    }
  ];


  // ouvrir formulaire
  ajouterBus() {
    this.afficherFormulaire = true;
    this.modeModification = false;

    this.numero = '';
    this.immatriculation = '';
    this.statut = '';
  }

  get busFiltres() {
  return this.bus.filter(bus =>
    bus.numero.toLowerCase().includes(this.recherche.toLowerCase()) ||
    bus.immatriculation.toLowerCase().includes(this.recherche.toLowerCase())
  );
  }
  // enregistrer ajout ou modification
  enregistrerBus() {

    if (this.modeModification) {

      this.busSelectionne.numero = this.numero;
      this.busSelectionne.immatriculation = this.immatriculation;
      this.busSelectionne.statut = this.statut;

    } else {

      this.bus.push({
        id: this.bus.length + 1,
        numero: this.numero,
        immatriculation: this.immatriculation,
        statut: this.statut
      });

    }


    this.numero = '';
    this.immatriculation = '';
    this.statut = '';

    this.afficherFormulaire = false;
    this.modeModification = false;

  }


  // supprimer bus
  supprimerBus(id: number) {

    this.bus = this.bus.filter(
      bus => bus.id !== id
    );

  }


  // modifier bus
  modifierBus(bus: any) {

    this.busSelectionne = bus;

    this.numero = bus.numero;
    this.immatriculation = bus.immatriculation;
    this.statut = bus.statut;

    this.afficherFormulaire = true;
    this.modeModification = true;

  }

}

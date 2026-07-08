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
  assignation = '';
  recherche = '';


  bus = [
    {
      id: 1,
      numero: '12',
      immatriculation: '12345-A-6',
      assignation: 'ARTIS'
    },
    {
      id: 2,
      numero: '18',
      immatriculation: '45678-B-1',
      assignation: 'KARID'
    }
  ];


  // ouvrir formulaire
  ajouterBus() {
    this.afficherFormulaire = true;
    this.modeModification = false;

    this.numero = '';
    this.immatriculation = '';
    this.assignation = '';
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
      this.busSelectionne.assignation = this.assignation;

    } else {

      this.bus.push({
        id: this.bus.length + 1,
        numero: this.numero,
        immatriculation: this.immatriculation,
        assignation: this.assignation
      });

    }


    this.numero = '';
    this.immatriculation = '';
    this.assignation = '';

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
    this.assignation= bus.assignation;

    this.afficherFormulaire = true;
    this.modeModification = true;

  }

}

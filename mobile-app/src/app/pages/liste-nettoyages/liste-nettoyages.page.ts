import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  busOutline,
  personOutline,
  sparklesOutline,
  hourglassOutline,
  eyeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-liste-nettoyages',
  templateUrl: './liste-nettoyages.page.html',
  styleUrls: ['./liste-nettoyages.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon
  ]
})
export class ListeNettoyagesPage {

  nettoyages = [

    {
      bus: 'Bus 101',
      nettoyeur: 'Adam Marar',
      type: 'Nettoyage complet',
      statut: 'En attente'
    },

    {
      bus: 'Bus 205',
      nettoyeur: 'Mohamed Ali',
      type: 'Nettoyage intérieur',
      statut: 'En attente'
    },

    {
      bus: 'Bus 312',
      nettoyeur: 'Yassine',
      type: 'Désinfection',
      statut: 'En attente'
    }

  ];

  constructor(private router: Router) {

    addIcons({

      'bus-outline': busOutline,

      'person-outline': personOutline,

      'sparkles-outline': sparklesOutline,

      'hourglass-outline': hourglassOutline,

      'eye-outline': eyeOutline

    });

  }

  voirDetails(nettoyage: any) {

    this.router.navigate(['/details-nettoyage'], {

      state: nettoyage

    });

  }

}

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
  hourglassOutline,
  eyeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-superviseur-dashboard',
  templateUrl: './superviseur-dashboard.page.html',
  styleUrls: ['./superviseur-dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon
  ]
})
export class SuperviseurDashboardPage {

  // Nombre de nettoyages en attente
  totalEnAttente = 12;

  constructor(private router: Router) {

    addIcons({

      'hourglass-outline': hourglassOutline,

      'eye-outline': eyeOutline

    });

  }

  voirDetails() {

    this.router.navigate(['/liste-nettoyages']);

  }

}

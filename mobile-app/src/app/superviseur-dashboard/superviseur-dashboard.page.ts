import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OnInit } from '@angular/core';

import {
  IonContent,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  hourglassOutline,
  eyeOutline,
  notificationsOutline,
  calendarClearOutline
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
    IonIcon,
    RouterLink
  ]
})
export class SuperviseurDashboardPage implements OnInit {

  today: string = '';

  // Nombre de nettoyages en attente
  totalEnAttente = 12;

  constructor(private router: Router) {

   addIcons({

  'hourglass-outline': hourglassOutline,
  'eye-outline': eyeOutline,
  'notifications-outline': notificationsOutline,
  'calendar-clear-outline': calendarClearOutline

});

  }

  voirDetails() {

    this.router.navigate(['/liste-nettoyages']);

  }

  ngOnInit(): void {

  const now = new Date();

  this.today = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

}

}

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
import { NettoyageService } from '../services/nettoyage.service';

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

  totalEnAttente = 0;

  constructor(private router: Router, private nettoyages: NettoyageService) {

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

  this.nettoyages.enAttente().subscribe({
    next: values => this.totalEnAttente = values.length,
    error: error => alert(error?.error?.message || 'Impossible de charger les nettoyages en attente.')
  });
}

}

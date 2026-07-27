import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { arrowBackOutline } from 'ionicons/icons';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  notificationsOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    RouterLink
  ]
})
export class NotificationsPage {

  notifications = [

    {
      titre: 'Nettoyage validé',
      message: 'Le nettoyage du Bus 101 a été validé.',
      heure: 'Il y a 5 min',
      type: 'success',
      lu:false
    },

    {
      titre: 'Nettoyage refusé',
      message: 'Bus 205 - Motif : Vitres sales.',
      heure: 'Il y a 18 min',
      type: 'danger',
      lu:false
    },

    {
      titre: 'En attente',
      message: 'Le nettoyage du Bus 312 est en attente de validation.',
      heure: 'Il y a 1 heure',
      type: 'info',
      lu: true
    }

  ];

constructor() {

  addIcons({

    'notifications-outline': notificationsOutline,
    'checkmark-circle-outline': checkmarkCircleOutline,
    'close-circle-outline': closeCircleOutline,
    'time-outline': timeOutline,
    'arrow-back-outline': arrowBackOutline

  });

}

ouvrirNotification(notification: any) {

  notification.lu = true;

}
}

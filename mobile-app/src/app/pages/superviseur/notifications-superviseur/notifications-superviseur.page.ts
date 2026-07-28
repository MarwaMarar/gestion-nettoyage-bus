import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  notificationsOutline,
  arrowBackOutline,
  checkmarkDoneOutline,
  busOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-notifications-superviseur',
  templateUrl: './notifications-superviseur.page.html',
  styleUrls: ['./notifications-superviseur.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonIcon,
    IonButton
  ]
})
export class NotificationsSuperviseurPage {

  notifications = [

    {
      titre: 'Nouveau nettoyage soumis',
      message: 'Bus 101 - Nettoyage complet envoyé par Adam Marar.',
      heure: 'Il y a 2 min',
      icon: 'bus-outline',
      type: 'primary',
      lu: false
    },

    {
      titre: 'Nouveau nettoyage soumis',
      message: 'Bus 205 - Nettoyage intérieur envoyé par Mohamed Ali.',
      heure: 'Il y a 10 min',
      icon: 'bus-outline',
      type: 'primary',
      lu: false
    },

    {
      titre: 'Nouveau nettoyage soumis',
      message: 'Bus 312 - Désinfection envoyée par Yassine.',
      heure: 'Il y a 1 heure',
      icon: 'bus-outline',
      type: 'primary',
      lu: true
    }

  ];

  constructor() {

    addIcons({

      'notifications-outline': notificationsOutline,
      'arrow-back-outline': arrowBackOutline,
      'checkmark-done-outline': checkmarkDoneOutline,
      'bus-outline': busOutline

    });

  }

  ouvrirNotification(notification: any) {

    notification.lu = true;

  }

  toutMarquerCommeLu() {

    this.notifications.forEach(notification => {

      notification.lu = true;

    });

  }

}

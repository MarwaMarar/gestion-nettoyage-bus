import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonButton,
  IonTextarea,
  IonIcon,
  AlertController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  busOutline,
  personOutline,
  sparklesOutline,
  calendarOutline,
  playCircleOutline,
  stopCircleOutline,
  timerOutline,
  chatbubbleEllipsesOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  createOutline,
  paperPlaneOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-details-nettoyage',
  templateUrl: './details-nettoyage.page.html',
  styleUrls: ['./details-nettoyage.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonTextarea,
    IonIcon
  ]
})
export class DetailsNettoyagePage {

  nettoyage: any;

  showRefus = false;

  motif = '';

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state) {

      this.nettoyage = navigation.extras.state;

    } else {

      this.nettoyage = {

        bus: 'Bus 101',
        nettoyeur: 'Adam Marar',
        type: 'Nettoyage complet',
        date: '24/07/2026',
        heureDebut: '09:15',
        heureFin: '09:42',
        duree: '00:27:00',
        remarque: 'Nettoyage terminé.'

      };

    }

    addIcons({

      'bus-outline': busOutline,
      'person-outline': personOutline,
      'sparkles-outline': sparklesOutline,
      'calendar-outline': calendarOutline,
      'play-circle-outline': playCircleOutline,
      'stop-circle-outline': stopCircleOutline,
      'timer-outline': timerOutline,
      'chatbubble-ellipses-outline': chatbubbleEllipsesOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline,
      'create-outline': createOutline,
      'paper-plane-outline': paperPlaneOutline

    });

  }

  async valider() {

    const alert = await this.alertController.create({

      header: 'Succès',

      message: 'Le nettoyage a été validé avec succès.',

      buttons: ['OK']

    });

    await alert.present();

    this.router.navigate(['/liste-nettoyages']);

  }

  async refuser() {

    if (this.motif.trim() === '') {

      const alert = await this.alertController.create({

        header: 'Attention',

        message: 'Veuillez saisir le motif du refus.',

        buttons: ['OK']

      });

      await alert.present();

      return;

    }

    const alert = await this.alertController.create({

      header: 'Refus envoyé',

      message: 'Le nettoyage a été refusé avec succès.',

      buttons: ['OK']

    });

    await alert.present();

    this.router.navigate(['/liste-nettoyages']);

  }

}

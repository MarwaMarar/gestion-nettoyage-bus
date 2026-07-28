import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  arrowBackOutline,
  checkmarkDoneOutline,
  busOutline
} from 'ionicons/icons';
import { Nettoyage } from '../../../models/api.models';
import { NettoyageService } from '../../../services/nettoyage.service';

interface SupervisorNotification {
  nettoyage: Nettoyage;
  titre: string;
  message: string;
  heure: string;
  icon: string;
  type: string;
  lu: boolean;
}

@Component({
  selector: 'app-notifications-superviseur',
  templateUrl: './notifications-superviseur.page.html',
  styleUrls: ['./notifications-superviseur.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonIcon, IonButton]
})
export class NotificationsSuperviseurPage implements OnInit {
  notifications: SupervisorNotification[] = [];

  constructor(
    private router: Router,
    private nettoyages: NettoyageService
  ) {
    addIcons({
      'notifications-outline': notificationsOutline,
      'arrow-back-outline': arrowBackOutline,
      'checkmark-done-outline': checkmarkDoneOutline,
      'bus-outline': busOutline
    });
  }

  ngOnInit(): void {
    this.nettoyages.enAttente().subscribe({
      next: values => this.notifications = values.map(nettoyage => ({
        nettoyage,
        titre: 'Nouveau nettoyage soumis',
        message: `${nettoyage.numeroBus} — ${nettoyage.typeNettoyageLibelle} — ${nettoyage.nettoyeurNom}`,
        heure: new Date(nettoyage.heureFin ?? nettoyage.dateNettoyage).toLocaleString('fr-FR'),
        icon: 'bus-outline',
        type: 'primary',
        lu: false
      })),
      error: error => alert(error?.error?.message || 'Impossible de charger les notifications.')
    });
  }

  ouvrirNotification(notification: SupervisorNotification): void {
    notification.lu = true;
    this.router.navigate(['/details-nettoyage', notification.nettoyage.id]);
  }

  toutMarquerCommeLu(): void {
    this.notifications.forEach(notification => notification.lu = true);
  }
}

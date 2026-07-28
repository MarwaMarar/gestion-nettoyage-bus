import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  notificationsOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  checkmarkDoneOutline
} from 'ionicons/icons';
import { Nettoyage, StatutNettoyage } from '../../models/api.models';
import { NettoyageService } from '../../services/nettoyage.service';

interface HistoryView {
  titre: string;
  message: string;
  heure: string;
  type: 'success' | 'danger' | 'info';
  lu: boolean;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonButton, RouterLink]
})
export class NotificationsPage implements OnInit {
  notifications: HistoryView[] = [];

  constructor(private nettoyages: NettoyageService) {
    addIcons({
      'notifications-outline': notificationsOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline,
      'time-outline': timeOutline,
      'arrow-back-outline': arrowBackOutline,
      'checkmark-done-outline': checkmarkDoneOutline
    });
  }

  ngOnInit(): void {
    this.nettoyages.mesNettoyages().subscribe({
      next: values => this.notifications = values.map(value => this.toView(value)),
      error: error => alert(error?.error?.message || "Impossible de charger l'historique.")
    });
  }

  ouvrirNotification(notification: HistoryView): void {
    notification.lu = true;
  }

  toutMarquerCommeLu(): void {
    this.notifications.forEach(notification => notification.lu = true);
  }

  private toView(nettoyage: Nettoyage): HistoryView {
    const labels: Record<StatutNettoyage, string> = {
      EN_COURS: 'Nettoyage en cours',
      EN_ATTENTE: 'En attente de validation',
      VALIDE: 'Nettoyage validé',
      REFUSE: 'Nettoyage refusé'
    };
    const types: Record<StatutNettoyage, HistoryView['type']> = {
      EN_COURS: 'info',
      EN_ATTENTE: 'info',
      VALIDE: 'success',
      REFUSE: 'danger'
    };
    const remark = nettoyage.remarqueSuperviseur
      ? ` — ${nettoyage.remarqueSuperviseur}`
      : '';
    return {
      titre: labels[nettoyage.statut],
      message: `${nettoyage.numeroBus} — ${nettoyage.typeNettoyageLibelle}${remark}`,
      heure: new Date(`${nettoyage.dateNettoyage}T00:00:00`).toLocaleDateString('fr-FR'),
      type: types[nettoyage.statut],
      lu: true
    };
  }
}

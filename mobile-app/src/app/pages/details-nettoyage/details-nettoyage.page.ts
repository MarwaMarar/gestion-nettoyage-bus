import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonContent,
  IonIcon,
  IonTextarea
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
import { Nettoyage } from '../../models/api.models';
import { NettoyageService } from '../../services/nettoyage.service';

@Component({
  selector: 'app-details-nettoyage',
  templateUrl: './details-nettoyage.page.html',
  styleUrls: ['./details-nettoyage.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonTextarea, IonIcon]
})
export class DetailsNettoyagePage implements OnInit {
  nettoyage?: Nettoyage;
  showRefus = false;
  motif = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private nettoyages: NettoyageService
  ) {
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

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.router.navigateByUrl('/liste-nettoyages');
      return;
    }
    this.nettoyages.getById(id).subscribe({
      next: value => this.nettoyage = value,
      error: error => {
        alert(error?.error?.message || 'Impossible de charger le nettoyage.');
        this.router.navigateByUrl('/liste-nettoyages');
      }
    });
  }

  valider(): void {
    if (!this.nettoyage || this.loading) return;
    this.loading = true;
    this.nettoyages.valider(this.nettoyage.id).subscribe({
      next: async () => {
        this.loading = false;
        await this.showMessage('Succès', 'Le nettoyage a été validé avec succès.');
        this.router.navigateByUrl('/liste-nettoyages');
      },
      error: error => {
        this.loading = false;
        this.showMessage('Erreur', error?.error?.message || 'Validation impossible.');
      }
    });
  }

  refuser(): void {
    if (!this.nettoyage || this.loading) return;
    if (!this.motif.trim()) {
      this.showMessage('Attention', 'Veuillez saisir le motif du refus.');
      return;
    }
    this.loading = true;
    this.nettoyages.refuser(this.nettoyage.id, this.motif.trim()).subscribe({
      next: async () => {
        this.loading = false;
        await this.showMessage('Refus envoyé', 'Le nettoyage a été refusé avec succès.');
        this.router.navigateByUrl('/liste-nettoyages');
      },
      error: error => {
        this.loading = false;
        this.showMessage('Erreur', error?.error?.message || 'Refus impossible.');
      }
    });
  }

  private async showMessage(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}

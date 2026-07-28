import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonIcon, IonTextarea } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  busOutline,
  sparklesOutline,
  calendarOutline,
  timeOutline,
  timerOutline,
  createOutline,
  paperPlaneOutline
} from 'ionicons/icons';
import { Nettoyage } from '../../../models/api.models';
import { NettoyageService } from '../../../services/nettoyage.service';

@Component({
  selector: 'app-fin-nettoyage',
  templateUrl: './fin-nettoyage.page.html',
  styleUrls: ['./fin-nettoyage.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonTextarea, IonIcon]
})
export class FinNettoyagePage implements OnInit {
  nettoyage: Nettoyage | null = null;
  bus = '';
  type = '';
  date = '';
  heureDebut = '';
  heureFin = '';
  duree = '';
  remarque = '';
  loading = false;

  constructor(
    private router: Router,
    private nettoyageService: NettoyageService
  ) {
    addIcons({
      'bus-outline': busOutline,
      'sparkles-outline': sparklesOutline,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline,
      'timer-outline': timerOutline,
      'create-outline': createOutline,
      'paper-plane-outline': paperPlaneOutline
    });
    const state = this.router.getCurrentNavigation()?.extras.state;
    this.nettoyage = state?.['nettoyage'] ?? null;
    this.duree = state?.['dureeAffichee'] ?? '';
  }

  ngOnInit(): void {
    if (this.nettoyage) {
      this.initialize(this.nettoyage);
      return;
    }
    this.nettoyageService.mesNettoyages().subscribe({
      next: history => {
        const active = history.find(item => item.statut === 'EN_COURS');
        if (!active) {
          this.router.navigateByUrl('/dashboard');
          return;
        }
        this.initialize(active);
      },
      error: () => this.router.navigateByUrl('/dashboard')
    });
  }

  envoyer(): void {
    if (!this.nettoyage || this.loading) return;
    this.loading = true;
    this.nettoyageService.terminer(this.nettoyage.id, this.remarque).subscribe({
      next: () => {
        this.loading = false;
        alert('Nettoyage envoyé au superviseur.');
        this.router.navigateByUrl('/notifications');
      },
      error: error => {
        this.loading = false;
        alert(error?.error?.message || "Impossible d'envoyer le nettoyage.");
      }
    });
  }

  private initialize(nettoyage: Nettoyage): void {
    this.nettoyage = nettoyage;
    this.bus = nettoyage.numeroBus;
    this.type = nettoyage.typeNettoyageLibelle;
    this.date = new Date(`${nettoyage.dateNettoyage}T00:00:00`).toLocaleDateString('fr-FR');
    this.heureDebut = nettoyage.heureDebut
      ? new Date(nettoyage.heureDebut).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';
    this.heureFin = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  busOutline,
  sparklesOutline,
  calendarClearOutline,
  playCircleOutline,
  stopwatchOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { Nettoyage } from '../../../models/api.models';
import { NettoyageService } from '../../../services/nettoyage.service';

@Component({
  selector: 'app-nettoyage-en-cours',
  templateUrl: './nettoyage-en-cours.page.html',
  styleUrls: ['./nettoyage-en-cours.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon]
})
export class NettoyageEnCoursPage implements OnInit, OnDestroy {
  nettoyage: Nettoyage | null = null;
  bus = '';
  type = '';
  today = '';
  heureDebut = '';
  timer = '00:00:00';
  private interval?: ReturnType<typeof setInterval>;

  constructor(
    private router: Router,
    private nettoyageService: NettoyageService
  ) {
    addIcons({
      'bus-outline': busOutline,
      'sparkles-outline': sparklesOutline,
      'calendar-clear-outline': calendarClearOutline,
      'play-circle-outline': playCircleOutline,
      'stopwatch-outline': stopwatchOutline,
      'checkmark-circle-outline': checkmarkCircleOutline
    });
    this.nettoyage = this.router.getCurrentNavigation()?.extras.state?.['nettoyage'] ?? null;
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

  terminerNettoyage(): void {
    if (!this.nettoyage) return;
    this.stopTimer();
    this.router.navigate(['/fin-nettoyage'], {
      state: { nettoyage: this.nettoyage, dureeAffichee: this.timer }
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private initialize(nettoyage: Nettoyage): void {
    this.nettoyage = nettoyage;
    this.bus = nettoyage.numeroBus;
    this.type = nettoyage.typeNettoyageLibelle;
    this.today = new Date(`${nettoyage.dateNettoyage}T00:00:00`).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    this.heureDebut = nettoyage.heureDebut
      ? new Date(nettoyage.heureDebut).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';
    this.updateTimer();
    this.interval = setInterval(() => this.updateTimer(), 1000);
  }

  private updateTimer(): void {
    if (!this.nettoyage?.heureDebut) return;
    const seconds = Math.max(
      0,
      Math.floor((Date.now() - new Date(this.nettoyage.heureDebut).getTime()) / 1000)
    );
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    this.timer = [hours, minutes, remainingSeconds]
      .map(value => String(value).padStart(2, '0'))
      .join(':');
  }

  private stopTimer(): void {
    if (this.interval) clearInterval(this.interval);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
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

@Component({
  selector: 'app-nettoyage-en-cours',
  templateUrl: './nettoyage-en-cours.page.html',
  styleUrls: ['./nettoyage-en-cours.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon
  ]
})
export class NettoyageEnCoursPage implements OnInit, OnDestroy {

  bus: string = '';

  type: string = '';

  today: string = '';

  heureDebut: string = '';

  timer: string = '00:00:00';

  private seconds = 0;

  private interval: any;

  constructor(private router: Router) {

    addIcons({
      'bus-outline': busOutline,
      'sparkles-outline': sparklesOutline,
      'calendar-clear-outline': calendarClearOutline,
      'play-circle-outline': playCircleOutline,
      'stopwatch-outline': stopwatchOutline,
      'checkmark-circle-outline': checkmarkCircleOutline
    });

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state) {

      this.bus = navigation.extras.state['bus'];

      this.type = navigation.extras.state['type'];

    }

  }

  ngOnInit(): void {

    const now = new Date();

    this.today = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    this.heureDebut = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    this.startTimer();

  }

  startTimer() {

    this.interval = setInterval(() => {

      this.seconds++;

      const h = Math.floor(this.seconds / 3600);

      const m = Math.floor((this.seconds % 3600) / 60);

      const s = this.seconds % 60;

      this.timer =
        String(h).padStart(2, '0') + ':' +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0');

    }, 1000);

  }

  terminerNettoyage() {

    clearInterval(this.interval);

    this.router.navigate(['/fin-nettoyage'], {
      state: {
        bus: this.bus,
        type: this.type,
        date: this.today,
        heureDebut: this.heureDebut,
        duree: this.timer
      }
    });

  }

  ngOnDestroy(): void {

    clearInterval(this.interval);

  }

}

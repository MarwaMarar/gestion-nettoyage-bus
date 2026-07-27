import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonButton,
  IonTextarea,
  IonIcon
} from '@ionic/angular/standalone';

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

@Component({
  selector: 'app-fin-nettoyage',
  templateUrl: './fin-nettoyage.page.html',
  styleUrls: ['./fin-nettoyage.page.scss'],
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
export class FinNettoyagePage implements OnInit {

  bus: string = '';
  type: string = '';

  date: string = '';
  heureDebut: string = '';
  heureFin: string = '';
  duree: string = '';

  remarque: string = '';

  constructor(private router: Router) {

    addIcons({
      'bus-outline': busOutline,
      'sparkles-outline': sparklesOutline,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline,
      'timer-outline': timerOutline,
      'create-outline': createOutline,
      'paper-plane-outline': paperPlaneOutline
    });

  }

  ngOnInit(): void {

    const navigation = this.router.getCurrentNavigation();

    if (navigation?.extras.state) {

      this.bus = navigation.extras.state['bus'];

      this.type = navigation.extras.state['type'];

      this.date = navigation.extras.state['date'];

      this.heureDebut = navigation.extras.state['heureDebut'];

      this.duree = navigation.extras.state['duree'];

    }

    this.heureFin = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

  }

  envoyer() {

    alert('✅ Nettoyage envoyé au superviseur.');

    this.router.navigate(['/dashboard']);

  }

}

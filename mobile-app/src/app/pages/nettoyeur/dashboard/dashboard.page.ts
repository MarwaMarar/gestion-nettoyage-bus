import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  busOutline,
  sparklesOutline,
  calendarClearOutline,
  playCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon
  ]
})
export class DashboardPage implements OnInit {

  today: string = '';

  busList = [
    'Bus 101',
    'Bus 102',
    'Bus 103'
  ];

  typeNettoyageList = [
    'Nettoyage intérieur',
    'Nettoyage extérieur',
    'Nettoyage complet',
    'Désinfection',
    'Lavage rapide',
    'Nettoyage avant mise en service'
  ];

  selectedBus = '';

  selectedType = '';

  constructor(private router: Router) {

    addIcons({
      'bus-outline': busOutline,
      'sparkles-outline': sparklesOutline,
      'calendar-clear-outline': calendarClearOutline,
      'play-circle-outline': playCircleOutline
    });

  }

  ngOnInit(): void {

    const now = new Date();

    this.today = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  }

  commencerNettoyage() {

    if (!this.selectedBus || !this.selectedType) {

      alert('Veuillez sélectionner un bus et un type de nettoyage.');

      return;

    }

    this.router.navigate(
      ['/nettoyage-en-cours'],
      {
        state: {
          bus: this.selectedBus,
          type: this.selectedType
        }
      }
    );

  }

}

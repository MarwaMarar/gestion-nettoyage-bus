import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Bus, Nettoyage, TypeNettoyage } from '../../../models/api.models';
import { BusService } from '../../../services/bus.service';
import { TypeNettoyageService } from '../../../services/type-nettoyage.service';
import { NettoyageService } from '../../../services/nettoyage.service';

import {
  IonContent,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonList,
  IonLabel
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  busOutline,
  sparklesOutline,
  calendarClearOutline,
  playCircleOutline,
  notificationsOutline
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
    IonIcon,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonList,
    IonLabel,
    RouterLink
  ]
})
export class DashboardPage implements OnInit {

  today: string = '';

  busList: Bus[] = [];
  typeNettoyageList: TypeNettoyage[] = [];
  selectedBus: number | null = null;
  selectedType: number | null = null;
  notificationCount = 0;
  loading = false;

  constructor(
    private router: Router,
    private busService: BusService,
    private typeService: TypeNettoyageService,
    private nettoyageService: NettoyageService
  ) {

    addIcons({
       'bus-outline': busOutline,
       'sparkles-outline': sparklesOutline,
       'calendar-clear-outline': calendarClearOutline,
       'play-circle-outline': playCircleOutline,
       'notifications-outline': notificationsOutline
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

    forkJoin({
      buses: this.busService.active(),
      types: this.typeService.all(),
      history: this.nettoyageService.mesNettoyages()
    }).subscribe({
      next: ({ buses, types, history }) => {
        this.busList = buses;
        this.typeNettoyageList = types;
        this.notificationCount = history.filter(item =>
          item.statut === 'VALIDE' || item.statut === 'REFUSE'
        ).length;
        const active = history.find(item => item.statut === 'EN_COURS');
        if (active) this.router.navigate(['/nettoyage-en-cours'], { state: { nettoyage: active } });
      },
      error: error => alert(error?.error?.message || 'Impossible de charger les données.')
    });
  }

  commencerNettoyage() {

    if (this.selectedBus === null || this.selectedType === null) {

      alert('Veuillez sélectionner un bus et un type de nettoyage.');

      return;

    }

    this.loading = true;
    this.nettoyageService.commencer(this.selectedBus, this.selectedType).subscribe({
      next: (nettoyage: Nettoyage) => {
        this.loading = false;
        this.router.navigate(['/nettoyage-en-cours'], { state: { nettoyage } });
      },
      error: error => {
        this.loading = false;
        alert(error?.error?.message || 'Impossible de commencer le nettoyage.');
      }
    });

  }

}

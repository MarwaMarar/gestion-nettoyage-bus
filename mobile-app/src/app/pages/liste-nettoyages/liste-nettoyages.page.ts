import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  busOutline,
  personOutline,
  sparklesOutline,
  hourglassOutline,
  eyeOutline
} from 'ionicons/icons';
import { Nettoyage } from '../../models/api.models';
import { NettoyageService } from '../../services/nettoyage.service';

@Component({
  selector: 'app-liste-nettoyages',
  templateUrl: './liste-nettoyages.page.html',
  styleUrls: ['./liste-nettoyages.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon]
})
export class ListeNettoyagesPage implements OnInit {
  nettoyages: Nettoyage[] = [];

  constructor(
    private router: Router,
    private nettoyageService: NettoyageService
  ) {
    addIcons({
      'bus-outline': busOutline,
      'person-outline': personOutline,
      'sparkles-outline': sparklesOutline,
      'hourglass-outline': hourglassOutline,
      'eye-outline': eyeOutline
    });
  }

  ngOnInit(): void {
    this.load();
  }

  voirDetails(nettoyage: Nettoyage): void {
    this.router.navigate(['/details-nettoyage', nettoyage.id]);
  }

  private load(): void {
    this.nettoyageService.enAttente().subscribe({
      next: values => this.nettoyages = values,
      error: error => alert(error?.error?.message || 'Impossible de charger les nettoyages.')
    });
  }
}

import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Nettoyage } from '../service/api.models';
import { NettoyageService } from '../service/nettoyage.service';
import { WorkflowNav } from './workflow-nav';

@Component({
  selector: 'app-nettoyage-en-cours',
  standalone: true,
  imports: [WorkflowNav],
  templateUrl: './nettoyage-en-cours.html',
  styleUrls: ['./workflow.css', './nettoyage-en-cours.scss']
})
export class NettoyageEnCours implements OnInit {
  @ViewChild('terminerButton') terminerButton?: ElementRef<HTMLButtonElement>;

  nettoyage: Nettoyage | null = null;
  date = '';
  heureDebut = '';
  loading = false;
  error = '';
  confirmationOuverte = false;

  constructor(private router: Router, private service: NettoyageService) {
    this.nettoyage = this.router.getCurrentNavigation()?.extras.state?.['nettoyage'] ?? null;
  }

  ngOnInit(): void {
    if (this.nettoyage) this.init(this.nettoyage);
    else this.service.mesNettoyages().subscribe({
      next: history => {
        const active = history.find(value =>
          value.statut === 'EN_ATTENTE' && !!value.heureDebut && !value.heureFin
        );
        active ? this.init(active) : this.router.navigateByUrl('/nettoyeur/tableau-de-bord');
      },
      error: () => this.router.navigateByUrl('/nettoyeur/tableau-de-bord')
    });
  }

  ouvrirConfirmation(): void {
    if (!this.nettoyage || this.loading) return;
    this.confirmationOuverte = true;
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.terminerButton?.nativeElement.focus());
  }

  fermerConfirmation(): void {
    if (!this.confirmationOuverte || this.loading) return;
    this.confirmationOuverte = false;
    document.body.style.overflow = '';
    setTimeout(() => document.querySelector<HTMLButtonElement>('.finish-cleaning-button')?.focus());
  }

  fermerDepuisFond(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.fermerConfirmation();
  }

  @HostListener('document:keydown.escape')
  fermerAvecEchap(): void {
    this.fermerConfirmation();
  }

  terminer(): void {
    if (!this.nettoyage || this.loading) return;
    this.confirmationOuverte = false;
    document.body.style.overflow = '';
    this.loading = true;
    this.error = '';
    this.service.terminer(this.nettoyage.id, '').subscribe({
      next: () => this.router.navigateByUrl('/nettoyeur/historique'),
      error: error => {
        this.loading = false;
        this.error = error?.error?.message || 'Impossible de terminer le nettoyage.';
      }
    });
  }

  private init(value: Nettoyage): void {
    this.nettoyage = value;
    this.date = new Date(`${value.dateNettoyage}T00:00:00`).toLocaleDateString('fr-FR');
    this.heureDebut = value.heureDebut
      ? new Date(value.heureDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : '';
  }
}

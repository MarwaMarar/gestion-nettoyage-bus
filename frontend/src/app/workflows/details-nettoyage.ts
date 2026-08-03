import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Nettoyage } from '../service/api.models';
import { NettoyageService } from '../service/nettoyage.service';
import { WorkflowNav } from './workflow-nav';

@Component({
  selector: 'app-details-nettoyage-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, WorkflowNav],
  styleUrl: './workflow.css',
  template: `
    <app-workflow-nav section="superviseur" />
    <main class="workflow-page">
      <div class="workflow-container">
        <div class="actions-top"><a class="back-link" routerLink="/superviseur/nettoyages">← Retour</a></div>
        <section class="hero-card"><h1>Détails du nettoyage</h1><p>Vérifiez les informations avant validation.</p></section>
        @if (error) { <div class="error">{{ error }}</div> }
        @if (n) {
          <section class="info-card">
            <div class="info-row"><span class="label">ID</span><strong>#{{ n.id }}</strong></div>
            <div class="info-row"><span class="label">Bus</span><strong>{{ n.numeroBus }}</strong></div>
            <div class="info-row"><span class="label">Nettoyeur</span><strong>{{ n.nettoyeurNom }}</strong></div>
            <div class="info-row"><span class="label">Superviseur</span><strong>{{ n.superviseurNom }}</strong></div>
            <div class="info-row"><span class="label">Type</span><strong>{{ n.typeNettoyageLibelle }}</strong></div>
            <div class="info-row"><span class="label">Date</span><strong>{{ n.dateNettoyage | date:'dd/MM/yyyy' }}</strong></div>
            <div class="info-row"><span class="label">Heure début</span><strong>{{ n.heureDebut | date:'HH:mm:ss' }}</strong></div>
            <div class="info-row"><span class="label">Heure fin</span><strong>{{ n.heureFin | date:'HH:mm:ss' }}</strong></div>
            <div class="info-row"><span class="label">Durée</span><strong>{{ n.duree }} min</strong></div>
            <div class="info-row"><span class="label">Remarque nettoyeur</span><strong>{{ n.remarqueNettoyeur || 'Aucune remarque' }}</strong></div>
            <div class="info-row"><span class="label">Statut</span><strong>{{ n.statut }}</strong></div>
          </section>

          <div class="button-grid">
            <button class="success-btn" [disabled]="loading" (click)="valider()">
              {{ loading ? 'Traitement…' : 'Valider' }}
            </button>
            <button class="danger-btn" [disabled]="loading" (click)="ouvrirRefus()">Refuser</button>
          </div>

          @if (showRefus) {
            <section class="remark-card">
              <h3>Motif du refus</h3><p class="muted">Le commentaire est obligatoire.</p>
              <div class="field"><textarea maxlength="2000" [(ngModel)]="motif" placeholder="Écrire le motif du refus…"></textarea></div>
              <button class="danger-btn" [disabled]="loading" (click)="refuser()">
                {{ loading ? 'Traitement…' : 'Envoyer le refus' }}
              </button>
            </section>
          }
        }
      </div>
    </main>
  `
})
export class DetailsNettoyageWorkflow implements OnInit {
  n?: Nettoyage;
  showRefus = false;
  motif = '';
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: NettoyageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.router.navigateByUrl('/superviseur/nettoyages');
      return;
    }
    this.service.getById(id).subscribe({
      next: value => { this.n = value; this.cdr.detectChanges(); },
      error: error => {
        this.error = error?.error?.message || 'Impossible de charger le nettoyage.';
        this.cdr.detectChanges();
      }
    });
  }

  ouvrirRefus(): void {
    this.showRefus = true;
    this.error = '';
  }

  valider(): void {
    if (!this.n) return;
    this.loading = true;
    this.error = '';
    this.service.valider(this.n.id).subscribe({
      next: () => this.router.navigateByUrl('/superviseur/nettoyages'),
      error: error => {
        this.loading = false;
        this.error = error?.error?.message || 'Validation impossible.';
        this.cdr.detectChanges();
      }
    });
  }

  refuser(): void {
    if (!this.n) return;
    if (!this.motif.trim()) {
      this.error = 'Veuillez saisir le motif du refus.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.service.refuser(this.n.id, this.motif.trim()).subscribe({
      next: () => this.router.navigateByUrl('/superviseur/nettoyages'),
      error: error => {
        this.loading = false;
        this.error = error?.error?.message || 'Refus impossible.';
        this.cdr.detectChanges();
      }
    });
  }
}

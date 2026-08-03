import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Nettoyage, Utilisateur } from '../service/api.models';
import { AuthService } from '../service/auth.service';
import { NettoyageService } from '../service/nettoyage.service';
import { UtilisateurService } from '../service/utilisateur.service';
import { WorkflowNav } from './workflow-nav';

@Component({
  selector: 'app-nettoyeur-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, WorkflowNav],
  styleUrl: './workflow.css',
  template: ` <app-workflow-nav section="nettoyeur" />
    <main class="workflow-page">
      <div class="workflow-container">
        <section class="hero-card">
          <div class="hero-row">
            <div>
              <h2>{{ adminMode ? 'Vue administrateur' : 'Bonjour' }}</h2>
              <h1>Nettoyeur</h1>
              <p>
                {{
                  adminMode
                    ? 'Consultez les nettoyages d’un nettoyeur sélectionné.'
                    : 'Sélectionnez un nettoyage assigné par l’administrateur.'
                }}
              </p>
              <span class="date-chip"><i class="fa-regular fa-calendar"></i>{{ today }}</span>
            </div>
            <img src="assets/images/alsa-logo.png" alt="ALSA" />
          </div>
        </section>

        @if (adminMode) {
          <section class="panel-card">
            <h2>Consultation des nettoyeurs</h2>
            @if (error) {
              <div class="error">{{ error }}</div>
            }
            <div class="field">
              <label>Nettoyeur</label
              ><select [(ngModel)]="selectedUserId" (ngModelChange)="filtrerAdmin()">
                <option [ngValue]="null">Sélectionner un nettoyeur</option>
                @for (user of users; track user.id) {
                  <option [ngValue]="user.id">
                    {{ user.prenom }} {{ user.nom }} — {{ user.login }}
                  </option>
                }
              </select>
            </div>
          </section>
          @for (value of adminValues; track value.id) {
            <article class="list-card">
              <div class="info-row">
                <span class="label">ID</span><strong>#{{ value.id }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Bus</span><strong>{{ value.numeroBus }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Type</span><strong>{{ value.typeNettoyageLibelle }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Superviseur</span
                ><strong>{{ value.superviseurNom || '—' }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Date</span
                ><strong>{{ value.dateNettoyage | date: 'dd/MM/yyyy' }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Début</span
                ><strong>{{
                  value.heureDebut ? (value.heureDebut | date: 'HH:mm:ss') : '—'
                }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Fin</span
                ><strong>{{ value.heureFin ? (value.heureFin | date: 'HH:mm:ss') : '—' }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Durée</span
                ><strong>{{ value.duree != null ? value.duree + ' min' : '—' }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Remarque nettoyeur</span
                ><strong>{{ value.remarqueNettoyeur || '—' }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Remarque superviseur</span
                ><strong>{{ value.remarqueSuperviseur || '—' }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Statut</span>
                <span class="badge {{ value.statut }}">{{ value.statut }}</span>
              </div>
            </article>
          } @empty {
            <div class="panel-card empty">
              {{
                selectedUserId ? 'Aucun nettoyage pour ce nettoyeur.' : 'Sélectionnez un nettoyeur.'
              }}
            </div>
          }
        } @else {
          <section class="panel-card">
            <h2>Commencer un nettoyage</h2>
            @if (error) {
              <div class="error">{{ error }}</div>
            }
            @if (assignations.length > 0) {
              <div class="field">
                <label><i class="fa-solid fa-bus"></i> Bus assigné</label
                ><select
                  [(ngModel)]="selectedAssignmentId"
                  (ngModelChange)="selectionnerAssignation($event)"
                >
                  <option [ngValue]="null">Sélectionner un bus</option>
                  @for (value of assignations; track value.id) {
                    <option [ngValue]="value.id">{{ value.numeroBus }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label><i class="fa-solid fa-sparkles"></i> Type de nettoyage assigné</label
                ><select disabled>
                  <option>
                    {{ selectedAssignment?.typeNettoyageLibelle || 'Sélectionnez d’abord un bus' }}
                  </option>
                </select>
              </div>
              @if (selectedAssignment) {
                <section class="info-card">
                  <div class="info-row">
                    <span class="label">ID</span><strong>#{{ selectedAssignment.id }}</strong>
                  </div>
                  <div class="info-row">
                    <span class="label">Date prévue</span
                    ><strong>{{ selectedAssignment.dateNettoyage | date: 'dd/MM/yyyy' }}</strong>
                  </div>
                  <div class="info-row">
                    <span class="label">Nettoyeur</span
                    ><strong>{{ selectedAssignment.nettoyeurNom }}</strong>
                  </div>
                  <div class="info-row">
                    <span class="label">Superviseur</span
                    ><strong>{{ selectedAssignment.superviseurNom }}</strong>
                  </div>
                  <div class="info-row">
                    <span class="label">Statut</span
                    ><strong>{{ selectedAssignment.statut }}</strong>
                  </div>
                </section>
              }
              <button
                class="primary-btn"
                [disabled]="loading || !selectedAssignment"
                (click)="commencer()"
              >
                <i class="fa-solid fa-circle-play"></i>
                {{ loading ? 'Démarrage…' : 'Commencer le nettoyage' }}
              </button>
            } @else {
              <div class="empty">Aucun nettoyage ne vous est actuellement assigné.</div>
            }
          </section>
        }
      </div>
    </main>`,
})
export class NettoyeurDashboard implements OnInit {
  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  adminMode = false;
  users: Utilisateur[] = [];
  allValues: Nettoyage[] = [];
  adminValues: Nettoyage[] = [];
  selectedUserId: number | null = null;
  assignations: Nettoyage[] = [];
  selectedAssignmentId: number | null = null;
  selectedAssignment: Nettoyage | null = null;
  loading = false;
  error = '';
  constructor(
    private clean: NettoyageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private userService: UtilisateurService,
  ) {}
  ngOnInit(): void {
    this.adminMode = this.auth.currentUser()?.role === 'ADMINISTRATEUR';
    if (this.adminMode) {
      forkJoin({
        users: this.userService.getUtilisateurs(),
        values: this.clean.getAll(),
      }).subscribe({
        next: (data) => {
          this.users = data.users.filter((user) => user.role === 'NETTOYEUR');
          this.allValues = data.values;
          this.selectedUserId = this.users[0]?.id ?? null;
          this.filtrerAdmin();
        },
        error: (error) => {
          this.error = error?.error?.message || 'Impossible de charger la vue nettoyeur.';
          this.cdr.detectChanges();
        },
      });
      return;
    }
    this.clean.mesNettoyages().subscribe({
      next: (history) => {
        const active = history.find(
          (value) => value.statut === 'EN_ATTENTE' && !!value.heureDebut && !value.heureFin,
        );
        if (active) {
          this.router.navigate(['/nettoyeur/nettoyage-en-cours'], { state: { nettoyage: active } });
          return;
        }
        this.assignations = history.filter(
          (value) => value.statut === 'EN_ATTENTE' && !value.heureDebut && !value.heureFin,
        );
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error?.error?.message || 'Impossible de charger vos assignations.';
        this.cdr.detectChanges();
      },
    });
  }
  filtrerAdmin(): void {
    this.adminValues =
      this.selectedUserId === null
        ? []
        : this.allValues.filter((value) => value.nettoyeurId === Number(this.selectedUserId));
    this.cdr.detectChanges();
  }
  selectionnerAssignation(id: number | null): void {
    this.selectedAssignment =
      id === null ? null : (this.assignations.find((value) => value.id === Number(id)) ?? null);
    this.error = '';
  }
  commencer(): void {
    if (!this.selectedAssignment) {
      this.error = 'Veuillez sélectionner un bus assigné.';
      return;
    }
    this.loading = true;
    this.clean.commencer(this.selectedAssignment.id).subscribe({
      next: (value) =>
        this.router.navigate(['/nettoyeur/nettoyage-en-cours'], { state: { nettoyage: value } }),
      error: (error) => {
        this.loading = false;
        this.error = error?.error?.message || 'Impossible de commencer le nettoyage.';
        this.cdr.detectChanges();
      },
    });
  }
}

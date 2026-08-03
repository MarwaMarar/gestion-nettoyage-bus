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
  selector: 'app-superviseur-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, WorkflowNav],
  styleUrl: './workflow.css',
  template: `<app-workflow-nav section="superviseur" />
    <main class="workflow-page">
      <div class="workflow-container">
        <section class="hero-card">
          <div class="hero-row">
            <div>
              <h2>{{ adminMode ? 'Vue administrateur' : 'Bonjour' }}</h2>
              <h1>Superviseur</h1>
              <p>
                {{
                  adminMode
                    ? 'Consultez les nettoyages d’un superviseur sélectionné.'
                    : 'Consultez les nettoyages en attente de validation.'
                }}
              </p>
              <span class="date-chip"><i class="fa-regular fa-calendar"></i>{{ today }}</span>
            </div>
            <img src="assets/images/alsa-logo.png" alt="ALSA" />
          </div>
        </section>
        @if (adminMode) {
          <section class="panel-card">
            <h2>Consultation des superviseurs</h2>
            @if (error) {
              <div class="error">{{ error }}</div>
            }
            <div class="field">
              <label>Superviseur</label
              ><select [(ngModel)]="selectedUserId" (ngModelChange)="filtrerAdmin()">
                <option [ngValue]="null">Sélectionner un superviseur</option>
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
                <span class="label">Nettoyeur</span><strong>{{ value.nettoyeurNom }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Date</span
                ><strong>{{ value.dateNettoyage | date: 'dd/MM/yyyy' }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Début / fin</span
                ><strong
                  >{{ value.heureDebut ? (value.heureDebut | date: 'HH:mm:ss') : '—' }} /
                  {{ value.heureFin ? (value.heureFin | date: 'HH:mm:ss') : '—' }}</strong
                >
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
                <span class="label">Motif du refus</span
                ><strong>{{ value.remarqueSuperviseur || '—' }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Statut</span>
                <span class="badge {{ value.statut }}">{{ value.statut }}</span>
              </div>
              <div class="info-row">
                <span class="label">Date validation</span
                ><strong>{{
                  value.dateValidation ? (value.dateValidation | date: 'dd/MM/yyyy HH:mm') : '—'
                }}</strong>
              </div>
            </article>
          } @empty {
            <div class="panel-card empty">
              {{
                selectedUserId
                  ? 'Aucun nettoyage pour ce superviseur.'
                  : 'Sélectionnez un superviseur.'
              }}
            </div>
          }
        } @else {
          <section class="stats-card">
            <div class="stats-number">{{ total }}</div>
            <p>Nettoyages en attente</p>
          </section>
          @if (error) {
            <div class="error">{{ error }}</div>
          }
          <button class="primary-btn" (click)="router.navigateByUrl('/superviseur/nettoyages')">
            <i class="fa-solid fa-eye"></i> Voir les détails
          </button>
        }
      </div>
    </main>`,
})
export class SuperviseurDashboard implements OnInit {
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
  total = 0;
  error = '';
  constructor(
    public router: Router,
    private service: NettoyageService,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private userService: UtilisateurService,
  ) {}
  ngOnInit(): void {
    this.adminMode = this.auth.currentUser()?.role === 'ADMINISTRATEUR';
    if (this.adminMode) {
      forkJoin({
        users: this.userService.getUtilisateurs(),
        values: this.service.getAll(),
      }).subscribe({
        next: (data) => {
          this.users = data.users.filter((user) => user.role === 'SUPERVISEUR');
          this.allValues = data.values;
          this.selectedUserId = this.users[0]?.id ?? null;
          this.filtrerAdmin();
        },
        error: (error) => {
          this.error = error?.error?.message || 'Impossible de charger la vue superviseur.';
          this.cdr.detectChanges();
        },
      });
      return;
    }
    this.service.enAttente().subscribe({
      next: (values) => {
        this.total = values.length;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error?.error?.message || 'Impossible de charger les nettoyages en attente.';
        this.cdr.detectChanges();
      },
    });
  }
  filtrerAdmin(): void {
    this.adminValues =
      this.selectedUserId === null
        ? []
        : this.allValues.filter((value) => value.superviseurId === Number(this.selectedUserId));
    this.cdr.detectChanges();
  }
}

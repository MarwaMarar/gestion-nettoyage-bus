import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Bus, Nettoyage, Utilisateur } from '../service/api.models';
import { BusService } from '../service/bus.service';
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
            <div class="filters"><div class="field"><label>Date début</label><input type="date" [(ngModel)]="filterDateStart"></div><div class="field"><label>Date fin</label><input type="date" [(ngModel)]="filterDateEnd"></div><div class="field"><label>Bus</label><select [(ngModel)]="filterBusId"><option [ngValue]="null">Tous les bus</option>@for(bus of buses;track bus.id){<option [ngValue]="bus.id">{{bus.numeroBus}}</option>}</select></div><div class="filter-actions"><button class="primary-btn search-btn" type="button" [disabled]="adminLoading" (click)="searchAdmin()">{{adminLoading?'Recherche…':'Rechercher'}}</button><button class="secondary-btn reset-btn" type="button" [disabled]="adminLoading" (click)="resetAdminFilters()">Réinitialiser les filtres</button></div></div>
          </section>
          @for (value of adminValues; track value.id) {
            <article class="list-card">
              <div class="info-row">
                <span class="label">Nom du bus</span><strong>{{ value.numeroBus }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Type de nettoyage</span><strong>{{ value.typeNettoyageLibelle }}</strong>
              </div>
              <div class="info-row">
                <span class="label">Statut</span>
                <span class="badge {{ value.statut }}">{{ value.statut }}</span>
              </div>
              <button class="secondary-btn" type="button" (click)="openDetails(value)">Voir détails</button>
            </article>
          } @empty {
            <div class="panel-card empty">
              {{
                !selectedUserId
                  ? 'Sélectionnez un superviseur.'
                  : hasSearched ? 'Aucun nettoyage pour ce superviseur.' : 'Cliquez sur Rechercher pour afficher les nettoyages.'
              }}
            </div>
          }
          @if(totalElements>size){<nav class="pagination"><span class="results-count">{{totalElements}} résultat{{totalElements>1?'s':''}}</span><div class="page-buttons"><button (click)="goToPage(page-1)" [disabled]="page===0">Précédent</button>@for(item of pageItems;track $index){@if(item==='…'){<span class="ellipsis">…</span>}@else{<button [class.active]="item===page+1" (click)="goToPage(+item-1)">{{item}}</button>}}<button (click)="goToPage(page+1)" [disabled]="page>=totalPages-1">Suivant</button></div></nav>}
          @if(selectedDetails){<div class="details-overlay" (click)="closeDetails()"><section class="details-panel" (click)="$event.stopPropagation()"><h2>Détails du nettoyage #{{selectedDetails.id}}</h2><div class="info-row"><span class="label">Bus</span><strong>{{selectedDetails.numeroBus}}</strong></div><div class="info-row"><span class="label">Type</span><strong>{{selectedDetails.typeNettoyageLibelle}}</strong></div><div class="info-row"><span class="label">Nettoyeur</span><strong>{{selectedDetails.nettoyeurNom}}</strong></div><div class="info-row"><span class="label">Superviseur</span><strong>{{selectedDetails.superviseurNom||'—'}}</strong></div><div class="info-row"><span class="label">Date</span><strong>{{selectedDetails.dateNettoyage|date:'dd/MM/yyyy'}}</strong></div><div class="info-row"><span class="label">Début</span><strong>{{selectedDetails.heureDebut?(selectedDetails.heureDebut|date:'HH:mm:ss'):'—'}}</strong></div><div class="info-row"><span class="label">Fin</span><strong>{{selectedDetails.heureFin?(selectedDetails.heureFin|date:'HH:mm:ss'):'—'}}</strong></div><div class="info-row"><span class="label">Durée</span><strong>{{selectedDetails.duree!=null?selectedDetails.duree+' min':'—'}}</strong></div><div class="info-row"><span class="label">Remarque nettoyeur</span><strong>{{selectedDetails.remarqueNettoyeur||'—'}}</strong></div><div class="info-row"><span class="label">Motif du refus</span><strong>{{selectedDetails.remarqueSuperviseur||'—'}}</strong></div><div class="info-row"><span class="label">Statut</span><span class="badge {{selectedDetails.statut}}">{{selectedDetails.statut}}</span></div><div class="info-row"><span class="label">Date validation</span><strong>{{selectedDetails.dateValidation?(selectedDetails.dateValidation|date:'dd/MM/yyyy HH:mm'):'—'}}</strong></div><button class="secondary-btn details-close" type="button" (click)="closeDetails()">Fermer</button></section></div>}
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
  buses: Bus[] = [];
  filterDateStart = ''; filterDateEnd = ''; filterBusId: number|null = null;
  appliedDateStart = ''; appliedDateEnd = ''; appliedBusId: number|null = null;
  hasSearched = false;
  adminLoading = false;
  page = 0; readonly size = 5; totalElements = 0; totalPages = 0;
  selectedDetails: Nettoyage | null = null;
  selectedUserId: number | null = null;
  total = 0;
  error = '';
  constructor(
    public router: Router,
    private service: NettoyageService,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private userService: UtilisateurService,
    private busService: BusService,
  ) {}
  ngOnInit(): void {
    this.adminMode = ['ADMINISTRATEUR','CONSULTANT'].includes(this.auth.currentUser()?.role ?? '');
    if (this.adminMode) {
      forkJoin({
        users: this.userService.getUtilisateurs(),
        buses: this.busService.getAll(),
      }).subscribe({
        next: (data) => {
          this.users = data.users.filter((user) => user.role === 'SUPERVISEUR');
          this.buses = data.buses;
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
    this.filterDateStart='';this.filterDateEnd='';this.filterBusId=null;
    this.appliedDateStart='';this.appliedDateEnd='';this.appliedBusId=null;
    this.page=0;this.adminValues=[];this.totalElements=0;this.totalPages=0;this.error='';
    this.hasSearched=this.selectedUserId!==null;
    if(this.selectedUserId!==null)this.loadAdmin();else this.cdr.detectChanges();
  }
  loadAdmin():void{if(this.selectedUserId===null){this.adminValues=[];this.totalElements=0;this.totalPages=0;return;}this.error='';this.adminLoading=true;this.service.adminSupervisorPage(this.selectedUserId,this.page,this.size,this.appliedDateStart||undefined,this.appliedDateEnd||undefined,this.appliedBusId??undefined).subscribe({next:r=>{if(r.totalPages>0&&this.page>=r.totalPages){this.page=r.totalPages-1;this.loadAdmin();return;}this.adminValues=r.content;this.totalElements=r.totalElements;this.totalPages=r.totalPages;this.adminLoading=false;this.cdr.detectChanges();},error:e=>{this.adminLoading=false;this.error=e?.error?.message||'Impossible de charger la vue superviseur.';this.cdr.detectChanges();}});}
  searchAdmin():void{this.hasSearched=true;this.appliedDateStart=this.filterDateStart;this.appliedDateEnd=this.filterDateEnd;this.appliedBusId=this.filterBusId;this.page=0;this.loadAdmin();}resetAdminFilters():void{this.filterDateStart='';this.filterDateEnd='';this.filterBusId=null;this.searchAdmin();}goToPage(page:number):void{if(page>=0&&page<this.totalPages&&page!==this.page){this.page=page;this.loadAdmin();}}get pageItems():(number|string)[]{return compactPages(this.page+1,this.totalPages);}
  openDetails(value:Nettoyage):void{this.selectedDetails=value;}
  closeDetails():void{this.selectedDetails=null;}
}
function compactPages(current:number,total:number):(number|string)[]{const pages=new Set([1,total,current-1,current,current+1]);const valid=[...pages].filter(p=>p>=1&&p<=total).sort((a,b)=>a-b);const result:(number|string)[]=[];valid.forEach((p,i)=>{if(i&&p-valid[i-1]>1)result.push('…');result.push(p);});return result;}

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
            <div class="filters"><div class="field"><label>Date début</label><input type="date" [(ngModel)]="filterDateStart"></div><div class="field"><label>Date fin</label><input type="date" [(ngModel)]="filterDateEnd"></div><div class="field bus-filter"><label>Bus</label><div class="bus-filter-input"><i class="fa-solid fa-magnifying-glass"></i><input type="text" [(ngModel)]="filterBusSearch" (ngModelChange)="modifierRechercheBus()" placeholder="Rechercher un bus…" autocomplete="off"></div>@if(filterBusSearch.trim() && filterBusId===null){<div class="bus-filter-results">@for(bus of resultatsBus;track bus.id){<button type="button" (click)="selectionnerBus(bus)"><strong>{{bus.numeroBus}}</strong><small>{{bus.typeBusLibelle}}</small></button>}@empty{<span>Aucun bus trouvé</span>}</div>}</div><div class="filter-actions"><button class="primary-btn search-btn" type="button" [disabled]="adminLoading" (click)="searchAdmin()">{{adminLoading?'Recherche…':'Rechercher'}}</button><button class="secondary-btn reset-btn" type="button" [disabled]="adminLoading" (click)="resetAdminFilters()">Réinitialiser les filtres</button></div></div>
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
                !selectedUserId ? 'Sélectionnez un nettoyeur.' : hasSearched ? 'Aucun nettoyage pour ce nettoyeur.' : 'Cliquez sur Rechercher pour afficher les nettoyages.'
              }}
            </div>
          }
          @if(totalElements>size){<nav class="pagination"><span class="results-count">{{totalElements}} résultat{{totalElements>1?'s':''}}</span><div class="page-buttons"><button (click)="goToPage(page-1)" [disabled]="page===0">Précédent</button>@for(item of pageItems;track $index){@if(item==='…'){<span class="ellipsis">…</span>}@else{<button [class.active]="item===page+1" (click)="goToPage(+item-1)">{{item}}</button>}}<button (click)="goToPage(page+1)" [disabled]="page>=totalPages-1">Suivant</button></div></nav>}
          @if(selectedDetails){<div class="details-overlay" (click)="closeDetails()"><section class="details-panel" (click)="$event.stopPropagation()"><h2>Détails du nettoyage #{{selectedDetails.id}}</h2><div class="info-row"><span class="label">Bus</span><strong>{{selectedDetails.numeroBus}}</strong></div><div class="info-row"><span class="label">Type</span><strong>{{selectedDetails.typeNettoyageLibelle}}</strong></div><div class="info-row"><span class="label">Nettoyeur</span><strong>{{selectedDetails.nettoyeurNom}}</strong></div><div class="info-row"><span class="label">Superviseur</span><strong>{{selectedDetails.superviseurNom||'—'}}</strong></div><div class="info-row"><span class="label">Date</span><strong>{{selectedDetails.dateNettoyage|date:'dd/MM/yyyy'}}</strong></div><div class="info-row"><span class="label">Début</span><strong>{{selectedDetails.heureDebut?(selectedDetails.heureDebut|date:'HH:mm:ss'):'—'}}</strong></div><div class="info-row"><span class="label">Fin</span><strong>{{selectedDetails.heureFin?(selectedDetails.heureFin|date:'HH:mm:ss'):'—'}}</strong></div><div class="info-row"><span class="label">Durée</span><strong>{{selectedDetails.duree!=null?selectedDetails.duree+' min':'—'}}</strong></div><div class="info-row"><span class="label">Remarque nettoyeur</span><strong>{{selectedDetails.remarqueNettoyeur||'—'}}</strong></div><div class="info-row"><span class="label">Remarque superviseur</span><strong>{{selectedDetails.remarqueSuperviseur||'—'}}</strong></div><div class="info-row"><span class="label">Statut</span><span class="badge {{selectedDetails.statut}}">{{selectedDetails.statut}}</span></div><button class="secondary-btn details-close" type="button" (click)="closeDetails()">Fermer</button></section></div>}
        } @else {
          <section class="panel-card">
            <div class="actions-top cleaner-heading"><h2>Nettoyages à traiter</h2><span class="results-count">{{ filteredAssignments.length }} résultat{{filteredAssignments.length>1?'s':''}}</span></div>
            @if (error) {
              <div class="error">{{ error }}</div>
            }
            @if (assignations.length > 0) {
              <div class="field cleaner-type-filter"><label><i class="fa-solid fa-sparkles"></i> Type de nettoyage</label><select [(ngModel)]="selectedTypeId" (ngModelChange)="filterAssignments()"><option [ngValue]="null">Tous les types</option>@for(type of assignedTypes;track type.id){<option [ngValue]="type.id">{{type.label}}</option>}</select></div>
              @for (value of pagedAssignments; track value.id) {
                <article class="list-card compact-assignment">
                  <div class="assignment-main"><strong>Bus {{value.numeroBus}}</strong><span>{{value.typeNettoyageLibelle}}</span></div>
                  <span class="assignment-date"><i class="fa-regular fa-calendar"></i> {{value.dateNettoyage|date:'dd/MM/yyyy'}}</span>
                  <div class="assignment-actions"><button class="secondary-btn" type="button" (click)="openDetails(value)">Voir détails</button><button class="primary-btn" type="button" [disabled]="loading" (click)="commencer(value)"><i class="fa-solid fa-circle-play"></i> Commencer</button></div>
                </article>
              } @empty { <div class="empty">Aucun nettoyage de ce type ne reste à traiter.</div> }
              @if(filteredAssignments.length>assignmentSize){<nav class="pagination"><span class="results-count">{{filteredAssignments.length}} résultat{{filteredAssignments.length>1?'s':''}}</span><div class="page-buttons"><button (click)="goToAssignmentPage(assignmentPage-1)" [disabled]="assignmentPage===0">Précédent</button>@for(item of assignmentPageItems;track $index){@if(item==='…'){<span class="ellipsis">…</span>}@else{<button [class.active]="item===assignmentPage+1" (click)="goToAssignmentPage(+item-1)">{{item}}</button>}}<button (click)="goToAssignmentPage(assignmentPage+1)" [disabled]="assignmentPage>=assignmentTotalPages-1">Suivant</button></div></nav>}
            } @else {
              <div class="empty">Aucun nettoyage ne vous est actuellement assigné.</div>
            }
          </section>
          @if(selectedDetails){<div class="details-overlay" (click)="closeDetails()"><section class="details-panel" (click)="$event.stopPropagation()"><h2>Détails du nettoyage #{{selectedDetails.id}}</h2><div class="info-row"><span class="label">Bus</span><strong>{{selectedDetails.numeroBus}}</strong></div><div class="info-row"><span class="label">Type</span><strong>{{selectedDetails.typeNettoyageLibelle}}</strong></div><div class="info-row"><span class="label">Date prévue</span><strong>{{selectedDetails.dateNettoyage|date:'dd/MM/yyyy'}}</strong></div><div class="info-row"><span class="label">Nettoyeur</span><strong>{{selectedDetails.nettoyeurNom}}</strong></div><div class="info-row"><span class="label">Superviseur</span><strong>{{selectedDetails.superviseurNom||'—'}}</strong></div><div class="info-row"><span class="label">Statut</span><span class="badge {{selectedDetails.statut}}">{{selectedDetails.statut}}</span></div><div class="info-row"><span class="label">Motif du refus</span><strong>{{selectedDetails.remarqueSuperviseur||'—'}}</strong></div><button class="secondary-btn details-close" type="button" (click)="closeDetails()">Fermer</button></section></div>}
        }
      </div>
    </main>`,
})
export class NettoyeurDashboard implements OnInit, OnDestroy {
  private synchronisation?: ReturnType<typeof setInterval>;
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
  filterBusSearch = '';
  filterDateStart = ''; filterDateEnd = ''; filterBusId: number|null = null;
  appliedDateStart = ''; appliedDateEnd = ''; appliedBusId: number|null = null;
  hasSearched = false;
  adminLoading = false;
  page = 0; readonly size = 5; totalElements = 0; totalPages = 0;
  selectedDetails: Nettoyage | null = null;
  selectedUserId: number | null = null;
  assignations: Nettoyage[] = [];
  selectedTypeId: number | null = null;
  assignmentPage = 0;
  readonly assignmentSize = 5;
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
    private busService: BusService,
  ) {}
  ngOnInit(): void {
    this.adminMode = ['ADMINISTRATEUR','CONSULTANT'].includes(this.auth.currentUser()?.role ?? '');
    this.synchronisation = setInterval(() => this.synchroniser(), 10000);
    if (this.adminMode) {
      forkJoin({
        users: this.userService.getUtilisateurs(),
        buses: this.busService.getAll(),
      }).subscribe({
        next: (data) => {
          this.users = data.users.filter((user) => user.role === 'NETTOYEUR');
          this.buses = data.buses;
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
          (value) => (value.statut === 'EN_ATTENTE' && !value.heureDebut && !value.heureFin)
            || value.statut === 'REFUSE',
        );
        this.normalizeAssignmentFilter();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = error?.error?.message || 'Impossible de charger vos assignations.';
        this.cdr.detectChanges();
      },
    });
  }
  filtrerAdmin(): void {
    this.filterDateStart='';this.filterDateEnd='';this.filterBusId=null;this.filterBusSearch='';
    this.appliedDateStart='';this.appliedDateEnd='';this.appliedBusId=null;
    this.page=0;this.adminValues=[];this.totalElements=0;this.totalPages=0;this.error='';
    this.hasSearched=this.selectedUserId!==null;
    if(this.selectedUserId!==null)this.loadAdmin();else this.cdr.detectChanges();
  }
  ngOnDestroy(): void { if (this.synchronisation) clearInterval(this.synchronisation); }
  private synchroniser(): void {
    if (this.adminMode) {
      if (this.selectedUserId !== null && !this.adminLoading) this.loadAdmin();
      return;
    }
    this.clean.mesNettoyages().subscribe({next: history => {
      this.assignations = history.filter(value =>
        (value.statut === 'EN_ATTENTE' && !value.heureDebut && !value.heureFin) || value.statut === 'REFUSE');
      this.normalizeAssignmentFilter();
      if (this.selectedAssignmentId !== null) this.selectionnerAssignation(this.selectedAssignmentId);
      this.cdr.detectChanges();
    }});
  }
  loadAdmin():void { if(this.selectedUserId===null){this.adminValues=[];this.totalElements=0;this.totalPages=0;return;}this.error='';this.adminLoading=true;this.clean.adminCleanerPage(this.selectedUserId,this.page,this.size,this.appliedDateStart||undefined,this.appliedDateEnd||undefined,this.appliedBusId??undefined).subscribe({next:r=>{if(r.totalPages>0&&this.page>=r.totalPages){this.page=r.totalPages-1;this.loadAdmin();return;}this.adminValues=r.content;this.totalElements=r.totalElements;this.totalPages=r.totalPages;this.adminLoading=false;this.cdr.detectChanges();},error:e=>{this.adminLoading=false;this.error=e?.error?.message||'Impossible de charger la vue nettoyeur.';this.cdr.detectChanges();}});}
  get resultatsBus():Bus[]{const q=this.filterBusSearch.trim().toLocaleLowerCase('fr');return q?this.buses.filter(b=>`${b.numeroBus} ${b.typeBusLibelle}`.toLocaleLowerCase('fr').includes(q)).slice(0,10):[];}
  modifierRechercheBus():void{const q=this.filterBusSearch.trim().toLocaleLowerCase('fr');this.filterBusId=this.buses.find(b=>b.numeroBus.toLocaleLowerCase('fr')===q)?.id??null;}
  selectionnerBus(bus:Bus):void{this.filterBusId=bus.id;this.filterBusSearch=`${bus.numeroBus} — ${bus.typeBusLibelle}`;}
  searchAdmin():void{this.hasSearched=true;this.appliedDateStart=this.filterDateStart;this.appliedDateEnd=this.filterDateEnd;this.appliedBusId=this.filterBusId;this.page=0;this.loadAdmin();}resetAdminFilters():void{this.filterDateStart='';this.filterDateEnd='';this.filterBusId=null;this.filterBusSearch='';this.searchAdmin();}goToPage(page:number):void{if(page>=0&&page<this.totalPages&&page!==this.page){this.page=page;this.loadAdmin();}}get pageItems():(number|string)[]{return compactPages(this.page+1,this.totalPages);}
  openDetails(value:Nettoyage):void{this.selectedDetails=value;}
  closeDetails():void{this.selectedDetails=null;}
  selectionnerAssignation(id: number | null): void {
    this.selectedAssignment =
      id === null ? null : (this.assignations.find((value) => value.id === Number(id)) ?? null);
    this.error = '';
  }
  get assignedTypes(): {id:number;label:string}[] { return [...new Map(this.assignations.map(value => [value.typeNettoyageId, {id:value.typeNettoyageId,label:value.typeNettoyageLibelle}])).values()].sort((a,b)=>a.label.localeCompare(b.label,'fr')); }
  get filteredAssignments(): Nettoyage[] { return this.selectedTypeId===null ? this.assignations : this.assignations.filter(value=>value.typeNettoyageId===this.selectedTypeId); }
  get assignmentTotalPages(): number { return Math.ceil(this.filteredAssignments.length/this.assignmentSize); }
  get pagedAssignments(): Nettoyage[] { const start=this.assignmentPage*this.assignmentSize;return this.filteredAssignments.slice(start,start+this.assignmentSize); }
  get assignmentPageItems(): (number|string)[] { return compactPages(this.assignmentPage+1,this.assignmentTotalPages); }
  filterAssignments(): void { this.assignmentPage=0;this.selectedDetails=null; }
  goToAssignmentPage(page:number): void { if(page>=0&&page<this.assignmentTotalPages)this.assignmentPage=page; }
  private normalizeAssignmentFilter(): void { if(this.selectedTypeId!==null&&!this.assignations.some(value=>value.typeNettoyageId===this.selectedTypeId))this.selectedTypeId=null;const lastPage=Math.max(0,this.assignmentTotalPages-1);if(this.assignmentPage>lastPage)this.assignmentPage=lastPage; }
  commencer(value?: Nettoyage): void {
    if (value) this.selectedAssignment = value;
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
function compactPages(current:number,total:number):(number|string)[]{const pages=new Set([1,total,current-1,current,current+1]);const valid=[...pages].filter(p=>p>=1&&p<=total).sort((a,b)=>a-b);const result:(number|string)[]=[];valid.forEach((p,i)=>{if(i&&p-valid[i-1]>1)result.push('…');result.push(p);});return result;}

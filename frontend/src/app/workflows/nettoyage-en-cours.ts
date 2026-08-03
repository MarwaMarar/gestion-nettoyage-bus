import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Nettoyage } from '../service/api.models';
import { NettoyageService } from '../service/nettoyage.service';
import { WorkflowNav } from './workflow-nav';

@Component({selector:'app-nettoyage-en-cours',standalone:true,imports:[WorkflowNav],styleUrl:'./workflow.css',template:`
<app-workflow-nav section="nettoyeur"/><main class="workflow-page"><div class="workflow-container">
<section class="hero-card"><h1>Nettoyage en cours</h1><p>Le nettoyage est actuellement en cours.</p></section>
<section class="info-card"><div class="info-row"><span class="label"><span class="icon-box"><i class="fa-solid fa-bus"></i></span>Bus</span><strong>{{nettoyage?.numeroBus}}</strong></div><div class="info-row"><span class="label"><span class="icon-box"><i class="fa-solid fa-sparkles"></i></span>Type</span><strong>{{nettoyage?.typeNettoyageLibelle}}</strong></div><div class="info-row"><span class="label"><span class="icon-box"><i class="fa-regular fa-calendar"></i></span>Date</span><strong>{{date}}</strong></div><div class="info-row"><span class="label"><span class="icon-box"><i class="fa-solid fa-play"></i></span>Heure début</span><strong>{{heureDebut}}</strong></div></section>
<section class="timer-card"><h3>Temps écoulé</h3><p class="muted">Chronomètre du nettoyage</p><div class="timer-value">{{timer}}</div></section><button class="success-btn" (click)="terminer()"><i class="fa-solid fa-circle-check"></i> Terminer le nettoyage</button>
</div></main>`})
export class NettoyageEnCours implements OnInit, OnDestroy {
  nettoyage: Nettoyage | null = null;
  date = '';
  heureDebut = '';
  timer = '00:00:00';
  private interval?: ReturnType<typeof setInterval>;

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

  terminer(): void {
    if (this.nettoyage) this.router.navigate(['/nettoyeur/fin-nettoyage'], {
      state: { nettoyage: this.nettoyage, duree: this.timer }
    });
  }

  ngOnDestroy(): void { if (this.interval) clearInterval(this.interval); }

  private init(value: Nettoyage): void {
    this.nettoyage = value;
    this.date = new Date(`${value.dateNettoyage}T00:00:00`).toLocaleDateString('fr-FR');
    this.heureDebut = value.heureDebut
      ? new Date(value.heureDebut).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}) : '';
    this.tick();
    this.interval = setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    if (!this.nettoyage?.heureDebut) return;
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(this.nettoyage.heureDebut).getTime()) / 1000));
    this.timer = [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60]
      .map(value => String(value).padStart(2, '0')).join(':');
  }
}

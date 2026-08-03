import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Nettoyage } from '../service/api.models';
import { NettoyageService } from '../service/nettoyage.service';
import { WorkflowNav } from './workflow-nav';

@Component({selector:'app-fin-nettoyage',standalone:true,imports:[FormsModule,WorkflowNav],styleUrl:'./workflow.css',template:`<app-workflow-nav section="nettoyeur"/><main class="workflow-page"><div class="workflow-container"><section class="hero-card"><h1>Terminer le nettoyage</h1><p>Vérifiez les informations avant l'envoi au superviseur.</p></section>@if(nettoyage){<section class="info-card"><div class="info-row"><span class="label">Bus</span><strong>{{nettoyage.numeroBus}}</strong></div><div class="info-row"><span class="label">Type</span><strong>{{nettoyage.typeNettoyageLibelle}}</strong></div><div class="info-row"><span class="label">Date</span><strong>{{date}}</strong></div><div class="info-row"><span class="label">Heure début</span><strong>{{debut}}</strong></div><div class="info-row"><span class="label">Heure fin</span><strong>{{fin}}</strong></div><div class="info-row"><span class="label">Durée</span><strong>{{duree}}</strong></div></section><section class="remark-card"><h3>Remarque (optionnelle)</h3><p class="muted">Écrire un commentaire concernant le nettoyage.</p><div class="field"><textarea maxlength="2000" [(ngModel)]="remarque" placeholder="Écrire un commentaire (facultatif)…"></textarea></div></section>@if(error){<div class="error">{{error}}</div>}<button class="primary-btn" [disabled]="loading" (click)="envoyer()">{{loading?'Envoi…':'Envoyer au superviseur'}}</button>}</div></main>`})
export class FinNettoyage implements OnInit {
  nettoyage: Nettoyage | null = null; date=''; debut=''; fin=''; duree=''; remarque=''; loading=false; error='';
  constructor(private router:Router, private service:NettoyageService) {
    const state=this.router.getCurrentNavigation()?.extras.state;
    this.nettoyage=state?.['nettoyage']??null; this.duree=state?.['duree']??'';
  }
  ngOnInit():void {
    if(this.nettoyage)this.init(this.nettoyage);
    else this.service.mesNettoyages().subscribe({next:history=>{
      const active=history.find(value=>value.statut==='EN_ATTENTE'&&!!value.heureDebut&&!value.heureFin);
      active?this.init(active):this.router.navigateByUrl('/nettoyeur/tableau-de-bord');
    },error:()=>this.router.navigateByUrl('/nettoyeur/tableau-de-bord')});
  }
  envoyer():void {if(!this.nettoyage)return;this.loading=true;this.service.terminer(this.nettoyage.id,this.remarque).subscribe({next:()=>this.router.navigateByUrl('/nettoyeur/historique'),error:error=>{this.loading=false;this.error=error?.error?.message||"Impossible d'envoyer le nettoyage."}})}
  private init(value:Nettoyage):void {this.nettoyage=value;this.date=new Date(`${value.dateNettoyage}T00:00:00`).toLocaleDateString('fr-FR');this.debut=value.heureDebut?new Date(value.heureDebut).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):'';this.fin=new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
}

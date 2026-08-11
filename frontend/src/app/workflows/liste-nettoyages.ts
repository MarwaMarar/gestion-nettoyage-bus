import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Nettoyage } from '../service/api.models';
import { NettoyageService } from '../service/nettoyage.service';
import { WorkflowNav } from './workflow-nav';
@Component({selector:'app-liste-nettoyages-workflow',standalone:true,imports:[WorkflowNav],styleUrl:'./workflow.css',template:`<app-workflow-nav section="superviseur"/><main class="workflow-page"><div class="workflow-container"><section class="hero-card"><h1>Nettoyages en attente</h1><p>Consultez les demandes envoyées par les nettoyeurs.</p></section>@if(error){<div class="error">{{error}}</div>}@for(n of values;track n.id){<article class="list-card" (click)="ouvrir(n)"><div class="info-row"><span class="label">ID</span><strong>#{{n.id}}</strong></div><div class="info-row"><span class="label">Bus</span><strong>{{n.numeroBus}}</strong></div><div class="info-row"><span class="label">Nettoyeur</span><strong>{{n.nettoyeurNom}}</strong></div><div class="info-row"><span class="label">Superviseur</span><strong>{{n.superviseurNom}}</strong></div><div class="info-row"><span class="label">Type</span><strong>{{n.typeNettoyageLibelle}}</strong></div><div class="info-row"><span class="label">Date</span><strong>{{n.dateNettoyage}}</strong></div><div class="info-row"><span class="label">Durée</span><strong>{{n.duree}} min</strong></div><div class="info-row"><span class="label">Remarque</span><strong>{{n.remarqueNettoyeur||'—'}}</strong></div><div class="actions-top"><span class="badge EN_ATTENTE">En attente</span><button class="secondary-btn" type="button">Voir</button></div></article>}@empty{<div class="panel-card empty">Aucun nettoyage en attente.</div>}</div></main>`})
export class ListeNettoyagesWorkflow implements OnInit,OnDestroy {
  values:Nettoyage[]=[];error='';private synchronisation?:ReturnType<typeof setInterval>;
  constructor(private service:NettoyageService,private router:Router,private cdr:ChangeDetectorRef){}
  ngOnInit():void {this.charger();this.synchronisation=setInterval(()=>this.charger(false),10000);}
  ngOnDestroy():void {if(this.synchronisation)clearInterval(this.synchronisation);}
  private charger(afficherErreur=true):void {this.service.enAttente().subscribe({next:values=>{this.values=values;this.error='';this.cdr.detectChanges();},error:error=>{if(afficherErreur)this.error=error?.error?.message||'Impossible de charger les nettoyages.';this.cdr.detectChanges();}})}
  ouvrir(value:Nettoyage):void {this.router.navigate(['/superviseur/nettoyages',value.id]);}
}

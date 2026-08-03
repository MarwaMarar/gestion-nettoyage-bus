import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Bus, Nettoyage, TypeBus, TypeNettoyage, Utilisateur } from '../../service/api.models';
import { BusService } from '../../service/bus.service';
import { NettoyageService } from '../../service/nettoyage.service';
import { TypeBusService } from '../../service/type-bus.service';
import { TypeNettoyageService } from '../../service/type-nettoyage.service';
import { UtilisateurService } from '../../service/utilisateur.service';

@Component({selector:'app-tableau-de-bord',standalone:true,imports:[CommonModule, FormsModule],templateUrl:'./tableau-de-bord.html',styleUrl:'./tableau-de-bord.css'})
export class TableauDeBordComponent implements OnInit {
  bus=0; nettoyagesJour=0; nettoyagesValides=0; nettoyagesRefuses=0; nettoyagesAttente=0; pourcentageValidation=0;
  dateDebut=''; dateFin=''; dateDebutAppliquee=''; dateFinAppliquee=''; filterError='';
  loading=false; errorMessage=''; busData:Bus[]=[]; utilisateurs:Utilisateur[]=[]; nettoyages:Nettoyage[]=[]; typesBus:TypeBus[]=[]; typesNettoyage:TypeNettoyage[]=[];
  constructor(private busService:BusService,private utilisateurService:UtilisateurService,private nettoyageService:NettoyageService,private typeBusService:TypeBusService,private typeNettoyageService:TypeNettoyageService,private cdr:ChangeDetectorRef){}
  ngOnInit():void{this.loadDashboardData();}
  loadDashboardData():void{
    this.loading=true;this.errorMessage='';
    forkJoin({bus:this.busService.getAll(),utilisateurs:this.utilisateurService.getUtilisateurs(),nettoyages:this.nettoyageService.getAll(),typesBus:this.typeBusService.getAll(),typesNettoyage:this.typeNettoyageService.getAll()}).subscribe({
      next:data=>{this.busData=data.bus;this.utilisateurs=data.utilisateurs;this.nettoyages=data.nettoyages;this.typesBus=data.typesBus;this.typesNettoyage=data.typesNettoyage;this.updateMetrics();this.loading=false;this.cdr.detectChanges();},
      error:error=>{console.error('Erreur de chargement du tableau de bord',error);this.errorMessage=error?.error?.message||error?.message||'Erreur de chargement du tableau de bord.';this.loading=false;this.cdr.detectChanges();}
    });
  }
  appliquerFiltre():void {
    if(this.dateDebut&&this.dateFin&&this.dateDebut>this.dateFin){
      this.filterError='La date de début doit précéder la date de fin.';
      return;
    }
    this.filterError='';
    this.dateDebutAppliquee=this.dateDebut;
    this.dateFinAppliquee=this.dateFin;
    this.updateMetrics();
  }

  get libellePeriode():string {
    if(!this.dateDebutAppliquee&&!this.dateFinAppliquee) return 'toutes périodes';
    if(this.dateDebutAppliquee&&this.dateFinAppliquee) return `du ${this.formatDate(this.dateDebutAppliquee)} au ${this.formatDate(this.dateFinAppliquee)}`;
    if(this.dateDebutAppliquee) return `depuis le ${this.formatDate(this.dateDebutAppliquee)}`;
    return `jusqu'au ${this.formatDate(this.dateFinAppliquee)}`;
  }

  private updateMetrics():void{
    const filtered=this.nettoyages.filter(n=>{
      return (!this.dateDebutAppliquee||n.dateNettoyage>=this.dateDebutAppliquee)
        &&(!this.dateFinAppliquee||n.dateNettoyage<=this.dateFinAppliquee);
    });
    this.bus=this.busData.length;
    this.nettoyagesJour=filtered.length;
    this.nettoyagesValides=filtered.filter(n=>n.statut==='VALIDE').length;
    this.nettoyagesRefuses=filtered.filter(n=>n.statut==='REFUSE').length;
    this.nettoyagesAttente=filtered.filter(n=>n.statut==='EN_ATTENTE').length;
    this.pourcentageValidation=filtered.length?Math.round(this.nettoyagesValides*100/filtered.length):0;
  }

  private formatDate(value:string):string {
    return new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR');
  }
}

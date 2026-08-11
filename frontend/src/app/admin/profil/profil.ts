import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, AuthenticatedUser } from '../../service/auth.service';
import { finalize, timeout } from 'rxjs';

@Component({ selector:'app-profil', standalone:true, imports:[FormsModule,CommonModule], templateUrl:'./profil.html', styleUrl:'./profil.css' })
export class Profil implements OnInit {
  modifierOuvert=false; motDePasseOuvert=false; voirAncien=false; voirNouveau=false; voirConfirmation=false;
  chargement=false; message=''; erreur=''; nom=''; prenom=''; email=''; telephone='';
  ancienMotDePasse=''; nouveauMotDePasse=''; confirmerMotDePasse='';
  constructor(public auth:AuthService) {}
  ngOnInit():void { this.remplirFormulaire(); this.auth.validateSession().subscribe(valid=>{if(valid)this.remplirFormulaire();}); }
  get utilisateur():AuthenticatedUser|null{return this.auth.currentUser();}
  get nomComplet():string{return this.utilisateur?`${this.utilisateur.prenom} ${this.utilisateur.nom}`.trim():'';}
  get initiales():string{return this.utilisateur?`${this.utilisateur.prenom?.[0]??''}${this.utilisateur.nom?.[0]??''}`.toUpperCase():'';}
  get roleAffiche():string{const r:Record<AuthenticatedUser['role'],string>={ADMINISTRATEUR:'Administrateur',CONSULTANT:'Consultant',SUPERVISEUR:'Superviseur',NETTOYEUR:'Nettoyeur'};return this.utilisateur?r[this.utilisateur.role]:'';}
  ouvrirModifier():void{this.remplirFormulaire();this.resetFeedback();this.modifierOuvert=true;this.motDePasseOuvert=false;}
  ouvrirMotDePasse():void{this.resetFeedback();this.motDePasseOuvert=true;this.modifierOuvert=false;}
  fermer():void{this.modifierOuvert=false;this.motDePasseOuvert=false;this.resetPasswords();this.resetFeedback();}
  sauvegarderProfil():void{if(this.chargement)return;this.resetFeedback();if(!this.nom.trim()||!this.prenom.trim()||!this.email.trim()){this.erreur='Le nom, le prénom et l’email sont obligatoires.';return;}this.chargement=true;this.auth.updateProfile({nom:this.nom.trim(),prenom:this.prenom.trim(),email:this.email.trim(),telephone:this.telephone.trim()||null}).pipe(timeout(12000),finalize(()=>this.chargement=false)).subscribe({next:()=>{this.modifierOuvert=false;this.message='Profil modifié avec succès.';},error:e=>{this.erreur=e?.name==='TimeoutError'?'Le serveur ne répond pas. Veuillez réessayer.':e?.error?.message||'Impossible de modifier le profil.';}});}
  changerMotDePasse():void{if(this.chargement)return;this.resetFeedback();if(!this.ancienMotDePasse||!this.nouveauMotDePasse||!this.confirmerMotDePasse){this.erreur='Tous les champs sont obligatoires.';return;}if(this.nouveauMotDePasse!==this.confirmerMotDePasse){this.erreur='Les mots de passe ne correspondent pas.';return;}this.chargement=true;this.auth.updateOwnPassword(this.ancienMotDePasse,this.nouveauMotDePasse,this.confirmerMotDePasse).pipe(timeout(12000),finalize(()=>this.chargement=false)).subscribe({next:()=>{this.motDePasseOuvert=false;this.resetPasswords();this.message='Mot de passe modifié avec succès.';},error:e=>{this.erreur=e?.name==='TimeoutError'?'Le serveur ne répond pas. Veuillez réessayer.':e?.error?.message||'Impossible de modifier le mot de passe.';}});}
  toggleAncien():void{this.voirAncien=!this.voirAncien;} toggleNouveau():void{this.voirNouveau=!this.voirNouveau;} toggleConfirmation():void{this.voirConfirmation=!this.voirConfirmation;}
  private remplirFormulaire():void{const u=this.utilisateur;if(!u)return;this.nom=u.nom;this.prenom=u.prenom;this.email=u.email;this.telephone=u.telephone??'';}
  private resetPasswords():void{this.ancienMotDePasse='';this.nouveauMotDePasse='';this.confirmerMotDePasse='';this.voirAncien=false;this.voirNouveau=false;this.voirConfirmation=false;}
  private resetFeedback():void{this.message='';this.erreur='';}
}

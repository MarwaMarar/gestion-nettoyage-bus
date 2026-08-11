import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutService } from '../../service/layout.service';
import { AuthService } from '../../service/auth.service';
import { AppNotification, NotificationService } from '../../service/notification.service';
import { forkJoin } from 'rxjs';
import { ConfirmationDialog } from '../../shared/confirmation-dialog';

@Component({
  selector: 'app-barre-superieure',
  standalone: true,
  imports: [CommonModule, ConfirmationDialog],
  templateUrl: './barre-superieure.html',
  styleUrls: ['./barre-superieure.css']
})
export class BarreSuperieureComponent {

  notificationsOuvert = false;
  toutesNotificationsAffichees = false;
  profilOuvert = false;
  notifications: AppNotification[] = [];
  notificationMessage = '';
  notificationError = '';
  deletingNotificationId: number | null = null;
  traitementNotifications = false;
  notificationASupprimer: AppNotification | null = null;

  layoutService = inject(LayoutService);

  constructor(private router: Router, public auth: AuthService, private notificationService: NotificationService) {
    this.chargerNotifications();
  }

  get nombreNonLues(): number { return this.notifications.filter(value => !value.lue).length; }
  get notificationsAffichees(): AppNotification[] { return this.toutesNotificationsAffichees ? this.notifications : this.notifications.slice(0, 3); }
  chargerNotifications(): void { this.notificationService.getMine().subscribe({next:values=>this.notifications=values,error:()=>this.notifications=[]}); }
  ouvrirNotifications(): void { this.notificationsOuvert=!this.notificationsOuvert;this.profilOuvert=false;this.toutesNotificationsAffichees=false;if(this.notificationsOuvert)this.chargerNotifications(); }
  fermerNotifications(): void { this.notificationsOuvert=false;this.toutesNotificationsAffichees=false; }
  ouvrirProfil(): void { this.profilOuvert=!this.profilOuvert;this.fermerNotifications(); }
  @HostListener('document:click') fermerMenus(): void { this.fermerNotifications();this.profilOuvert=false; }
  lireNotification(value:AppNotification):void { if(value.lue||this.utilisateur?.role==='CONSULTANT')return;this.notificationService.markRead(value.id).subscribe({next:updated=>value.lue=updated.lue}); }
  marquerToutesLues():void {const nonLues=this.notifications.filter(n=>!n.lue);if(nonLues.length===0||this.traitementNotifications)return;this.traitementNotifications=true;this.notificationError='';forkJoin(nonLues.map(n=>this.notificationService.markRead(n.id))).subscribe({next:()=>{this.notifications=this.notifications.map(n=>({...n,lue:true}));this.traitementNotifications=false;},error:error=>{this.traitementNotifications=false;this.chargerNotifications();this.notificationError=error?.error?.message||'Impossible de marquer les notifications comme lues.';}});}
  supprimerToutes():void {const valeurs=[...this.notifications];if(valeurs.length===0||this.traitementNotifications)return;this.traitementNotifications=true;this.notificationError='';forkJoin(valeurs.map(n=>this.notificationService.delete(n.id))).subscribe({next:()=>{this.notifications=[];this.toutesNotificationsAffichees=false;this.traitementNotifications=false;this.notificationMessage='Toutes les notifications ont été supprimées.';},error:error=>{this.traitementNotifications=false;this.chargerNotifications();this.notificationError=error?.error?.message||'Impossible de supprimer les notifications.';}});}
  supprimerNotification(event:Event,value:AppNotification):void {
    event.stopPropagation();
    this.notificationASupprimer=value;
  }
  confirmerSuppressionNotification():void {
    const value=this.notificationASupprimer;
    if(!value)return;
    this.notificationMessage='';this.notificationError='';
    const index=this.notifications.findIndex(item=>item.id===value.id);
    if(index<0)return;
    this.notifications=this.notifications.filter(item=>item.id!==value.id);
    this.deletingNotificationId=value.id;
    this.notificationService.delete(value.id).subscribe({
      next:()=>{this.notificationASupprimer=null;this.deletingNotificationId=null;if(this.notifications.length<=3)this.toutesNotificationsAffichees=false;this.notificationMessage='Notification supprimée.';},
      error:error=>{this.notificationASupprimer=null;this.notifications=[...this.notifications.slice(0,index),value,...this.notifications.slice(index)];this.deletingNotificationId=null;this.notificationError=error?.error?.message||'Impossible de supprimer la notification.';}
    });
  }

  get utilisateur() { return this.auth.currentUser(); }
  get nomAffiche(): string {
    const user = this.utilisateur;
    return user ? `${user.prenom} ${user.nom}`.trim() : '';
  }
  get roleAffiche(): string {
    return this.utilisateur?.role === 'ADMINISTRATEUR' ? 'Administrateur'
      : this.utilisateur?.role === 'CONSULTANT' ? 'Consultant'
      : this.utilisateur?.role === 'SUPERVISEUR' ? 'Superviseur' : 'Nettoyeur';
  }
  get initiales(): string {
    const user = this.utilisateur;
    return user ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase() : '';
  }


  deconnexion() {

    this.auth.logout();
    this.router.navigate(['/login']);

  }


  allerProfil() {
    this.router.navigate(['/profil']);
    this.profilOuvert = false;
  }


  allerParametres() {
    this.router.navigate(['/admin/parametres']);
    this.profilOuvert = false;
  }

}

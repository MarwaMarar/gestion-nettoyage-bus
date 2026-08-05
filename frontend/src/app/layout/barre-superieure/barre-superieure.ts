import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutService } from '../../service/layout.service';
import { AuthService } from '../../service/auth.service';
import { AppNotification, NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-barre-superieure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barre-superieure.html',
  styleUrls: ['./barre-superieure.css']
})
export class BarreSuperieureComponent {

  notificationsOuvert = false;
  profilOuvert = false;
  notifications: AppNotification[] = [];
  notificationMessage = '';
  notificationError = '';
  deletingNotificationId: number | null = null;

  layoutService = inject(LayoutService);

  constructor(private router: Router, public auth: AuthService, private notificationService: NotificationService) {
    this.chargerNotifications();
  }

  get nombreNonLues(): number { return this.notifications.filter(value => !value.lue).length; }
  chargerNotifications(): void { this.notificationService.getMine().subscribe({next:values=>this.notifications=values,error:()=>this.notifications=[]}); }
  ouvrirNotifications(): void { this.notificationsOuvert=!this.notificationsOuvert; if(this.notificationsOuvert)this.chargerNotifications(); }
  lireNotification(value:AppNotification):void { if(value.lue||this.utilisateur?.role==='CONSULTANT')return;this.notificationService.markRead(value.id).subscribe({next:updated=>value.lue=updated.lue}); }
  supprimerNotification(event:Event,value:AppNotification):void {
    event.stopPropagation();
    this.notificationMessage='';this.notificationError='';
    const index=this.notifications.findIndex(item=>item.id===value.id);
    if(index<0)return;
    this.notifications=this.notifications.filter(item=>item.id!==value.id);
    this.deletingNotificationId=value.id;
    this.notificationService.delete(value.id).subscribe({
      next:()=>{this.deletingNotificationId=null;this.notificationMessage='Notification supprimée.';},
      error:error=>{this.notifications=[...this.notifications.slice(0,index),value,...this.notifications.slice(index)];this.deletingNotificationId=null;this.notificationError=error?.error?.message||'Impossible de supprimer la notification.';}
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
    this.router.navigate(['/admin/profil']);
    this.profilOuvert = false;
  }


  allerParametres() {
    this.router.navigate(['/admin/parametres']);
    this.profilOuvert = false;
  }

}

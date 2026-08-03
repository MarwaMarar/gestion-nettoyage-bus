import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
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
<<<<<<< HEAD
=======
  notificationsSuppression = new Set<number>();
  notificationError = '';
>>>>>>> e35a0c0 (fully works)

  layoutService = inject(LayoutService);

  constructor(private router: Router, public auth: AuthService, private notificationService: NotificationService) {
    this.chargerNotifications();
  }

  get nombreNonLues(): number { return this.notifications.filter(value => !value.lue).length; }
  chargerNotifications(): void { this.notificationService.getMine().subscribe({next:values=>this.notifications=values,error:()=>this.notifications=[]}); }
  ouvrirNotifications(): void { this.notificationsOuvert=!this.notificationsOuvert; if(this.notificationsOuvert)this.chargerNotifications(); }
<<<<<<< HEAD
  lireNotification(value:AppNotification):void { if(value.lue||this.utilisateur?.role==='CONSULTANT')return;this.notificationService.markRead(value.id).subscribe({next:updated=>value.lue=updated.lue}); }
=======
  lireNotification(value:AppNotification):void { if(value.lue)return;this.notificationService.markRead(value.id).subscribe({next:updated=>value.lue=updated.lue}); }
  supprimerNotification(event:MouseEvent,value:AppNotification):void {
    event.stopPropagation();
    if(this.notificationsSuppression.has(value.id))return;
    this.notificationError='';
    this.notificationsSuppression.add(value.id);
    const originalIndex=this.notifications.findIndex(notification=>notification.id===value.id);
    this.notifications=this.notifications.filter(notification=>notification.id!==value.id);
    this.notificationService.delete(value.id).pipe(
      timeout(8000),
      finalize(()=>this.notificationsSuppression.delete(value.id))
    ).subscribe({
      error:()=>{
        const restored=[...this.notifications];
        restored.splice(Math.max(0,originalIndex),0,value);
        this.notifications=restored;
        this.notificationError='La suppression a échoué. Veuillez réessayer.';
      }
    });
  }
>>>>>>> e35a0c0 (fully works)

  get utilisateur() { return this.auth.currentUser(); }
  get nomAffiche(): string {
    const user = this.utilisateur;
    return user ? `${user.prenom} ${user.nom}`.trim() : '';
  }
  get roleAffiche(): string {
    return this.utilisateur?.role === 'ADMINISTRATEUR' ? 'Administrateur'
<<<<<<< HEAD
      : this.utilisateur?.role === 'CONSULTANT' ? 'Consultant'
=======
>>>>>>> e35a0c0 (fully works)
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

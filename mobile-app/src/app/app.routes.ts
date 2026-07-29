import { Routes } from '@angular/router';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'dashboard',
    canActivate: [roleGuard(['NETTOYEUR', 'ADMINISTRATEUR'])],
    loadComponent: () => import('./pages/nettoyeur/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'nettoyage-en-cours',
    canActivate: [roleGuard(['NETTOYEUR', 'ADMINISTRATEUR'])],
    loadComponent: () => import('./pages/nettoyeur/nettoyage-en-cours/nettoyage-en-cours.page').then( m => m.NettoyageEnCoursPage)
  },
  {
    path: 'fin-nettoyage',
    canActivate: [roleGuard(['NETTOYEUR', 'ADMINISTRATEUR'])],
    loadComponent: () => import('./pages/nettoyeur/fin-nettoyage/fin-nettoyage.page').then( m => m.FinNettoyagePage)
  },
  {
    path: 'superviseur-dashboard',
    canActivate: [roleGuard(['SUPERVISEUR', 'ADMINISTRATEUR'])],
    loadComponent: () => import('./superviseur-dashboard/superviseur-dashboard.page').then( m => m.SuperviseurDashboardPage)
  },
  {
    path: 'liste-nettoyages',
    canActivate: [roleGuard(['SUPERVISEUR', 'ADMINISTRATEUR'])],
    loadComponent: () => import('./pages/liste-nettoyages/liste-nettoyages.page').then( m => m.ListeNettoyagesPage)
  },
  {
    path: 'details-nettoyage/:id',
    canActivate: [roleGuard(['SUPERVISEUR', 'ADMINISTRATEUR'])],
    loadComponent: () => import('./pages/details-nettoyage/details-nettoyage.page').then( m => m.DetailsNettoyagePage)
  },
  {
    path: 'notifications',
    canActivate: [roleGuard(['NETTOYEUR', 'ADMINISTRATEUR'])],
    loadComponent: () => import('./pages/notifications/notifications.page').then( m => m.NotificationsPage)
  },
  {
    path: 'notifications-superviseur',
    canActivate: [roleGuard(['SUPERVISEUR', 'ADMINISTRATEUR'])],
    loadComponent: () => import('./pages/superviseur/notifications-superviseur/notifications-superviseur.page').then( m => m.NotificationsSuperviseurPage)
  },
];

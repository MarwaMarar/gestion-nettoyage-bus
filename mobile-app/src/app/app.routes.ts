import { Routes } from '@angular/router';

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
    loadComponent: () => import('./pages/nettoyeur/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'nettoyage-en-cours',
    loadComponent: () => import('./pages/nettoyeur/nettoyage-en-cours/nettoyage-en-cours.page').then( m => m.NettoyageEnCoursPage)
  },
  {
    path: 'fin-nettoyage',
    loadComponent: () => import('./pages/nettoyeur/fin-nettoyage/fin-nettoyage.page').then( m => m.FinNettoyagePage)
  },
  {
    path: 'superviseur-dashboard',
    loadComponent: () => import('./superviseur-dashboard/superviseur-dashboard.page').then( m => m.SuperviseurDashboardPage)
  },
  {
    path: 'liste-nettoyages',
    loadComponent: () => import('./pages/liste-nettoyages/liste-nettoyages.page').then( m => m.ListeNettoyagesPage)
  },
  {
    path: 'details-nettoyage',
    loadComponent: () => import('./pages/details-nettoyage/details-nettoyage.page').then( m => m.DetailsNettoyagePage)
  },
];

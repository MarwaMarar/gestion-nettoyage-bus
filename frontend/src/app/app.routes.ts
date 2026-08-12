import { Routes } from '@angular/router';
import { passwordChangeGuard } from './auth-guard';
import { roleGuard } from './role-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'change-password', loadComponent: () => import('./login/change-password').then(m => m.ChangePassword), canActivate: [passwordChangeGuard] },

  { path: 'admin/tableau-de-bord', loadComponent: () => import('./admin/tableau-de-bord/tableau-de-bord').then(m => m.TableauDeBordComponent), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/bus', loadComponent: () => import('./admin/bus/bus').then(m => m.Bus), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/bus-exclus', loadComponent: () => import('./admin/bus-exclus/bus-exclus').then(m => m.BusExclus), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/utilisateurs', loadComponent: () => import('./admin/utilisateurs/utilisateurs').then(m => m.Utilisateurs), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/nettoyages', loadComponent: () => import('./admin/nettoyages/nettoyages').then(m => m.Nettoyages), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/planification', loadComponent: () => import('./admin/planification/planification').then(m => m.Planification), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/types-nettoyage', loadComponent: () => import('./admin/types-nettoyage/types-nettoyage').then(m => m.TypesNettoyage), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/rapports', loadComponent: () => import('./admin/rapports/rapports').then(m => m.Rapports), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/parametres', loadComponent: () => import('./admin/parametres/parametres').then(m => m.Parametres), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/profil', loadComponent: () => import('./admin/profil/profil').then(m => m.Profil), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'profil', loadComponent: () => import('./admin/profil/profil').then(m => m.Profil), canActivate: [roleGuard(['ADMINISTRATEUR', 'CONSULTANT', 'SUPERVISEUR', 'NETTOYEUR'])] },

  { path: 'consultant/tableau-de-bord', loadComponent: () => import('./admin/tableau-de-bord/tableau-de-bord').then(m => m.TableauDeBordComponent), canActivate: [roleGuard(['CONSULTANT'])] },
  { path: 'consultant/nettoyages', loadComponent: () => import('./admin/nettoyages/nettoyages').then(m => m.Nettoyages), canActivate: [roleGuard(['CONSULTANT'])] },
  { path: 'consultant/rapports', loadComponent: () => import('./admin/rapports/rapports').then(m => m.Rapports), canActivate: [roleGuard(['CONSULTANT'])] },
  { path: 'consultant/vue-superviseur', loadComponent: () => import('./workflows/superviseur-dashboard').then(m => m.SuperviseurDashboard), canActivate: [roleGuard(['CONSULTANT'])] },
  { path: 'consultant/vue-nettoyeur', loadComponent: () => import('./workflows/nettoyeur-dashboard').then(m => m.NettoyeurDashboard), canActivate: [roleGuard(['CONSULTANT'])] },

  { path: 'nettoyeur/tableau-de-bord', loadComponent: () => import('./workflows/nettoyeur-dashboard').then(m => m.NettoyeurDashboard),
    canActivate: [roleGuard(['NETTOYEUR', 'ADMINISTRATEUR'])] },
  { path: 'nettoyeur/nettoyage-en-cours', loadComponent: () => import('./workflows/nettoyage-en-cours').then(m => m.NettoyageEnCours),
    canActivate: [roleGuard(['NETTOYEUR', 'ADMINISTRATEUR'])] },
  { path: 'nettoyeur/fin-nettoyage', loadComponent: () => import('./workflows/fin-nettoyage').then(m => m.FinNettoyage),
    canActivate: [roleGuard(['NETTOYEUR', 'ADMINISTRATEUR'])] },
  { path: 'nettoyeur/historique', loadComponent: () => import('./workflows/historique-nettoyeur').then(m => m.HistoriqueNettoyeur),
    canActivate: [roleGuard(['NETTOYEUR', 'ADMINISTRATEUR'])] },

  { path: 'superviseur/tableau-de-bord', loadComponent: () => import('./workflows/superviseur-dashboard').then(m => m.SuperviseurDashboard),
    canActivate: [roleGuard(['SUPERVISEUR', 'ADMINISTRATEUR'])] },
  { path: 'superviseur/nettoyages', loadComponent: () => import('./workflows/liste-nettoyages').then(m => m.ListeNettoyagesWorkflow),
    canActivate: [roleGuard(['SUPERVISEUR', 'ADMINISTRATEUR'])] },
  { path: 'superviseur/nettoyages/:id', loadComponent: () => import('./workflows/details-nettoyage').then(m => m.DetailsNettoyageWorkflow),
    canActivate: [roleGuard(['SUPERVISEUR', 'ADMINISTRATEUR'])] },

  { path: '**', redirectTo: 'login' },
];

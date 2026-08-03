import { Routes } from '@angular/router';
<<<<<<< HEAD
import { loginGuard, passwordChangeGuard } from './auth-guard';
import { roleGuard } from './role-guard';
=======
import { TableauDeBordComponent } from './admin/tableau-de-bord/tableau-de-bord';
import { Bus } from './admin/bus/bus';
import { Utilisateurs } from './admin/utilisateurs/utilisateurs';
import { Nettoyages } from './admin/nettoyages/nettoyages';
import { Rapports } from './admin/rapports/rapports';
import { Parametres } from './admin/parametres/parametres';
import { Profil } from './admin/profil/profil';
import { Login } from './login/login';
import { authGuard } from './auth-guard';
import { roleGuard } from './role-guard';
import { NettoyeurDashboard } from './workflows/nettoyeur-dashboard';
import { NettoyageEnCours } from './workflows/nettoyage-en-cours';
import { FinNettoyage } from './workflows/fin-nettoyage';
import { HistoriqueNettoyeur } from './workflows/historique-nettoyeur';
import { SuperviseurDashboard } from './workflows/superviseur-dashboard';
import { ListeNettoyagesWorkflow } from './workflows/liste-nettoyages';
import { DetailsNettoyageWorkflow } from './workflows/details-nettoyage';
>>>>>>> e35a0c0 (fully works)

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login), canActivate: [loginGuard] },
  { path: 'change-password', loadComponent: () => import('./login/change-password').then(m => m.ChangePassword), canActivate: [passwordChangeGuard] },

<<<<<<< HEAD
  { path: 'admin/tableau-de-bord', loadComponent: () => import('./admin/tableau-de-bord/tableau-de-bord').then(m => m.TableauDeBordComponent), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/bus', loadComponent: () => import('./admin/bus/bus').then(m => m.Bus), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/utilisateurs', loadComponent: () => import('./admin/utilisateurs/utilisateurs').then(m => m.Utilisateurs), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/nettoyages', loadComponent: () => import('./admin/nettoyages/nettoyages').then(m => m.Nettoyages), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/rapports', loadComponent: () => import('./admin/rapports/rapports').then(m => m.Rapports), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/parametres', loadComponent: () => import('./admin/parametres/parametres').then(m => m.Parametres), canActivate: [roleGuard(['ADMINISTRATEUR'])] },
  { path: 'admin/profil', loadComponent: () => import('./admin/profil/profil').then(m => m.Profil), canActivate: [roleGuard(['ADMINISTRATEUR'])] },

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
=======
  { path: 'admin/tableau-de-bord', component: TableauDeBordComponent, canActivate: [authGuard] },
  { path: 'admin/bus', component: Bus, canActivate: [authGuard] },
  { path: 'admin/utilisateurs', component: Utilisateurs, canActivate: [authGuard] },
  { path: 'admin/nettoyages', component: Nettoyages, canActivate: [authGuard] },
  { path: 'admin/rapports', component: Rapports, canActivate: [authGuard] },
  { path: 'admin/parametres', component: Parametres, canActivate: [authGuard] },
  { path: 'admin/profil', component: Profil, canActivate: [authGuard] },

  { path: 'nettoyeur/tableau-de-bord', component: NettoyeurDashboard,
    canActivate: [roleGuard(['NETTOYEUR', 'ADMINISTRATEUR'])] },
  { path: 'nettoyeur/nettoyage-en-cours', component: NettoyageEnCours,
    canActivate: [roleGuard(['NETTOYEUR', 'ADMINISTRATEUR'])] },
  { path: 'nettoyeur/fin-nettoyage', component: FinNettoyage,
    canActivate: [roleGuard(['NETTOYEUR', 'ADMINISTRATEUR'])] },
  { path: 'nettoyeur/historique', component: HistoriqueNettoyeur,
    canActivate: [roleGuard(['NETTOYEUR', 'ADMINISTRATEUR'])] },

  { path: 'superviseur/tableau-de-bord', component: SuperviseurDashboard,
    canActivate: [roleGuard(['SUPERVISEUR', 'ADMINISTRATEUR'])] },
  { path: 'superviseur/nettoyages', component: ListeNettoyagesWorkflow,
    canActivate: [roleGuard(['SUPERVISEUR', 'ADMINISTRATEUR'])] },
  { path: 'superviseur/nettoyages/:id', component: DetailsNettoyageWorkflow,
>>>>>>> e35a0c0 (fully works)
    canActivate: [roleGuard(['SUPERVISEUR', 'ADMINISTRATEUR'])] },

  { path: '**', redirectTo: 'login' },
];

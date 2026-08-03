import { Routes } from '@angular/router';
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

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },

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
    canActivate: [roleGuard(['SUPERVISEUR', 'ADMINISTRATEUR'])] },

  { path: '**', redirectTo: 'login' },
];

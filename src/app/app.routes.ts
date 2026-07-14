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
];

import { Routes } from '@angular/router';
import { TableauDeBordComponent } from './admin/tableau-de-bord/tableau-de-bord';
import { Bus } from './admin/bus/bus';
import { Utilisateurs } from './admin/utilisateurs/utilisateurs';
import { Nettoyages } from './admin/nettoyages/nettoyages';
import { Rapports } from './admin/rapports/rapports';

export const routes: Routes = [
  { path: 'admin/tableau-de-bord', component: TableauDeBordComponent },
  { path: 'admin/bus', component: Bus },
  { path: '', redirectTo: 'admin/tableau-de-bord', pathMatch: 'full' },
  { path: 'admin/utilisateurs', component: Utilisateurs },
  { path: 'admin/nettoyages', component: Nettoyages },
  { path: 'admin/rapports', component: Rapports },
];

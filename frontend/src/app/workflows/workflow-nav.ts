import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-workflow-nav',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="workflow-nav">
      <a class="brand" [routerLink]="home"><i class="fa-solid fa-bus"></i><span>ALSA Clean Fleet</span></a>
      <nav>
        <a [routerLink]="home">Accueil</a>
        @if (section === 'nettoyeur') { <a routerLink="/nettoyeur/historique">Historique</a> }
        @if (section === 'superviseur') { <a routerLink="/superviseur/nettoyages">Nettoyages en attente</a> }
        @if (auth.currentUser()?.role === 'ADMINISTRATEUR') {
          <a routerLink="/admin/tableau-de-bord">Administration</a>
        }
        <button type="button" (click)="logout()"><i class="fa-solid fa-right-from-bracket"></i> Déconnexion</button>
      </nav>
    </header>
  `,
  styleUrl: './workflow.css'
})
export class WorkflowNav {
  @Input({ required: true }) section!: 'nettoyeur' | 'superviseur';
  constructor(public auth: AuthService, private router: Router) {}
  get home(): string { return `/${this.section}/tableau-de-bord`; }
  logout(): void { this.auth.logout(); this.router.navigateByUrl('/login'); }
}

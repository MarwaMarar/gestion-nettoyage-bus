import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarreLaterale } from './layout/barre-laterale/barre-laterale';
import { BarreSuperieureComponent } from './layout/barre-superieure/barre-superieure';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    BarreLaterale,
    BarreSuperieureComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gestion-nettoyage-bus');
}

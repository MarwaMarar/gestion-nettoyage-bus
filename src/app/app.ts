import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarreLaterale } from './layout/barre-laterale/barre-laterale';
import { BarreSuperieure } from './layout/barre-superieure/barre-superieure';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BarreLaterale, BarreSuperieure],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gestion-nettoyage-bus');
}

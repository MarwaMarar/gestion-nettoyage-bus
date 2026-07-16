import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarreLaterale } from './layout/barre-laterale/barre-laterale';
import { BarreSuperieureComponent } from './layout/barre-superieure/barre-superieure';
import { CommonModule } from '@angular/common';
import { LayoutService } from './service/layout.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BarreLaterale,
    BarreSuperieureComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gestion-nettoyage-bus');
  layoutService = inject(LayoutService);
}

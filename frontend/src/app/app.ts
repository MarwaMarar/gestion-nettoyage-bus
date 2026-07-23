import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { BarreLaterale } from './layout/barre-laterale/barre-laterale';
import { BarreSuperieureComponent } from './layout/barre-superieure/barre-superieure';
import { CommonModule } from '@angular/common';
import { LayoutService } from './service/layout.service';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { LanguageService } from './service/language.service';

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
  private readonly languageService = inject(LanguageService);
  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
    ),
    { initialValue: null }
  );

  isLoginPage = computed(() => {
    this.currentUrl();
    return this.router.url === '/login' || this.router.url === '/';
  });
}

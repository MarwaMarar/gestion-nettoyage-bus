import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { BarreLaterale } from './layout/barre-laterale/barre-laterale';
import { BarreSuperieureComponent } from './layout/barre-superieure/barre-superieure';
import { CommonModule } from '@angular/common';
import { LayoutService } from './service/layout.service';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { LanguageService } from './service/language.service';
import { GlobalDynamicBackgroundComponent } from './layout/global-dynamic-background/global-dynamic-background';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BarreLaterale,
    BarreSuperieureComponent,
    GlobalDynamicBackgroundComponent
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

  showAppLayout = computed(() => {
    this.currentUrl();
    return !this.router.url.startsWith('/login') && !this.router.url.startsWith('/change-password');
  });
}

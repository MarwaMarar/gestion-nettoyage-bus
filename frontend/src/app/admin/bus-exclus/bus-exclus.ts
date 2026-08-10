import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BusExclusionService } from '../../service/bus-exclusion.service';
import { BusService } from '../../service/bus.service';
import { Bus, BusExclusion, TypeExclusionBus } from '../../service/api.models';

@Component({
  selector: 'app-bus-exclus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bus-exclus.html',
  styleUrl: './bus-exclus.css'
})
export class BusExclus implements OnInit {
  readonly listes: { type: TypeExclusionBus; titre: string; icon: string }[] = [
    { type: 'DORMANT', titre: 'Bus dormants', icon: 'fa-moon' },
    { type: 'IMMOBILISE', titre: 'Bus immobilisés', icon: 'fa-screwdriver-wrench' }
  ];
  bus: Bus[] = [];
  exclusions: BusExclusion[] = [];
  selection: Record<TypeExclusionBus, number | null> = { DORMANT: null, IMMOBILISE: null };
  message = '';
  erreur = '';

  constructor(private api: BusExclusionService, private busApi: BusService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.charger(); }
  get dormants() { return this.exclusions.filter(value => value.type === 'DORMANT'); }
  get immobilises() { return this.exclusions.filter(value => value.type === 'IMMOBILISE'); }
  get disponibles() {
    const exclus = new Set(this.exclusions.map(value => value.busId));
    return this.bus.filter(value => !exclus.has(value.id));
  }

  ajouter(type: TypeExclusionBus) {
    const busId = this.selection[type];
    if (busId === null) { this.erreur = 'Sélectionnez un bus.'; return; }
    this.api.create({ busId: Number(busId), type }).subscribe({
      next: () => { this.message = 'Bus ajouté à la liste.'; this.erreur = ''; this.charger(); },
      error: error => this.afficherErreur(error, "L'ajout a échoué.")
    });
  }

  supprimer(value: BusExclusion) {
    this.api.delete(value.id).subscribe({
      next: () => { this.message = 'Bus retiré de la liste.'; this.erreur = ''; this.charger(); },
      error: error => this.afficherErreur(error, 'La suppression a échoué.')
    });
  }

  private charger() {
    forkJoin({ bus: this.busApi.getAll(), exclusions: this.api.getAll() }).subscribe({
      next: result => {
        this.bus = result.bus;
        this.exclusions = result.exclusions;
        for (const type of ['DORMANT', 'IMMOBILISE'] as TypeExclusionBus[]) {
          if (!this.disponibles.some(value => value.id === this.selection[type])) {
            this.selection[type] = this.disponibles[0]?.id ?? null;
          }
        }
        this.cdr.detectChanges();
      },
      error: error => this.afficherErreur(error, 'Impossible de charger les listes.')
    });
  }

  private afficherErreur(error: any, fallback: string) {
    this.erreur = error?.error?.message || error?.message || fallback;
    this.message = '';
    this.cdr.detectChanges();
  }
}

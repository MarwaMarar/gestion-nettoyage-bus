import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BusExclusionService } from '../../service/bus-exclusion.service';
import { BusService } from '../../service/bus.service';
import { Bus, BusExclusion, TypeExclusionBus } from '../../service/api.models';
import { ConfirmationDialog } from '../../shared/confirmation-dialog';

@Component({
  selector: 'app-bus-exclus',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialog],
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
  recherche: Record<TypeExclusionBus, string> = { DORMANT: '', IMMOBILISE: '' };
  listesDeveloppees: Record<TypeExclusionBus, boolean> = { DORMANT: false, IMMOBILISE: false };
  message = '';
  erreur = '';
  exclusionASupprimer: BusExclusion | null = null;
  suppressionEnCours = false;

  constructor(private api: BusExclusionService, private busApi: BusService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.charger(); }
  get dormants() { return this.exclusions.filter(value => value.type === 'DORMANT'); }
  get immobilises() { return this.exclusions.filter(value => value.type === 'IMMOBILISE'); }
  exclusionsDuType(type: TypeExclusionBus): BusExclusion[] {
    const valeurs = type === 'DORMANT' ? this.dormants : this.immobilises;
    return this.listesDeveloppees[type] ? valeurs : valeurs.slice(0, 9);
  }

  nombreExclusions(type: TypeExclusionBus): number {
    return type === 'DORMANT' ? this.dormants.length : this.immobilises.length;
  }

  basculerListe(type: TypeExclusionBus): void {
    this.listesDeveloppees[type] = !this.listesDeveloppees[type];
  }
  get disponibles() {
    const exclus = new Set(this.exclusions.map(value => value.busId));
    return this.bus.filter(value => !exclus.has(value.id));
  }

  resultatsRecherche(type: TypeExclusionBus): Bus[] {
    const terme = this.recherche[type].trim().toLocaleLowerCase('fr');
    if (!terme) return [];
    return this.bus
      .filter(value => `${value.numeroBus} ${value.typeBusLibelle}`.toLocaleLowerCase('fr').includes(terme))
      .slice(0, 10);
  }

  statutExclusion(busId: number): string | null {
    const exclusion = this.exclusions.find(value => value.busId === busId);
    if (!exclusion) return null;
    return exclusion.type === 'DORMANT' ? 'Dormant' : 'Immobilisé';
  }

  selectionner(type: TypeExclusionBus, value: Bus): void {
    if (this.statutExclusion(value.id)) return;
    this.selection[type] = value.id;
    this.recherche[type] = `${value.numeroBus} — ${value.typeBusLibelle}`;
    this.erreur = '';
  }

  modifierRecherche(type: TypeExclusionBus): void {
    this.selection[type] = null;
  }

  ajouter(type: TypeExclusionBus) {
    const busId = this.selection[type];
    if (busId === null) { this.erreur = 'Sélectionnez un bus.'; return; }
    this.api.create({ busId: Number(busId), type }).subscribe({
      next: () => {
        this.message = 'Bus ajouté à la liste.';
        this.erreur = '';
        this.selection[type] = null;
        this.recherche[type] = '';
        this.charger();
      },
      error: error => this.afficherErreur(error, "L'ajout a échoué.")
    });
  }

  supprimer(value: BusExclusion) {
    this.exclusionASupprimer = value;
  }

  confirmerSuppression(): void {
    if (!this.exclusionASupprimer) return;
    this.suppressionEnCours = true;
    this.api.delete(this.exclusionASupprimer.id).subscribe({
      next: () => { this.exclusionASupprimer = null; this.suppressionEnCours = false; this.message = 'Bus retiré de la liste.'; this.erreur = ''; this.charger(); },
      error: error => { this.exclusionASupprimer = null; this.suppressionEnCours = false; this.afficherErreur(error, 'La suppression a échoué.'); }
    });
  }

  private charger() {
    forkJoin({ bus: this.busApi.getAll(), exclusions: this.api.getAll() }).subscribe({
      next: result => {
        this.bus = result.bus;
        this.exclusions = result.exclusions;
        for (const type of ['DORMANT', 'IMMOBILISE'] as TypeExclusionBus[]) {
          if (!this.disponibles.some(value => value.id === this.selection[type])) {
            this.selection[type] = null;
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

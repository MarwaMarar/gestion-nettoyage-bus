import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeNettoyage } from '../../service/api.models';
import { TypeNettoyageService } from '../../service/type-nettoyage.service';

@Component({
  selector: 'app-types-nettoyage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './types-nettoyage.html',
  styleUrl: './types-nettoyage.css'
})
export class TypesNettoyage implements OnInit {
  types: TypeNettoyage[] = [];
  recherche = '';
  libelle = '';
  description = '';
  frequenceMode: 'occurrences' | 'intervalle' | 'manuel' = 'occurrences';
  frequenceNombre = 1;
  frequencePeriode: 'jour' | 'semaine' | 'mois' = 'jour';
  afficherAjout = false;
  typeAModifier: TypeNettoyage | null = null;
  typeASupprimer: TypeNettoyage | null = null;
  chargement = false;
  soumission = false;
  erreur = '';
  succes = '';

  constructor(private api: TypeNettoyageService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.charger(); }

  get typesFiltres(): TypeNettoyage[] {
    const terme = this.recherche.trim().toLocaleLowerCase('fr');
    if (!terme) return this.types;
    return this.types.filter(type =>
      `${type.libelle} ${type.description ?? ''} ${type.frequence ?? ''}`.toLocaleLowerCase('fr').includes(terme)
    );
  }

  ouvrirAjout(): void {
    this.libelle = '';
    this.description = '';
    this.reinitialiserFrequence();
    this.erreur = '';
    this.succes = '';
    this.afficherAjout = true;
  }

  fermerAjout(): void { if (!this.soumission) this.afficherAjout = false; }

  ouvrirModification(type: TypeNettoyage): void {
    this.typeAModifier = type;
    this.libelle = type.libelle;
    this.description = type.description ?? '';
    this.chargerFrequence(type.frequence);
    this.erreur = '';
    this.succes = '';
  }

  afficherFrequence(value: string | null): string {
    const frequence = (value ?? '').trim();
    if (!frequence) return '—';
    const normalisee = frequence.toLocaleLowerCase('fr');
    if (normalisee === 'selon besoin') return 'Selon besoin';
    if (normalisee.includes('quotidien') || normalisee === 'chaque jour' || normalisee === 'par jour') {
      return '1 fois/jour';
    }
    const occurrences = normalisee.match(/^(\d+)\s+fois\s*(?:par|\/)\s*(jour|semaine|mois)$/);
    if (occurrences) return `${occurrences[1]} fois/${occurrences[2]}`;
    const intervalle = normalisee.match(/^(?:chaque|tous les)\s+(\d+)\s+mois$/);
    if (intervalle) return `Tous les ${intervalle[1]} mois`;
    return frequence;
  }

  fermerModification(): void { if (!this.soumission) this.typeAModifier = null; }

  modifier(): void {
    if (!this.typeAModifier) return;
    const libelle = this.libelle.trim();
    const frequence = this.construireFrequence();
    if (!libelle || !frequence) {
      this.erreur = 'Le libellé et la fréquence sont obligatoires.';
      return;
    }
    this.soumission = true;
    this.erreur = '';
    this.api.update(this.typeAModifier.id, { libelle, description: this.description.trim() || null, frequence }).subscribe({
      next: () => {
        this.typeAModifier = null;
        this.soumission = false;
        this.succes = 'Type de nettoyage modifié avec succès.';
        this.charger();
      },
      error: error => {
        this.soumission = false;
        this.erreur = error?.error?.message || 'La modification du type de nettoyage a échoué.';
        this.cdr.detectChanges();
      }
    });
  }

  ajouter(): void {
    const libelle = this.libelle.trim();
    const frequence = this.construireFrequence();
    if (!libelle || !frequence) {
      this.erreur = 'Le libellé et la fréquence sont obligatoires.';
      return;
    }
    this.soumission = true;
    this.erreur = '';
    this.api.create({ libelle, description: this.description.trim() || null, frequence }).subscribe({
      next: () => {
        this.afficherAjout = false;
        this.soumission = false;
        this.succes = 'Type de nettoyage ajouté avec succès.';
        this.charger();
      },
      error: error => {
        this.soumission = false;
        this.erreur = error?.error?.message || "L'ajout du type de nettoyage a échoué.";
        this.cdr.detectChanges();
      }
    });
  }

  demanderSuppression(type: TypeNettoyage): void {
    this.erreur = '';
    this.succes = '';
    this.typeASupprimer = type;
  }

  annulerSuppression(): void { if (!this.soumission) this.typeASupprimer = null; }

  supprimer(): void {
    if (!this.typeASupprimer) return;
    const id = this.typeASupprimer.id;
    this.soumission = true;
    this.erreur = '';
    this.api.delete(id).subscribe({
      next: () => {
        this.typeASupprimer = null;
        this.soumission = false;
        this.succes = 'Type de nettoyage supprimé avec succès.';
        this.charger();
      },
      error: error => {
        this.typeASupprimer = null;
        this.soumission = false;
        this.erreur = error?.error?.message || 'La suppression du type de nettoyage a échoué.';
        this.cdr.detectChanges();
      }
    });
  }

  private charger(): void {
    this.chargement = true;
    this.api.getAll().subscribe({
      next: types => {
        this.types = types;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: error => {
        this.chargement = false;
        this.erreur = error?.error?.message || 'Impossible de charger les types de nettoyage.';
        this.cdr.detectChanges();
      }
    });
  }

  private reinitialiserFrequence(): void {
    this.frequenceMode = 'occurrences';
    this.frequenceNombre = 1;
    this.frequencePeriode = 'jour';
  }

  private construireFrequence(): string {
    if (this.frequenceMode === 'manuel') return 'Selon besoin';
    const nombre = Math.trunc(this.frequenceNombre);
    if (nombre < 1) return '';
    if (this.frequenceMode === 'intervalle') return `Tous les ${nombre} mois`;
    return `${nombre} fois/${this.frequencePeriode}`;
  }

  private chargerFrequence(value: string | null): void {
    const frequence = (value ?? '').trim().toLocaleLowerCase('fr');
    if (frequence === 'selon besoin') {
      this.frequenceMode = 'manuel';
      this.frequenceNombre = 1;
      return;
    }
    const intervalle = frequence.match(/^(?:chaque|tous les)\s+(\d+)\s+mois$/);
    if (intervalle) {
      this.frequenceMode = 'intervalle';
      this.frequenceNombre = Number(intervalle[1]);
      return;
    }
    const occurrences = frequence.match(/^(\d+)\s+fois\s*(?:par|\/)\s*(jour|semaine|mois)$/);
    this.frequenceMode = 'occurrences';
    if (occurrences) {
      this.frequenceNombre = Number(occurrences[1]);
      this.frequencePeriode = occurrences[2] as 'jour' | 'semaine' | 'mois';
    } else {
      this.frequenceNombre = 1;
      this.frequencePeriode = frequence.includes('semaine') ? 'semaine' : frequence.includes('mois') ? 'mois' : 'jour';
    }
  }
}

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
  frequence = '';
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
    this.frequence = '';
    this.erreur = '';
    this.succes = '';
    this.afficherAjout = true;
  }

  fermerAjout(): void { if (!this.soumission) this.afficherAjout = false; }

  ouvrirModification(type: TypeNettoyage): void {
    this.typeAModifier = type;
    this.libelle = type.libelle;
    this.description = type.description ?? '';
    this.frequence = type.frequence ?? '';
    this.erreur = '';
    this.succes = '';
  }

  fermerModification(): void { if (!this.soumission) this.typeAModifier = null; }

  modifier(): void {
    if (!this.typeAModifier) return;
    const libelle = this.libelle.trim();
    const frequence = this.frequence.trim();
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
    const frequence = this.frequence.trim();
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
}

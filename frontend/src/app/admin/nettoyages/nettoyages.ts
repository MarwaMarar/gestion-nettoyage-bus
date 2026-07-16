import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { parseCSV } from '../../utils/csv-parser';

const STORAGE_KEY_NETTOYAGES = 'nettoyages_data';
const STORAGE_KEY_BUS        = 'nettoyages_bus_list';

const NETTOYAGES_INITIAUX = [
  { id: 1, bus: 'Bus 12', type: 'Nettoyage intérieur',  date: '08/07/2026', statut: 'Terminé'    },
  { id: 2, bus: 'Bus 18', type: 'Désinfection',          date: '10/07/2026', statut: 'En attente' }
];

const BUS_INITIAUX = ['Bus 12', 'Bus 18'];

@Component({
  selector: 'app-nettoyages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nettoyages.html',
  styleUrl: './nettoyages.css',
})
export class Nettoyages implements OnInit {

  afficherFormulaire  = false;
  modeModification    = false;
  nettoyageSelectionne: any = null;

  afficherImport    = false;
  isDragging        = false;
  messageImport     = '';
  typeMessageImport = '';

  typesNettoyage = [
    'Nettoyage intérieur',
    'Nettoyage extérieur',
    'Nettoyage complet',
    'Désinfection',
    'Lavage rapide',
    'Nettoyage avant mise en service'
  ];

  nettoyage: any[] = [];
  bus: string[]    = [];

  busChoisi = '';
  type      = '';
  date      = '';
  statut    = '';
  recherche = '';

  // ─── Lifecycle ────────────────────────────────────────────────

  ngOnInit(): void {
    this.chargerDepuisStorage();
  }

  // ─── Persistance ──────────────────────────────────────────────

  private chargerDepuisStorage(): void {
    const nettoyagesJson = localStorage.getItem(STORAGE_KEY_NETTOYAGES);
    const busJson        = localStorage.getItem(STORAGE_KEY_BUS);

    this.nettoyage = nettoyagesJson ? JSON.parse(nettoyagesJson) : [...NETTOYAGES_INITIAUX];
    this.bus       = busJson        ? JSON.parse(busJson)        : [...BUS_INITIAUX];

    // Premier lancement : initialiser le stockage
    if (!nettoyagesJson) this.sauvegarderNettoyages();
    if (!busJson)        this.sauvegarderBus();
  }

  private sauvegarderNettoyages(): void {
    localStorage.setItem(STORAGE_KEY_NETTOYAGES, JSON.stringify(this.nettoyage));
  }

  private sauvegarderBus(): void {
    localStorage.setItem(STORAGE_KEY_BUS, JSON.stringify(this.bus));
  }

  // ─── Filtrage ─────────────────────────────────────────────────

  get nettoyagesFiltres() {
    return this.nettoyage.filter(n =>
      n.bus.toLowerCase().includes(this.recherche.toLowerCase())    ||
      n.type.toLowerCase().includes(this.recherche.toLowerCase())   ||
      n.statut.toLowerCase().includes(this.recherche.toLowerCase())
    );
  }

  // ─── CRUD ─────────────────────────────────────────────────────

  ajouterNettoyage(): void {
    this.afficherFormulaire = true;
    this.modeModification   = false;
    this.busChoisi = '';
    this.type      = '';
    this.date      = '';
    this.statut    = '';
  }

  enregistrerNettoyage(): void {
    if (this.modeModification) {
      this.nettoyageSelectionne.bus    = this.busChoisi;
      this.nettoyageSelectionne.type   = this.type;
      this.nettoyageSelectionne.date   = this.date;
      this.nettoyageSelectionne.statut = this.statut;
    } else {
      const nextId = this.nettoyage.length > 0
        ? Math.max(...this.nettoyage.map(n => n.id)) + 1
        : 1;
      this.nettoyage.push({
        id:     nextId,
        bus:    this.busChoisi,
        type:   this.type,
        date:   this.date,
        statut: this.statut
      });
    }

    this.sauvegarderNettoyages(); // ← persistance

    this.busChoisi = '';
    this.type      = '';
    this.date      = '';
    this.statut    = '';
    this.afficherFormulaire = false;
    this.modeModification   = false;
  }

  modifierNettoyage(n: any): void {
    this.nettoyageSelectionne = n;
    this.busChoisi = n.bus;
    this.type      = n.type;
    this.date      = n.date;
    this.statut    = n.statut;
    this.afficherFormulaire = true;
    this.modeModification   = true;
  }

  supprimerNettoyage(id: any): void {
    this.nettoyage = this.nettoyage.filter(n => n.id != id);
    this.sauvegarderNettoyages(); // ← persistance
  }

  // ─── Import CSV ───────────────────────────────────────────────

  basculerImport(): void {
    this.afficherImport = !this.afficherImport;
    this.messageImport  = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      if (files[0].name.endsWith('.csv')) {
        this.lireFichier(files[0]);
      } else {
        this.messageImport     = 'Veuillez déposer un fichier au format .csv';
        this.typeMessageImport = 'error';
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.lireFichier(input.files[0]);
    }
  }

  private lireFichier(file: File): void {
    const reader = new FileReader();
    reader.onload  = (e: any) => this.traiterCSV(e.target.result);
    reader.onerror = ()       => {
      this.messageImport     = 'Erreur lors de la lecture du fichier.';
      this.typeMessageImport = 'error';
    };
    reader.readAsText(file, 'UTF-8');
  }

  private formaterDate(dateStr: string): string {
    dateStr = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  private traiterCSV(content: string): void {
    try {
      const data = parseCSV(content);
      if (data.length === 0) {
        this.messageImport     = 'Le fichier CSV est vide ou invalide.';
        this.typeMessageImport = 'error';
        return;
      }

      const keys      = Object.keys(data[0]);
      const busKey    = keys.find(k => k.toLowerCase() === 'bus');
      const typeKey   = keys.find(k => k.toLowerCase() === 'type');
      const dateKey   = keys.find(k => k.toLowerCase() === 'date');
      const statutKey = keys.find(k => k.toLowerCase() === 'statut' || k.toLowerCase() === 'status');

      if (!busKey || !typeKey || !dateKey || !statutKey) {
        this.messageImport     = 'Le fichier CSV doit contenir les colonnes : bus, type, date, statut';
        this.typeMessageImport = 'error';
        return;
      }

      let countImported = 0;

      data.forEach(row => {
        let b       = (row[busKey]    || '').toString().trim();
        let t       = (row[typeKey]   || '').toString().trim();
        const d     = this.formaterDate((row[dateKey] || '').toString().trim());
        let s       = (row[statutKey] || '').toString().trim();

        if (b && t && d && s) {
          if (!b.toLowerCase().startsWith('bus')) b = 'Bus ' + b;
          if (!this.bus.includes(b)) {
            this.bus.push(b);
            this.sauvegarderBus();
          }

          const sLower = s.toLowerCase();
          if      (sLower.includes('attente') || sLower.includes('wait'))                          s = 'En attente';
          else if (sLower.includes('cours')   || sLower.includes('progress'))                      s = 'En cours';
          else if (sLower.includes('termin')  || sLower.includes('done') || sLower.includes('fin')) s = 'Terminé';

          const nextId = this.nettoyage.length > 0
            ? Math.max(...this.nettoyage.map(n => n.id)) + 1
            : 1;

          this.nettoyage.push({ id: nextId, bus: b, type: t, date: d, statut: s });
          countImported++;
        }
      });

      this.sauvegarderNettoyages(); // ← persistance

      if (countImported > 0) {
        this.messageImport     = `${countImported} nettoyage(s) importé(s) avec succès.`;
        this.typeMessageImport = 'success';
      } else {
        this.messageImport     = 'Aucune donnée valide trouvée dans le fichier CSV.';
        this.typeMessageImport = 'error';
      }
    } catch (err: any) {
      this.messageImport     = `Erreur lors de l'analyse du CSV : ${err.message || err}`;
      this.typeMessageImport = 'error';
    }
  }

}

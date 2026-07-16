import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { parseCSV } from '../../utils/csv-parser';

const STORAGE_KEY_BUS = 'bus_data';

const BUS_INITIAUX = [
  { id: 1, numero: '12', immatriculation: '12345-A-6', assignation: 'MAN',  statut: 'Actif'   },
  { id: 2, numero: '18', immatriculation: '45678-B-1', assignation: 'BHNS', statut: 'Inactif' }
];

@Component({
  selector: 'app-bus',
  imports: [CommonModule, FormsModule],
  templateUrl: './bus.html',
  styleUrl: './bus.css',
})
export class Bus implements OnInit {

  afficherFormulaire = false;
  modeModification   = false;
  busSelectionne: any = null;

  afficherImport    = false;
  isDragging        = false;
  messageImport     = '';
  typeMessageImport = '';

  numero         = '';
  immatriculation = '';
  assignation    = '';
  recherche      = '';
  statut         = '';

  bus: any[] = [];

  // ─── Lifecycle ────────────────────────────────────────────────

  ngOnInit(): void {
    this.chargerDepuisStorage();
  }

  // ─── Persistance ──────────────────────────────────────────────

  private chargerDepuisStorage(): void {
    const json = localStorage.getItem(STORAGE_KEY_BUS);
    this.bus   = json ? JSON.parse(json) : [...BUS_INITIAUX];
    if (!json) this.sauvegarder();
  }

  private sauvegarder(): void {
    localStorage.setItem(STORAGE_KEY_BUS, JSON.stringify(this.bus));
  }

  // ─── Filtrage ─────────────────────────────────────────────────

  get busFiltres() {
    return this.bus.filter(b =>
      b.numero.toLowerCase().includes(this.recherche.toLowerCase()) ||
      b.immatriculation.toLowerCase().includes(this.recherche.toLowerCase())
    );
  }

  // ─── CRUD ─────────────────────────────────────────────────────

  ajouterBus(): void {
    this.afficherFormulaire = true;
    this.modeModification   = false;
    this.numero         = '';
    this.immatriculation = '';
    this.assignation    = '';
    this.statut         = '';
  }

  enregistrerBus(): void {
    if (this.modeModification) {
      this.busSelectionne.numero          = this.numero;
      this.busSelectionne.immatriculation = this.immatriculation;
      this.busSelectionne.assignation     = this.assignation;
      this.busSelectionne.statut          = this.statut;
    } else {
      const nextId = this.bus.length > 0
        ? Math.max(...this.bus.map(b => b.id)) + 1
        : 1;
      this.bus.push({
        id:             nextId,
        numero:         this.numero,
        immatriculation: this.immatriculation,
        assignation:    this.assignation,
        statut:         this.statut
      });
    }

    this.sauvegarder(); // ← persistance

    this.numero          = '';
    this.immatriculation = '';
    this.assignation     = '';
    this.statut          = '';
    this.afficherFormulaire = false;
    this.modeModification   = false;
  }

  modifierBus(bus: any): void {
    this.busSelectionne     = bus;
    this.numero             = bus.numero;
    this.immatriculation    = bus.immatriculation;
    this.assignation        = bus.assignation;
    this.statut             = bus.statut;
    this.afficherFormulaire = true;
    this.modeModification   = true;
  }

  supprimerBus(id: number): void {
    this.bus = this.bus.filter(b => b.id !== id);
    this.sauvegarder(); // ← persistance
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
    const reader   = new FileReader();
    reader.onload  = (e: any) => this.traiterCSV(e.target.result);
    reader.onerror = ()       => {
      this.messageImport     = 'Erreur lors de la lecture du fichier.';
      this.typeMessageImport = 'error';
    };
    reader.readAsText(file, 'UTF-8');
  }

  private traiterCSV(content: string): void {
    try {
      const data = parseCSV(content);
      if (data.length === 0) {
        this.messageImport     = 'Le fichier CSV est vide ou invalide.';
        this.typeMessageImport = 'error';
        return;
      }

      const keys             = Object.keys(data[0]);
      const numeroKey        = keys.find(k => k.toLowerCase().includes('num') || k.toLowerCase().includes('parc') || k.toLowerCase() === 'numero');
      const immatriculationKey = keys.find(k => k.toLowerCase().includes('immat') || k.toLowerCase() === 'immatriculation');
      const assignationKey   = keys.find(k => k.toLowerCase().includes('assign') || k.toLowerCase() === 'assignation');
      const statutKey        = keys.find(k => k.toLowerCase().includes('statut'));

      if (!numeroKey || !immatriculationKey || !assignationKey) {
        this.messageImport     = 'Le fichier CSV doit contenir les colonnes : numero, immatriculation, assignation, statut';
        this.typeMessageImport = 'error';
        return;
      }

      let countImported  = 0;
      let countDuplicates = 0;

      data.forEach(row => {
        const num   = (row[numeroKey]          || '').toString().trim();
        const immat = (row[immatriculationKey] || '').toString().trim();
        let assign  = (row[assignationKey]     || '').toString().trim().toUpperCase();
        let stat    = (row[statutKey!]         || '').toString().trim();

        if (!['BHNS', 'KING-LONG', 'ISUZU', 'MAN', 'MERCEDES'].includes(assign)) assign = '';

        if (num && immat) {
          const existe = this.bus.some(b => b.immatriculation.toLowerCase() === immat.toLowerCase());
          if (!existe) {
            const nextId = this.bus.length > 0
              ? Math.max(...this.bus.map(b => b.id)) + 1
              : 1;
            this.bus.push({ id: nextId, numero: num, immatriculation: immat, assignation: assign, statut: stat });
            countImported++;
          } else {
            countDuplicates++;
          }
        }
      });

      this.sauvegarder(); // ← persistance

      if (countImported > 0) {
        this.messageImport     = `${countImported} bus importé(s) avec succès.${countDuplicates > 0 ? ` (${countDuplicates} doublon(s) ignoré(s))` : ''}`;
        this.typeMessageImport = 'success';
      } else if (countDuplicates > 0) {
        this.messageImport     = 'Aucun bus importé. Tous les bus existent déjà (doublons).';
        this.typeMessageImport = 'error';
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

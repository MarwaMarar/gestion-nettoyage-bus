import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { parseCSV } from '../../utils/csv-parser';

@Component({
  selector: 'app-bus',
  imports: [CommonModule, FormsModule],
  templateUrl: './bus.html',
  styleUrl: './bus.css',
})
export class Bus {

  afficherFormulaire = false;

  modeModification = false;

  busSelectionne: any = null;


  afficherImport = false;
  isDragging = false;
  messageImport = '';
  typeMessageImport = '';


  numero = '';
  immatriculation = '';
  assignation = '';
  recherche = '';


  bus = [
    {
      id: 1,
      numero: '12',
      immatriculation: '12345-A-6',
      assignation: 'MAN'
    },
    {
      id: 2,
      numero: '18',
      immatriculation: '45678-B-1',
      assignation: 'BHNS'
    }
  ];



  ajouterBus() {
    this.afficherFormulaire = true;
    this.modeModification = false;

    this.numero = '';
    this.immatriculation = '';
    this.assignation = '';
  }

  get busFiltres() {
  return this.bus.filter(bus =>
    bus.numero.toLowerCase().includes(this.recherche.toLowerCase()) ||
    bus.immatriculation.toLowerCase().includes(this.recherche.toLowerCase())
  );
  }

  enregistrerBus() {

    if (this.modeModification) {

      this.busSelectionne.numero = this.numero;
      this.busSelectionne.immatriculation = this.immatriculation;
      this.busSelectionne.assignation = this.assignation;

    } else {

      this.bus.push({
        id: this.bus.length + 1,
        numero: this.numero,
        immatriculation: this.immatriculation,
        assignation: this.assignation
      });

    }


    this.numero = '';
    this.immatriculation = '';
    this.assignation = '';

    this.afficherFormulaire = false;
    this.modeModification = false;

  }


  supprimerBus(id: number) {

    this.bus = this.bus.filter(
      bus => bus.id !== id
    );

  }


  modifierBus(bus: any) {

    this.busSelectionne = bus;

    this.numero = bus.numero;
    this.immatriculation = bus.immatriculation;
    this.assignation= bus.assignation;

    this.afficherFormulaire = true;
    this.modeModification = true;

  }


  basculerImport() {
    this.afficherImport = !this.afficherImport;
    this.messageImport = '';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv')) {
        this.lireFichier(file);
      } else {
        this.messageImport = 'Veuillez déposer un fichier au format .csv';
        this.typeMessageImport = 'error';
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.lireFichier(file);
    }
  }

  private lireFichier(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      this.traiterCSV(text);
    };
    reader.onerror = () => {
      this.messageImport = 'Erreur lors de la lecture du fichier.';
      this.typeMessageImport = 'error';
    };
    reader.readAsText(file, 'UTF-8');
  }

  private traiterCSV(content: string) {
    try {
      const data = parseCSV(content);
      if (data.length === 0) {
        this.messageImport = 'Le fichier CSV est vide ou invalide.';
        this.typeMessageImport = 'error';
        return;
      }

      const firstRow = data[0];
      const keys = Object.keys(firstRow);

      const numeroKey = keys.find(k => k.toLowerCase().includes('num') || k.toLowerCase().includes('parc') || k.toLowerCase() === 'numero');
      const immatriculationKey = keys.find(k => k.toLowerCase().includes('immat') || k.toLowerCase() === 'immatriculation');
      const assignationKey = keys.find(k => k.toLowerCase().includes('assign') || k.toLowerCase() === 'assignation');

      if (!numeroKey || !immatriculationKey || !assignationKey) {
        this.messageImport = 'Le fichier CSV doit contenir les colonnes : numero, immatriculation, assignation';
        this.typeMessageImport = 'error';
        return;
      }

      let countImported = 0;
      let countDuplicates = 0;

      data.forEach(row => {
        const num = (row[numeroKey] || '').toString().trim();
        const immat = (row[immatriculationKey] || '').toString().trim();
        let assign = (row[assignationKey] || '').toString().trim().toUpperCase();

        if (assign !== 'BHNS' && assign !== 'KING-LONG' && assign !== 'ISUZU' && assign !== 'MAN' && assign !== 'MERCEDES') {
          assign = '';
        }

        if (num && immat) {
          const existe = this.bus.some(b => b.immatriculation.toLowerCase() === immat.toLowerCase());
          if (!existe) {
            const nextId = this.bus.length > 0 ? Math.max(...this.bus.map(b => b.id)) + 1 : 1;
            this.bus.push({
              id: nextId,
              numero: num,
              immatriculation: immat,
              assignation: assign
            });
            countImported++;
          } else {
            countDuplicates++;
          }
        }
      });

      if (countImported > 0) {
        this.messageImport = `${countImported} bus importé(s) avec succès.${countDuplicates > 0 ? ` (${countDuplicates} doublon(s) ignoré(s))` : ''}`;
        this.typeMessageImport = 'success';
      } else if (countDuplicates > 0) {
        this.messageImport = 'Aucun bus importé. Tous les bus existent déjà (doublons).';
        this.typeMessageImport = 'error';
      } else {
        this.messageImport = 'Aucune donnée valide trouvée dans le fichier CSV.';
        this.typeMessageImport = 'error';
      }
    } catch (err: any) {
      this.messageImport = `Erreur lors de l'analyse du CSV : ${err.message || err}`;
      this.typeMessageImport = 'error';
    }
  }

}

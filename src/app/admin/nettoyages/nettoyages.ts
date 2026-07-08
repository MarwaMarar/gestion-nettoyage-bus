import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { parseCSV } from '../../utils/csv-parser';

@Component({
  selector: 'app-nettoyages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nettoyages.html',
  styleUrl: './nettoyages.css',
})
export class Nettoyages {

  afficherFormulaire = false;

  modeModification = false;

  nettoyageSelectionne: any = null;

  // Import CSV states
  afficherImport = false;
  isDragging = false;
  messageImport = '';
  typeMessageImport = ''; // 'success' | 'error'


  bus = [
    'Bus 12',
    'Bus 18'
  ];


  nettoyage = [

    {
      id: 1,
      bus: 'Bus 12',
      type: 'Tous les 2 jours',
      date: '08/07/2026',
      statut: 'Terminé'
    },

    {
      id: 2,
      bus: 'Bus 18',
      type: 'Chaque semaine',
      date: '10/07/2026',
      statut: 'En attente'
    }

  ];


  busChoisi = '';
  type = '';
  date = '';
  statut = '';
  recherche = '';



  // ouvrir formulaire ajout
  ajouterNettoyage() {

    this.afficherFormulaire = true;
    this.modeModification = false;

    this.busChoisi = '';
    this.type = '';
    this.date = '';
    this.statut = '';

  }

get nettoyagesFiltres() {

  return this.nettoyage.filter(n =>
    n.bus.toLowerCase().includes(this.recherche.toLowerCase()) ||
    n.type.toLowerCase().includes(this.recherche.toLowerCase()) ||
    n.statut.toLowerCase().includes(this.recherche.toLowerCase())
  );

}

  // ajouter ou modifier
  enregistrerNettoyage() {


    if (this.modeModification) {


      this.nettoyageSelectionne.bus = this.busChoisi;
      this.nettoyageSelectionne.type = this.type;
      this.nettoyageSelectionne.date = this.date;
      this.nettoyageSelectionne.statut = this.statut;


    } else {


      this.nettoyage.push({

        id: this.nettoyage.length + 1,
        bus: this.busChoisi,
        type: this.type,
        date: this.date,
        statut: this.statut

      });


    }



    this.busChoisi = '';
    this.type = '';
    this.date = '';
    this.statut = '';

    this.afficherFormulaire = false;
    this.modeModification = false;

  }




  // supprimer nettoyage
  supprimerNettoyage(id: any) {

    this.nettoyage = this.nettoyage.filter(
      n => n.id != id
    );

  }




  // modifier nettoyage
  modifierNettoyage(n: any) {


    this.nettoyageSelectionne = n;


    this.busChoisi = n.bus;
    this.type = n.type;
    this.date = n.date;
    this.statut = n.statut;


    this.afficherFormulaire = true;
    this.modeModification = true;


  }

  // basculer la zone d'importation
  basculerImport() {
    this.afficherImport = !this.afficherImport;
    this.messageImport = '';
  }

  // drag-and-drop events
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  // dragleave event
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

  private formaterDate(dateStr: string): string {
    dateStr = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
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
      
      const busKey = keys.find(k => k.toLowerCase() === 'bus');
      const typeKey = keys.find(k => k.toLowerCase() === 'type');
      const dateKey = keys.find(k => k.toLowerCase() === 'date');
      const statutKey = keys.find(k => k.toLowerCase() === 'statut' || k.toLowerCase() === 'status');

      if (!busKey || !typeKey || !dateKey || !statutKey) {
        this.messageImport = 'Le fichier CSV doit contenir les colonnes : bus, type, date, statut';
        this.typeMessageImport = 'error';
        return;
      }

      let countImported = 0;

      data.forEach(row => {
        let b = (row[busKey] || '').toString().trim();
        let t = (row[typeKey] || '').toString().trim();
        const d = this.formaterDate((row[dateKey] || '').toString().trim());
        let s = (row[statutKey] || '').toString().trim();

        if (b && t && d && s) {
          if (!b.toLowerCase().startsWith('bus')) {
            b = 'Bus ' + b;
          }
          if (!this.bus.includes(b)) {
            this.bus.push(b);
          }

          const tLower = t.toLowerCase();
          if (tLower.includes('2 jour') || tLower.includes('2 jours') || tLower.includes('deux jours')) {
            t = 'Tous les 2 jours';
          } else if (tLower.includes('semaine') || tLower.includes('hebdo')) {
            t = 'Chaque semaine';
          } else if (tLower.includes('mois') || tLower.includes('mensuel')) {
            t = 'Chaque mois';
          }

          const sLower = s.toLowerCase();
          if (sLower.includes('attente') || sLower.includes('wait')) {
            s = 'En attente';
          } else if (sLower.includes('cours') || sLower.includes('progress')) {
            s = 'En cours';
          } else if (sLower.includes('termin') || sLower.includes('done') || sLower.includes('fin')) {
            s = 'Terminé';
          }

          const nextId = this.nettoyage.length > 0 ? Math.max(...this.nettoyage.map(n => n.id)) + 1 : 1;
          this.nettoyage.push({
            id: nextId,
            bus: b,
            type: t,
            date: d,
            statut: s
          });
          countImported++;
        }
      });

      if (countImported > 0) {
        this.messageImport = `${countImported} nettoyage(s) importé(s) avec succès.`;
        this.typeMessageImport = 'success';
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

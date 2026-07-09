import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { parseCSV } from '../../utils/csv-parser';

@Component({
  selector: 'app-utilisateurs',
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateurs.html',
  styleUrl: './utilisateurs.css',
})
export class Utilisateurs {

  afficherFormulaire = false;

  modeModification = false;

  utilisateurSelectionne: any = null;


  afficherImport = false;
  isDragging = false;
  messageImport = '';
  typeMessageImport = '';


  nom = '';
  email = ''
  role = '';
  recherche = '';



  utilisateurs = [
    {
      nom: 'Admin',
      email: 'admin@gmail.com',
      role: 'Administrateur'



    },
    {
      nom: 'Ahmed',
      email: 'ahmed@gmail.com',
      role: 'Nettoyeur'
    },
  ];


  ajouterUtilisateur() {

    this.afficherFormulaire = true;
    this.modeModification = false;

    this.nom  = '';
    this.email = '';
    this.role = '';

  }

get utilisateursFiltres() {
  return this.utilisateurs.filter(utilisateur =>
    utilisateur.nom.toLowerCase().includes(this.recherche.toLowerCase()) ||
    utilisateur.email.toLowerCase().includes(this.recherche.toLowerCase())
  );
}


  enregistrerUtilisateur() {

    if (this.modeModification) {

      this.utilisateurSelectionne.nom = this.nom;
      this.utilisateurSelectionne.email = this.email;
      this.utilisateurSelectionne.role = this.role;

    } else {

      this.utilisateurs.push({
        nom: this.nom,
        email: this.email,
        role: this.role
      });

    }


    this.nom = '';
    this.email = '';
    this.role = '';

    this.afficherFormulaire = false;
    this.modeModification = false;

  }



  supprimerUtilisateur(email: string) {

    this.utilisateurs = this.utilisateurs.filter(
      utilisateur => utilisateur.email !== email
    );

  }



  modifierUtilisateur(utilisateur: any) {

    this.utilisateurSelectionne = utilisateur;

    this.nom = utilisateur.nom;
    this.email = utilisateur.email;
    this.role = utilisateur.role;

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

      const nomKey = keys.find(k => k.toLowerCase().includes('nom') || k.toLowerCase() === 'name');
      const emailKey = keys.find(k => k.toLowerCase().includes('mail') || k.toLowerCase() === 'email');
      const roleKey = keys.find(k => k.toLowerCase().includes('role') || k.toLowerCase() === 'rôle');

      if (!nomKey || !emailKey || !roleKey) {
        this.messageImport = 'Le fichier CSV doit contenir les colonnes : nom, email, role';
        this.typeMessageImport = 'error';
        return;
      }

      let countImported = 0;
      let countDuplicates = 0;

      data.forEach(row => {
        const uNom = (row[nomKey] || '').toString().trim();
        const uEmail = (row[emailKey] || '').toString().trim();
        let uRole = (row[roleKey] || '').toString().trim();

        if (uRole.toLowerCase().startsWith('admin')) {
          uRole = 'Administrateur';
        } else if (uRole.toLowerCase().startsWith('super')) {
          uRole = 'Superviseur';
        } else {
          uRole = 'Nettoyeur';
        }

        if (uNom && uEmail) {
          const existe = this.utilisateurs.some(u => u.email.toLowerCase() === uEmail.toLowerCase());
          if (!existe) {
            this.utilisateurs.push({
              nom: uNom,
              email: uEmail,
              role: uRole
            });
            countImported++;
          } else {
            countDuplicates++;
          }
        }
      });

      if (countImported > 0) {
        this.messageImport = `${countImported} utilisateur(s) importé(s) avec succès.${countDuplicates > 0 ? ` (${countDuplicates} doublon(s) ignoré(s))` : ''}`;
        this.typeMessageImport = 'success';
      } else if (countDuplicates > 0) {
        this.messageImport = 'Aucun utilisateur importé. Tous les emails existent déjà (doublons).';
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

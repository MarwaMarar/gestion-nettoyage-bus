import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { parseCSV } from '../../utils/csv-parser';

const STORAGE_KEY_UTILISATEURS = 'utilisateurs_data';

const UTILISATEURS_INITIAUX = [
  {
    id: 1,
    nom: 'Ahmed Alami',
    matricule: 'M001',
    telephone: '0612345678',
    email: 'ahmed@alsa.ma',
    login: 'ahmed',
    role: 'Nettoyeur',
    actif: true
  },
  {
    id: 2,
    nom: 'Mohamed Tazi',
    matricule: 'M002',
    telephone: '0687654321',
    email: 'mohamed@alsa.ma',
    login: 'mohamed',
    role: 'Superviseur',
    actif: true
  },
  {
    id: 3,
    nom: 'Sara Bennani',
    matricule: 'M003',
    telephone: '0611223344',
    email: 'sara@alsa.ma',
    login: 'sara',
    role: 'Nettoyeur',
    actif: true
  },
  {
    id: 4,
    nom: 'Administrateur Alsa',
    matricule: 'ADMIN01',
    telephone: '0600000000',
    email: 'admin@alsa.ma',
    login: 'admin',
    role: 'Administrateur',
    actif: true
  }
];

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './utilisateurs.html',
  styleUrl: './utilisateurs.css',
})
export class Utilisateurs implements OnInit {

  afficherFormulaire = false;
  modeModification = false;
  utilisateurSelectionne: any = null;

  afficherImport = false;
  isDragging = false;
  messageImport = '';
  typeMessageImport = '';

  nom = '';
  matricule = '';
  telephone = '';
  email = '';
  login = '';
  role = '';
  recherche = '';

  utilisateurs: any[] = [];

  ngOnInit(): void {
    this.chargerDepuisStorage();
  }

  chargerDepuisStorage(): void {
    const json = localStorage.getItem(STORAGE_KEY_UTILISATEURS);
    this.utilisateurs = json ? JSON.parse(json) : [...UTILISATEURS_INITIAUX];
    if (!json) {
      this.sauvegarder();
    }
  }

  sauvegarder(): void {
    localStorage.setItem(STORAGE_KEY_UTILISATEURS, JSON.stringify(this.utilisateurs));
  }

  get utilisateursFiltres() {
    return this.utilisateurs.filter(utilisateur =>
      (utilisateur.nom ?? '').toLowerCase().includes(this.recherche.toLowerCase()) ||
      (utilisateur.email ?? '').toLowerCase().includes(this.recherche.toLowerCase()) ||
      (utilisateur.matricule ?? '').toLowerCase().includes(this.recherche.toLowerCase())
    );
  }

  ajouterUtilisateur(): void {
    this.afficherFormulaire = true;
    this.modeModification = false;
    this.nom = '';
    this.matricule = '';
    this.telephone = '';
    this.email = '';
    this.login = '';
    this.role = '';
  }

  enregistrerUtilisateur(): void {
    if (this.modeModification) {
      this.utilisateurSelectionne.nom = this.nom;
      this.utilisateurSelectionne.matricule = this.matricule;
      this.utilisateurSelectionne.telephone = this.telephone;
      this.utilisateurSelectionne.email = this.email;
      this.utilisateurSelectionne.login = this.login;
      this.utilisateurSelectionne.role = this.role;
    } else {
      const nextId = this.utilisateurs.length > 0 
        ? Math.max(...this.utilisateurs.map(u => u.id)) + 1 
        : 1;

      this.utilisateurs.push({
        id: nextId,
        nom: this.nom,
        matricule: this.matricule,
        telephone: this.telephone,
        email: this.email,
        login: this.login,
        role: this.role,
        actif: true
      });
    }

    this.sauvegarder();

    this.afficherFormulaire = false;
    this.modeModification = false;
    this.nom = '';
    this.matricule = '';
    this.telephone = '';
    this.email = '';
    this.login = '';
    this.role = '';
  }

  modifierUtilisateur(u: any): void {
    this.utilisateurSelectionne = u;
    this.nom = u.nom;
    this.matricule = u.matricule;
    this.telephone = u.telephone;
    this.email = u.email;
    this.login = u.login;
    this.role = u.role;

    this.afficherFormulaire = true;
    this.modeModification = true;
  }

  supprimerUtilisateur(id: number): void {
    this.utilisateurs = this.utilisateurs.filter(u => u.id !== id);
    this.sauvegarder();
  }

  basculerImport(): void {
    this.afficherImport = !this.afficherImport;
    this.messageImport = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.lireFichier(files[0]);
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
    reader.onload = (e: any) => {
      this.traiterCSV(e.target.result);
    };
    reader.readAsText(file);
  }

  private traiterCSV(content: string): void {
    try {
      const data = parseCSV(content);
      data.forEach((row: any) => {
        const nextId = this.utilisateurs.length > 0 
          ? Math.max(...this.utilisateurs.map(u => u.id)) + 1 
          : 1;

        // Map CSV role strings to UI expected role values
        let formattedRole = 'Nettoyeur';
        const roleStr = (row.role || '').toLowerCase();
        if (roleStr.includes('admin')) {
          formattedRole = 'Administrateur';
        } else if (roleStr.includes('super')) {
          formattedRole = 'Superviseur';
        }

        this.utilisateurs.push({
          id: nextId,
          nom: row.nom || '',
          email: row.email || '',
          role: formattedRole,
          matricule: row.matricule || '',
          telephone: row.telephone || '',
          login: row.login || '',
          actif: true
        });
      });

      this.sauvegarder();
      this.messageImport = `${data.length} utilisateur(s) importé(s) avec succès.`;
      this.typeMessageImport = 'success';
    } catch (error) {
      console.error(error);
      this.messageImport = "Erreur lors de l'import du fichier CSV.";
      this.typeMessageImport = 'error';
    }
  }
}

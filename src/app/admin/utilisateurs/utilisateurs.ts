import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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


  nom = '';
  email = '';
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
      role: 'Agent'
    }
  ];


  // ouvrir formulaire ajout
  ajouterUtilisateur() {

    this.afficherFormulaire = true;
    this.modeModification = false;

    this.nom = '';
    this.email = '';
    this.role = '';

  }

get utilisateursFiltres() {
  return this.utilisateurs.filter(utilisateur =>
    utilisateur.nom.toLowerCase().includes(this.recherche.toLowerCase()) ||
    utilisateur.email.toLowerCase().includes(this.recherche.toLowerCase())
  );
}

  // ajouter ou modifier
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


  // supprimer
  supprimerUtilisateur(email: string) {

    this.utilisateurs = this.utilisateurs.filter(
      utilisateur => utilisateur.email !== email
    );

  }


  // modifier
  modifierUtilisateur(utilisateur: any) {

    this.utilisateurSelectionne = utilisateur;

    this.nom = utilisateur.nom;
    this.email = utilisateur.email;
    this.role = utilisateur.role;

    this.afficherFormulaire = true;
    this.modeModification = true;

  }

}

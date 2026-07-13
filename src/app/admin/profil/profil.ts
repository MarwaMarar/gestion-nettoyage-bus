import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil {


  modifierOuvert = false;

  motDePasseOuvert = false;

  voirAncien = false;

  voirNouveau = false;

  voirConfirmation = false;



  nom = "Administrateur";
  email = "admin@alsaclean.com";
  telephone = "06 00 00 00 00";



  ancienMotDePasse = "";
  nouveauMotDePasse = "";
  confirmerMotDePasse = "";



  ouvrirModifier(){

    this.modifierOuvert = true;
    this.motDePasseOuvert = false;

  }



  ouvrirMotDePasse(){

    this.motDePasseOuvert = true;
    this.modifierOuvert = false;

  }



  fermer(){

    this.modifierOuvert = false;
    this.motDePasseOuvert = false;

  }



  sauvegarderProfil(){

    console.log("Profil modifié");

    this.modifierOuvert = false;

  }



  changerMotDePasse(){

    if(this.nouveauMotDePasse === this.confirmerMotDePasse){

      console.log("Mot de passe changé");

      this.motDePasseOuvert = false;

    }
    else{

      console.log("Les mots de passe ne correspondent pas");

    }

  }

  toggleAncien(){

  this.voirAncien = !this.voirAncien;

  }


  toggleNouveau(){

  this.voirNouveau = !this.voirNouveau;

  }


  toggleConfirmation(){

  this.voirConfirmation = !this.voirConfirmation;

  }


}

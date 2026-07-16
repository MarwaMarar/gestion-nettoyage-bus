import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../../service/utilisateur.service';
import { parseCSV } from '../../utils/csv-parser';


@Component({
  selector: 'app-utilisateurs',
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



  constructor(
    private utilisateurService: UtilisateurService
  ) {}


ngOnInit(): void {
  this.chargerUtilisateurs();
}
chargerUtilisateurs() {

  this.utilisateurService.getUtilisateurs()
    .subscribe((data: any[]) => {

      console.log("DATA ARRIVED:", data);

      this.utilisateurs = data;

      console.log("USERS VARIABLE:", this.utilisateurs);

    });

}

get utilisateursFiltres() {

  return this.utilisateurs.filter(utilisateur =>
    (utilisateur.nom ?? '').toLowerCase()
    .includes(this.recherche.toLowerCase()) ||

    (utilisateur.email ?? '').toLowerCase()
    .includes(this.recherche.toLowerCase())
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


    const utilisateur = {


      nom: this.nom,

      matricule: this.matricule,

      telephone: this.telephone,

      email: this.email,

      login: this.login,


      role: this.role === 'Administrateur'
        ? 'ADMIN'
        : this.role === 'Nettoyeur'
        ? 'NETTOYEUR'
        : 'SUPERVISEUR',


      actif: true


    };




    if(this.modeModification){


      this.utilisateurService
      .modifierUtilisateur(
        this.utilisateurSelectionne.id,
        utilisateur
      )
      .subscribe(()=>{

        this.chargerUtilisateurs();

      });


    }

    else{


      this.utilisateurService
      .ajouterUtilisateur(utilisateur)
      .subscribe(()=>{

        this.chargerUtilisateurs();

      });


    }



    this.afficherFormulaire = false;

    this.modeModification = false;


  }





  modifierUtilisateur(u:any): void {


    this.utilisateurSelectionne = u;


    this.nom = u.nom;
    this.matricule = u.matricule;
    this.telephone = u.telephone;
    this.email = u.email;
    this.login = u.login;



    if(u.role === 'ADMIN'){

      this.role = 'Administrateur';

    }

    else if(u.role === 'NETTOYEUR'){

      this.role = 'Nettoyeur';

    }

    else{

      this.role = 'Superviseur';

    }


    this.afficherFormulaire = true;

    this.modeModification = true;


  }





  supprimerUtilisateur(id:number): void {


    this.utilisateurService
    .supprimerUtilisateur(id)
    .subscribe(()=>{


      this.chargerUtilisateurs();


    });


  }





  basculerImport(): void {

    this.afficherImport =
    !this.afficherImport;


    this.messageImport = '';

  }




  onDragOver(event:DragEvent): void {

    event.preventDefault();

    this.isDragging = true;

  }




  onDragLeave(event:DragEvent): void {

    event.preventDefault();

    this.isDragging = false;

  }





  onDrop(event:DragEvent): void {


    event.preventDefault();


    this.isDragging = false;


    const files =
    event.dataTransfer?.files;


    if(files && files.length > 0){

      this.lireFichier(files[0]);

    }


  }





  onFileSelected(event:Event): void {


    const input =
    event.target as HTMLInputElement;


    if(input.files && input.files.length > 0){

      this.lireFichier(input.files[0]);

    }


  }





  private lireFichier(file:File): void {


    const reader =
    new FileReader();


    reader.onload = (e:any)=>{


      this.traiterCSV(e.target.result);


    };


    reader.readAsText(file);


  }






  private traiterCSV(content:string): void {


    try{


      const data =
      parseCSV(content);



      data.forEach((row:any)=>{


        const utilisateur = {


          nom: row.nom,

          email: row.email,

          role: row.role,


          matricule:'',

          telephone:'',

          login:'',

          actif:true


        };



        this.utilisateurService
        .ajouterUtilisateur(utilisateur)
        .subscribe(()=>{

          this.chargerUtilisateurs();

        });



      });



    }

    catch(error){

      console.error(error);

    }


  }



}

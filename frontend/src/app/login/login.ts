import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email: string = '';
  password: string = '';

  messageErreur: string = '';
  afficherMotDePasse: boolean = false;

  constructor(private router: Router) {}


  seConnecter() {

    const emailAdmin = "admin@alsa.ma";
    const passwordAdmin = "123456";


    if(this.email === emailAdmin && this.password === passwordAdmin) {

      localStorage.setItem('adminConnecte', 'true');

      this.router.navigate(['/admin/tableau-de-bord']);

    } else {

      this.messageErreur = "Email ou mot de passe incorrect";

    }

  }

}

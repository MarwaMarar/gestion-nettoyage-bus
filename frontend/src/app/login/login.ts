import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

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

  constructor(private router: Router, private auth: AuthService) {}


  seConnecter() {

    if(this.auth.login(this.email, this.password)) {
      this.router.navigate(['/admin/tableau-de-bord']);

    } else {

      this.messageErreur = "Email ou mot de passe incorrect";

    }

  }

}
